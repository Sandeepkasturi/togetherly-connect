import { useState, useEffect, useRef, useCallback } from 'react';
// We use type-only imports for type safety, and dynamic import for the implementation.
import type Peer from 'peerjs';
import type { DataConnection, MediaConnection } from 'peerjs';

export interface Reaction {
  emoji: string;
  by: string;
}

export interface Message {
  id: string;
  sender: 'me' | 'them' | 'system';
  content: string;
  timestamp: string;
  nickname?: string;
  reactions?: Reaction[];
  // New props for file sharing
  messageType?: 'text' | 'file' | 'system';
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileData?: string; // base64 encoded
}

export type DataType = {
  type: 'chat';
  payload: Omit<Message, 'sender'>;
} | {
  type: 'file';
  payload: {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileData: string;
    timestamp: string;
    nickname?: string;
  };
} | {
  type: 'video';
  payload: string;
} | {
  type: 'system';
  payload: string;
} | {
  type: 'nickname';
  payload: string;
} | {
  type: 'reaction';
  payload: {
    messageId: string;
    reaction: Reaction;
  };
} | {
  type: 'player_state';
  payload: {
    event: 'play' | 'pause';
    currentTime: number;
  };
} | {
  type: 'playlist_share';
  payload: {
    playlist: any;
    sharedBy: string;
    timestamp: string;
  };
} | {
  type: 'browser_sync';
  payload: {
    url: string;
    action: 'navigate' | 'scroll';
    scrollPosition?: { x: number; y: number };
  };
} | {
  type: 'screen_share_start';
  payload: {
    nickname: string;
  };
} | {
  type: 'screen_share_stop';
  payload: {
    nickname: string;
  };
};

// Generate a fallback peer ID if PeerJS server fails
const generateFallbackPeerId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `togetherly${timestamp}${randomPart}`;
};

export const usePeer = () => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState('');
  const [conn, setConn] = useState<DataConnection | null>(null);
  const [data, setData] = useState<DataType | null>(null);
  const peerInstance = useRef<Peer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'failed'>('disconnected');
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const mediaCallInstance = useRef<MediaConnection | null>(null);

  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [remoteScreenStream, setRemoteScreenStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenCallInstance = useRef<MediaConnection | null>(null);

  const [incomingConn, setIncomingConn] = useState<DataConnection | null>(null);

  const setupConnectionHandlers = useCallback((connection: DataConnection) => {
    const onOpen = () => {
      console.log('Connection opened with:', connection.peer);
      setIsConnected(true);
      setConnectionState('connected');
      setData({ type: 'system', payload: `Connected to ${connection.peer}` });
    };

    const onData = (receivedData: unknown) => {
      setData(receivedData as DataType);
    };

    const onClose = () => {
      console.log('Connection closed with:', connection.peer);
      setIsConnected(false);
      setConnectionState('disconnected');
      setConn(null);
      setData({ type: 'system', payload: 'Peer has disconnected.' });
    };

    const onError = (err: Error) => {
      console.error('Connection error:', err);
      setConnectionState('failed');
      setData({ type: 'system', payload: `Connection error: ${err.message}` });
    };

    connection.on('open', onOpen);
    connection.on('data', onData);
    connection.on('close', onClose);
    connection.on('error', onError);
    
    // This handles the case where the connection is already open
    if (connection.open) {
      onOpen();
    }

    return () => {
      connection.off('open', onOpen);
      connection.off('data', onData);
      connection.off('close', onClose);
      connection.off('error', onError);
    };
  }, []);

  const endCall = useCallback(() => {
    if (mediaCallInstance.current) {
      mediaCallInstance.current.close();
    }
    setLocalStream(prevStream => {
      if (prevStream) {
        prevStream.getTracks().forEach(track => track.stop());
      }
      return null;
    });
    setRemoteStream(null);
    setIsCallActive(false);
    mediaCallInstance.current = null;
    setData({ type: 'system', payload: 'Call ended.' });
  }, []);

  const acceptConnection = useCallback(() => {
    if (incomingConn) {
      console.log('Accepting connection from:', incomingConn.peer);
      setConn(incomingConn);
      setIncomingConn(null);
      
      // Set up handlers immediately after accepting
      setTimeout(() => {
        if (incomingConn.open) {
          setIsConnected(true);
          setConnectionState('connected');
          setData({ type: 'system', payload: `Connected to ${incomingConn.peer}` });
        }
      }, 100);
    }
  }, [incomingConn]);

  const rejectConnection = useCallback(() => {
    if (incomingConn) {
      console.log('Rejecting connection from:', incomingConn.peer);
      incomingConn.close();
      setIncomingConn(null);
      setData({ type: 'system', payload: 'Connection request rejected.' });
    }
  }, [incomingConn]);

  // Manual reconnect function
  const onManualReconnect = useCallback(() => {
    if (peerInstance.current && !peerInstance.current.destroyed) {
      console.log('Manual reconnect triggered');
      peerInstance.current.reconnect();
    } else {
      // Reinitialize peer if it's destroyed
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    const initializePeer = async () => {
      try {
        // Check if we have a stored peer ID
        const storedPeerId = localStorage.getItem('togetherlyPeerId');
        
        // Dynamically import PeerJS to solve module resolution issues with Vite
        const { default: Peer } = await import('peerjs');

        // Try multiple server configurations for better reliability
        const serverConfigs = [
          {
            host: 'peerjs-server-8gvhk6w8o-peerjs.vercel.app',
            port: 443,
            path: '/',
            secure: true
          },
          {
            host: '0.peerjs.com',
            port: 443,
            path: '/',
            secure: true
          },
          {
            host: 'peerjs-server.herokuapp.com',
            port: 443,
            path: '/peerjs',
            secure: true
          }
        ];

        let peerInitialized = false;
        let attempts = 0;

        const tryInitializePeer = async (configIndex = 0) => {
          if (configIndex >= serverConfigs.length) {
            // All servers failed, use fallback ID
            const fallbackId = storedPeerId || generateFallbackPeerId();
            console.log('All PeerJS servers failed, using fallback ID:', fallbackId);
            setPeerId(fallbackId);
            localStorage.setItem('togetherlyPeerId', fallbackId);
            setData({ type: 'system', payload: 'Using offline mode. Share your ID to connect when both users are online.' });
            return;
          }

          const config = serverConfigs[configIndex];
          console.log(`Initializing peer with config ${configIndex + 1}/${serverConfigs.length}:`, config.host);

          const newPeer = new Peer(storedPeerId || undefined, {
            ...config,
            config: {
              iceServers: [
                // Google STUN servers
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                // Additional STUN servers for better compatibility
                { urls: 'stun:stun.cloudflare.com:3478' },
                { urls: 'stun:stun.mozilla.org:3478' },
                // Public TURN servers (fallback for restricted networks)
                {
                  urls: 'turn:turn.bistri.com:80',
                  credential: 'homeo',
                  username: 'homeo'
                }
              ],
              sdpSemantics: 'unified-plan',
              iceCandidatePoolSize: 10,
              bundlePolicy: 'max-bundle',
              rtcpMuxPolicy: 'require'
            },
            debug: 1,
            pingInterval: 5000
          });

          // Set timeout for peer initialization
          const initTimeout = setTimeout(() => {
            if (!peerInitialized) {
              console.log(`Peer initialization timeout for server ${configIndex + 1}, trying next...`);
              newPeer.destroy();
              tryInitializePeer(configIndex + 1);
            }
          }, 10000); // 10 second timeout

          newPeer.on('open', (id: string) => {
            if (peerInitialized) return;
            peerInitialized = true;
            clearTimeout(initTimeout);
            
            console.log('Peer opened with ID:', id);
            console.log('Generated new peer ID:', id);
            setPeerId(id);
            localStorage.setItem('togetherlyPeerId', id);
            peerInstance.current = newPeer;
            setPeer(newPeer);
            setData({ type: 'system', payload: `Peer ID generated: ${id}` });
          });

          newPeer.on('error', (error: any) => {
            clearTimeout(initTimeout);
            console.error(`Peer error on server ${configIndex + 1}:`, error);
            
            if (!peerInitialized) {
              console.log(`Server ${configIndex + 1} failed, trying next...`);
              newPeer.destroy();
              tryInitializePeer(configIndex + 1);
              return;
            }

            setData({ type: 'system', payload: `Peer error: ${error.message || 'Connection failed'}` });
            
            // Enhanced error recovery for connected peers
            if (error.type === 'network' || error.type === 'disconnected' || error.type === 'server-error') {
              console.log('Network error, retrying in 3000ms... (1/3)');
              setTimeout(() => {
                if (!newPeer.destroyed) {
                  console.log('Attempting to reconnect after error...');
                  newPeer.reconnect();
                }
              }, 3000);
            }
          });

          newPeer.on('disconnected', () => {
            if (!peerInitialized) return;
            
            console.log('Peer disconnected, attempting to reconnect...');
            setData({ type: 'system', payload: 'Connection lost, reconnecting...' });
            
            // Attempt to reconnect with exponential backoff
            attempts = 0;
            const maxAttempts = 3;
            const reconnectWithBackoff = () => {
              if (attempts < maxAttempts && !newPeer.destroyed) {
                attempts++;
                const delay = Math.min(1000 * Math.pow(2, attempts), 10000);
                setTimeout(() => {
                  console.log(`Reconnection attempt ${attempts}/${maxAttempts}`);
                  try {
                    newPeer.reconnect();
                  } catch (error) {
                    console.error('Reconnection failed:', error);
                    if (attempts >= maxAttempts) {
                      setData({ type: 'system', payload: 'Reconnection failed. Please refresh the page.' });
                    }
                  }
                }, delay);
              }
            };
            reconnectWithBackoff();
          });

          // ... keep existing code for connection and call handlers
          newPeer.on('connection', (newConn: DataConnection) => {
            console.log('Incoming connection from:', newConn.peer);
            
            if (conn?.open || isCallActive || incomingConn) {
              console.log('Rejecting connection - already busy');
              newConn.close();
              return;
            }
            
            const connectionTimeout = setTimeout(() => {
              if (!newConn.open) {
                console.log('Connection request timed out after 5 minutes');
                newConn.close();
                setIncomingConn(null);
                setData({ type: 'system', payload: 'Connection request timed out after 5 minutes.' });
              }
            }, 300000);

            newConn.on('open', () => {
              clearTimeout(connectionTimeout);
              console.log('Incoming connection established');
            });

            newConn.on('error', (err) => {
              console.error('Incoming connection error:', err);
              clearTimeout(connectionTimeout);
              setIncomingConn(null);
              setData({ type: 'system', payload: `Connection error: ${err.message}` });
            });

            setData({
              type: 'system', 
              payload: `Incoming connection from ${newConn.metadata?.nickname || newConn.peer}`
            });
            setIncomingConn(newConn);
          });

          const setupCallListeners = (call: MediaConnection) => {
            call.on('stream', (stream) => {
              setRemoteStream(stream);
            });
            call.on('close', () => {
              endCall();
            });
            call.on('error', (err) => {
              console.error('Call error:', err);
              setData({ type: 'system', payload: `Call error: ${err.message}` });
              endCall();
            });
            mediaCallInstance.current = call;
            setIsCallActive(true);
          };

          newPeer.on('call', (incomingCall: MediaConnection) => {
            const callType = incomingCall.metadata?.callType === 'audio' ? 'audio' : 'video';
            setData({ type: 'system', payload: `Incoming ${callType} call from ${incomingCall.peer}...` });
            
            const constraints = { video: callType === 'video', audio: true };

            navigator.mediaDevices.getUserMedia(constraints)
              .then(stream => {
                setLocalStream(stream);
                incomingCall.answer(stream);
                setupCallListeners(incomingCall);
              })
              .catch(err => {
                console.error(`Failed to get local stream for incoming ${callType} call`, err);
                setData({ type: 'system', payload: 'Could not start camera/mic.' });
              });
          });
        };

        await tryInitializePeer();

      } catch (error) {
        console.error('Failed to initialize peer:', error);
        
        // Use fallback ID generation
        const fallbackId = localStorage.getItem('togetherlyPeerId') || generateFallbackPeerId();
        console.log('Using fallback peer ID:', fallbackId);
        setPeerId(fallbackId);
        localStorage.setItem('togetherlyPeerId', fallbackId);
        setData({ type: 'system', payload: 'Using offline mode. Connection will work when both users are online.' });
      }
    };

    initializePeer();

    return () => {
      if (peerInstance.current) {
        peerInstance.current.destroy();
      }
    };
  }, [endCall]);

  useEffect(() => {
    if (!conn) return;

    console.log('Setting up handlers for connection:', conn.peer);
    const cleanup = setupConnectionHandlers(conn);

    return cleanup;
  }, [conn, setupConnectionHandlers]);

  const connectToPeer = useCallback((remoteId: string, metadata: { nickname: string }) => {
    if (!peer) {
      console.error('Peer not initialized');
      setData({ type: 'system', payload: 'Peer not ready. Please wait and try again.' });
      return;
    }
    
    if (!remoteId.trim()) {
      setData({ type: 'system', payload: 'Please enter a valid Peer ID' });
      return;
    }

    console.log('Connecting to peer:', remoteId);
    setConnectionState('connecting');
    setData({ type: 'system', payload: `Connecting to ${remoteId}...` });
    
    try {
      const newConn = peer.connect(remoteId, { 
        metadata,
        reliable: true,
        serialization: 'json'
      });

      const connectionTimeout = setTimeout(() => {
        if (!newConn.open) {
          console.log('Connection attempt timed out after 30 seconds');
          newConn.close();
          setConnectionState('failed');
          setData({ type: 'system', payload: 'Connection timed out. Please check the Peer ID and try again.' });
        }
      }, 30000); // 30 seconds timeout

      newConn.on('open', () => {
        clearTimeout(connectionTimeout);
        console.log('Successfully connected to:', remoteId);
        setConnectionState('connected');
        setData({ type: 'system', payload: `Successfully connected to ${remoteId}` });
      });

      newConn.on('error', (err) => {
        clearTimeout(connectionTimeout);
        console.error('Connection failed:', err);
        setConnectionState('failed');
        setData({ type: 'system', payload: `Failed to connect: ${err.message || 'Please check the Peer ID and try again.'}` });
      });

      setConn(newConn);
    } catch (error) {
      console.error('Error creating connection:', error);
      setConnectionState('failed');
      setData({ type: 'system', payload: 'Failed to create connection. Please try again.' });
    }
  }, [peer]);
  
  const sendData = useCallback((data: DataType) => {
    if (conn && conn.open) {
      console.log('Sending data:', data);
      try {
        conn.send(data);
      } catch (error) {
        console.error('Failed to send data:', error);
        setData({ type: 'system', payload: 'Failed to send message. Connection may be unstable.' });
      }
    } else {
      console.log('Connection not ready, data will be queued');
      if (conn) {
        const openHandler = () => {
          try {
            conn.send(data);
            conn.off('open', openHandler);
          } catch (error) {
            console.error('Failed to send queued data:', error);
          }
        };
        conn.on('open', openHandler);
      }
    }
  }, [conn]);

  const startCall = useCallback((type: 'audio' | 'video') => {
    if (!peer || !conn) return;

    const setupCallListeners = (call: MediaConnection) => {
        call.on('stream', (stream) => {
          setRemoteStream(stream);
        });
        call.on('close', () => {
          endCall();
        });
        call.on('error', (err) => {
          console.error('Call error:', err);
          setData({ type: 'system', payload: `Call error: ${err.message}` });
          endCall();
        });
        mediaCallInstance.current = call;
        setIsCallActive(true);
    };
    
    const constraints = { video: type === 'video', audio: true };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            setLocalStream(stream);
            const outgoingCall = peer.call(conn.peer, stream, { metadata: { callType: type } });
            setupCallListeners(outgoingCall);
        })
        .catch(err => {
            console.error('Failed to get local stream', err);
            setData({ type: 'system', payload: 'Could not start camera/mic. Please check permissions.' });
        });
  }, [peer, conn, endCall]);

  const toggleMedia = useCallback((type: 'audio' | 'video') => {
    if (localStream) {
      const tracks = type === 'audio' ? localStream.getAudioTracks() : localStream.getVideoTracks();
      if (tracks[0]) {
          tracks[0].enabled = !tracks[0].enabled;
      }
    }
  }, [localStream]);

  const startScreenShare = useCallback(async () => {
    if (!peer || !conn) return;

    try {
      // High-quality screen sharing constraints
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: 30, max: 60 },
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      } as DisplayMediaStreamOptions);

      setScreenStream(stream);
      setIsScreenSharing(true);

      // Notify peer that screen sharing has started
      sendData({ type: 'screen_share_start', payload: { nickname: conn.metadata?.nickname || 'Friend' } });

      // Setup screen share call with optimized settings
      const outgoingCall = peer.call(conn.peer, stream, { 
        metadata: { callType: 'screen' },
        sdpTransform: (sdp: string) => {
          // Increase bandwidth for better quality
          return sdp.replace(/b=AS:(\d+)/g, 'b=AS:8000');
        }
      });
      
      outgoingCall.on('stream', (remoteScreenStream) => {
        console.log('Receiving remote screen stream');
        setRemoteScreenStream(remoteScreenStream);
      });

      outgoingCall.on('close', () => {
        console.log('Screen share call closed');
        stopScreenShare();
      });

      outgoingCall.on('error', (err) => {
        console.error('Screen share error:', err);
        setData({ type: 'system', payload: `Screen share error: ${err.message}` });
        stopScreenShare();
      });

      screenCallInstance.current = outgoingCall;

      // Stop screen share when user stops sharing from browser UI
      stream.getTracks().forEach(track => {
        track.onended = () => {
          console.log('Screen share track ended');
          stopScreenShare();
        };
      });

    } catch (err: any) {
      console.error('Failed to start screen share:', err);
      let message = 'Could not start screen sharing.';
      if (err.name === 'NotAllowedError') {
        message = 'Screen sharing permission denied.';
      } else if (err.name === 'NotFoundError') {
        message = 'No screen available to share.';
      } else if (err.name === 'NotReadableError') {
        message = 'Screen sharing already in use.';
      }
      setData({ type: 'system', payload: message });
      throw err;
    }
  }, [peer, conn, sendData]);

  const stopScreenShare = useCallback(() => {
    if (screenCallInstance.current) {
      screenCallInstance.current.close();
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    setScreenStream(null);
    setRemoteScreenStream(null);
    setIsScreenSharing(false);
    screenCallInstance.current = null;
    
    // Notify peer that screen sharing has stopped
    if (conn) {
      sendData({ type: 'screen_share_stop', payload: { nickname: conn.metadata?.nickname || 'Friend' } });
    }
  }, [screenStream, conn, sendData]);

  return { 
    peerId, 
    connectToPeer, 
    sendData, 
    data, 
    isConnected, 
    conn, 
    localStream, 
    remoteStream, 
    isCallActive, 
    startCall, 
    endCall, 
    toggleMedia,
    screenStream,
    remoteScreenStream,
    isScreenSharing,
    startScreenShare,
    stopScreenShare,
    incomingConn, 
    acceptConnection, 
    rejectConnection,
    connectionState,
    onManualReconnect
  };
};
