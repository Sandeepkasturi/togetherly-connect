
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
};

export const usePeer = () => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState('');
  const [conn, setConn] = useState<DataConnection | null>(null);
  const [data, setData] = useState<DataType | null>(null);
  const peerInstance = useRef<Peer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const mediaCallInstance = useRef<MediaConnection | null>(null);

  const [incomingConn, setIncomingConn] = useState<DataConnection | null>(null);

  const setupConnectionHandlers = useCallback((connection: DataConnection) => {
    const onOpen = () => {
      console.log('Connection opened with:', connection.peer);
      setIsConnected(true);
      setData({ type: 'system', payload: `Connected to ${connection.peer}` });
    };

    const onData = (receivedData: unknown) => {
      setData(receivedData as DataType);
    };

    const onClose = () => {
      console.log('Connection closed with:', connection.peer);
      setIsConnected(false);
      setConn(null);
      setData({ type: 'system', payload: 'Peer has disconnected.' });
    };

    const onError = (err: Error) => {
      console.error('Connection error:', err);
      setData({ type: 'system', payload: `Connection error: ${err.message}` });
      // Don't immediately close on error, let the connection try to recover
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

  useEffect(() => {
    const initializePeer = async () => {
      try {
        // Dynamically import PeerJS to solve module resolution issues with Vite
        const { default: Peer } = await import('peerjs');

        // Enhanced peer configuration for maximum cross-device compatibility
        const newPeer = new Peer({
          config: {
            iceServers: [
              // Google STUN servers
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
              { urls: 'stun:stun3.l.google.com:19302' },
              { urls: 'stun:stun4.l.google.com:19302' },
              // Additional STUN servers for better compatibility
              { urls: 'stun:stun.cloudflare.com:3478' },
              { urls: 'stun:stun.mozilla.org:3478' },
              // Public TURN servers (fallback for restricted networks)
              {
                urls: 'turn:turn.bistri.com:80',
                credential: 'homeo',
                username: 'homeo'
              },
              {
                urls: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'
              }
            ],
            sdpSemantics: 'unified-plan',
            iceCandidatePoolSize: 10,
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require'
          },
          debug: 0,
          // Extended timeout for peer server connection
          pingInterval: 5000,
          // Allow more time for initial connection
          host: 'peerjs-server-8gvhk6w8o-peerjs.vercel.app',
          port: 443,
          path: '/',
          secure: true
        });

        peerInstance.current = newPeer;
        setPeer(newPeer);

        newPeer.on('open', (id: string) => {
          console.log('Peer opened with ID:', id);
          setPeerId(id);
        });

        newPeer.on('error', (error: any) => {
          console.error('Peer error:', error);
          setData({ type: 'system', payload: `Peer error: ${error.message || 'Connection failed'}` });
          
          // Enhanced error recovery
          if (error.type === 'network' || error.type === 'disconnected' || error.type === 'server-error') {
            setTimeout(() => {
              if (!newPeer.destroyed) {
                console.log('Attempting to reconnect after error...');
                newPeer.reconnect();
              }
            }, 3000);
          }
        });

        newPeer.on('disconnected', () => {
          console.log('Peer disconnected, attempting to reconnect...');
          setData({ type: 'system', payload: 'Connection lost, reconnecting...' });
          
          // Attempt to reconnect with exponential backoff
          let attempts = 0;
          const maxAttempts = 5;
          const reconnectWithBackoff = () => {
            if (attempts < maxAttempts && !newPeer.destroyed) {
              attempts++;
              const delay = Math.min(1000 * Math.pow(2, attempts), 10000);
              setTimeout(() => {
                console.log(`Reconnection attempt ${attempts}/${maxAttempts}`);
                newPeer.reconnect();
              }, delay);
            }
          };
          reconnectWithBackoff();
        });

        newPeer.on('connection', (newConn: DataConnection) => {
          console.log('Incoming connection from:', newConn.peer);
          
          // If already connected or busy, reject gracefully
          if (conn?.open || isCallActive || incomingConn) {
            console.log('Rejecting connection - already busy');
            newConn.close();
            return;
          }
          
          // Extended connection timeout - 5 minutes
          const connectionTimeout = setTimeout(() => {
            if (!newConn.open) {
              console.log('Connection request timed out after 5 minutes');
              newConn.close();
              setIncomingConn(null);
              setData({ type: 'system', payload: 'Connection request timed out after 5 minutes.' });
            }
          }, 300000); // 5 minutes = 300,000ms

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

      } catch (error) {
        console.error('Failed to initialize peer:', error);
        setData({ type: 'system', payload: 'Failed to initialize peer connection' });
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
    setData({ type: 'system', payload: `Connecting to ${remoteId}...` });
    
    try {
      const newConn = peer.connect(remoteId, { 
        metadata,
        reliable: true,
        // Enhanced connection options for cross-device compatibility
        serialization: 'json'
      });

      // Extended connection timeout - 5 minutes
      const connectionTimeout = setTimeout(() => {
        if (!newConn.open) {
          console.log('Connection attempt timed out after 5 minutes');
          newConn.close();
          setData({ type: 'system', payload: 'Connection timed out after 5 minutes. Please check the Peer ID and try again.' });
        }
      }, 300000); // 5 minutes = 300,000ms

      newConn.on('open', () => {
        clearTimeout(connectionTimeout);
        console.log('Successfully connected to:', remoteId);
        setData({ type: 'system', payload: `Successfully connected to ${remoteId}` });
      });

      newConn.on('error', (err) => {
        clearTimeout(connectionTimeout);
        console.error('Connection failed:', err);
        setData({ type: 'system', payload: `Failed to connect: ${err.message || 'Please check the Peer ID and try again.'}` });
      });

      setConn(newConn);
    } catch (error) {
      console.error('Error creating connection:', error);
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
      // Queue the data to be sent when connection is ready
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

  return { peerId, connectToPeer, sendData, data, isConnected, conn, localStream, remoteStream, isCallActive, startCall, endCall, toggleMedia, incomingConn, acceptConnection, rejectConnection };
};
