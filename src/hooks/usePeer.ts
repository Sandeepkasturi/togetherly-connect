
import { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { DataConnection, MediaConnection, CallOption } from 'peerjs';
import { useToast } from '@/hooks/use-toast';
import { generatePeerId, generateFallbackPeerId, validatePeerId, getStoredPeerId, storePeerId } from '@/utils/peerIdGenerator';
import { ConnectionManager } from '@/utils/connectionManager';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'peer';
  timestamp: Date;
  type: 'text' | 'reaction' | 'file';
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
}

export interface Message {
  id: string;
  content: string;
  sender: 'me' | 'them' | 'system';
  timestamp: string;
  nickname?: string;
  messageType: 'text' | 'file' | 'system';
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileData?: string;
  reactions?: Reaction[];
}

export interface Reaction {
  emoji: string;
  by: string;
}

export interface PlayerSyncData {
  action: 'play' | 'pause' | 'seekTo' | 'changeVideo';
  timestamp?: number;
  videoId?: string;
}

export interface DataType {
  type: 'message' | 'reaction' | 'file' | 'player' | 'nickname' | 'chat' | 'video' | 'player_state' | 'system';
  payload: any;
}

// WebRTC configuration with STUN/TURN servers
const peerConfig = {
  host: 'peerjs-server.railway.app',
  port: 443,
  path: '/',
  secure: true,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ],
    iceCandidatePoolSize: 10
  },
  debug: 1
};

export const usePeer = () => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState<string>('');
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [myNickname, setMyNickname] = useState('User');
  const [remoteNickname, setRemoteNickname] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [playerSyncData, setPlayerSyncData] = useState<PlayerSyncData | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [call, setCall] = useState<MediaConnection | null>(null);
  const [data, setData] = useState<DataType | null>(null);
  const [incomingConn, setIncomingConn] = useState<DataConnection | null>(null);

  const { toast } = useToast();
  const connectionManager = ConnectionManager.getInstance();
  const [connectionState, setConnectionState] = useState(connectionManager.getState());
  
  const initializationRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);

  // Check WebRTC support
  const checkWebRTCSupport = useCallback(() => {
    const hasWebRTC = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.RTCPeerConnection);
    if (!hasWebRTC) {
      toast({
        title: 'WebRTC Not Supported',
        description: 'Your browser does not support WebRTC. Please use a modern browser like Chrome, Firefox, or Safari.',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  }, [toast]);

  // Subscribe to connection state changes
  useEffect(() => {
    const unsubscribe = connectionManager.subscribe(setConnectionState);
    return unsubscribe;
  }, []);

  const createPeer = useCallback(async (providedId?: string) => {
    if (!checkWebRTCSupport()) return null;

    // Don't create multiple peers
    if (peer && !peer.destroyed) {
      console.log('Peer already exists and is not destroyed');
      return peer;
    }

    try {
      let newPeerId = providedId;
      
      if (!newPeerId) {
        // Try to get stored peer ID first
        const storedId = getStoredPeerId();
        if (storedId) {
          newPeerId = storedId;
          console.log('Using stored peer ID:', newPeerId);
        } else {
          newPeerId = generatePeerId();
          console.log('Generated new peer ID:', newPeerId);
        }
      }

      if (!validatePeerId(newPeerId)) {
        console.warn('Invalid peer ID, generating fallback:', newPeerId);
        newPeerId = generateFallbackPeerId();
      }

      console.log('Initializing peer with ID:', newPeerId);
      connectionManager.setConnecting(newPeerId);

      const newPeer = new Peer(newPeerId, peerConfig);
      
      newPeer.on('open', (id) => {
        console.log('Peer opened with ID:', id);
        setPeerId(id);
        storePeerId(id);
        connectionManager.setConnected(id);
        reconnectAttemptsRef.current = 0;
        
        toast({
          title: 'Connected',
          description: `Your peer ID: ${id}`,
        });
      });

      newPeer.on('connection', (conn) => {
        console.log('Incoming connection from:', conn.peer);
        setIncomingConn(conn);
      });

      newPeer.on('call', (incomingCall) => {
        console.log('Incoming call from:', incomingCall.peer);
        handleIncomingCall(incomingCall);
      });

      newPeer.on('error', (error) => {
        console.error('Peer error:', error);
        connectionManager.setDisconnected(error.message);
        
        // Handle specific error types
        if (error.type === 'invalid-id') {
          console.log('Invalid ID error, generating new peer ID');
          // Generate new ID and retry
          setTimeout(() => {
            if (connectionManager.shouldRetry()) {
              const fallbackId = generateFallbackPeerId();
              connectionManager.scheduleRetry(() => createPeer(fallbackId));
            }
          }, 1000);
        } else if (error.type === 'network' || error.type === 'server-error') {
          // Network/server errors - retry with exponential backoff
          if (connectionManager.shouldRetry()) {
            connectionManager.scheduleRetry(() => createPeer());
          }
        } else {
          connectionManager.setFailed(error.message);
        }
      });

      newPeer.on('disconnected', () => {
        console.log('Peer disconnected, attempting to reconnect...');
        connectionManager.setDisconnected('Peer disconnected');
        
        if (!newPeer.destroyed && connectionManager.shouldRetry()) {
          connectionManager.scheduleRetry(() => {
            newPeer.reconnect();
          });
        }
      });

      newPeer.on('close', () => {
        console.log('Peer connection closed');
        connectionManager.setDisconnected('Peer connection closed');
        setPeer(null);
        setConnection(null);
        setIsConnected(false);
      });

      setPeer(newPeer);
      return newPeer;
    } catch (error) {
      console.error('Failed to create peer:', error);
      connectionManager.setFailed(`Failed to create peer: ${error}`);
      return null;
    }
  }, [peer, toast, checkWebRTCSupport]);

  // Initialize peer on mount
  useEffect(() => {
    if (!initializationRef.current) {
      initializationRef.current = true;
      createPeer();
    }

    return () => {
      if (peer && !peer.destroyed) {
        peer.destroy();
      }
      connectionManager.reset();
    };
  }, []);

  const handleIncomingConnection = useCallback((conn: DataConnection) => {
    setConnection(conn);
    setIsConnected(true);
    setRemoteNickname(conn.metadata?.nickname || 'Unknown');
    setIncomingConn(null);

    conn.on('data', (receivedData: DataType) => {
      setData(receivedData);
    });

    conn.on('close', () => {
      console.log('Connection closed');
      setIsConnected(false);
      setConnection(null);
      setRemoteNickname('');
    });

    conn.on('error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });
  }, []);

  const handleIncomingCall = useCallback((incomingCall: MediaConnection) => {
    console.log('Answering incoming call from:', incomingCall.peer);
    
    incomingCall.answer(localStream);
    setCall(incomingCall);
    setIsCallActive(true);

    incomingCall.on('stream', (stream) => {
      console.log('Received remote stream');
      setRemoteStream(stream);
    });

    incomingCall.on('close', () => {
      console.log('Call ended');
      setIsCallActive(false);
      setRemoteStream(null);
    });

    incomingCall.on('error', (error) => {
      console.error('Call error:', error);
      setIsCallActive(false);
      setRemoteStream(null);
      toast({
        title: 'Call Error',
        description: 'An error occurred during the call.',
        variant: 'destructive'
      });
    });
  }, [localStream, toast]);

  const connectToPeer = useCallback(async (remotePeerId: string, metadata: { nickname: string }) => {
    if (!peer || peer.destroyed) {
      toast({
        title: 'Error',
        description: 'Peer not initialized. Please wait.',
        variant: 'destructive'
      });
      return;
    }

    if (!validatePeerId(remotePeerId)) {
      toast({
        title: 'Invalid Peer ID',
        description: 'Please enter a valid peer ID.',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('Connecting to peer:', remotePeerId);
      const conn = peer.connect(remotePeerId, { metadata });
      
      conn.on('open', () => {
        console.log('Connected to peer:', remotePeerId);
        setConnection(conn);
        setIsConnected(true);
        setRemoteNickname(metadata.nickname);
        
        toast({
          title: 'Connected',
          description: `Connected to ${metadata.nickname}`,
        });
      });

      conn.on('data', (receivedData: DataType) => {
        setData(receivedData);
      });

      conn.on('close', () => {
        console.log('Connection to peer closed');
        setIsConnected(false);
        setConnection(null);
        setRemoteNickname('');
      });

      conn.on('error', (error) => {
        console.error('Connection error:', error);
        toast({
          title: 'Connection Failed',
          description: 'Failed to connect to peer. Please check the peer ID.',
          variant: 'destructive'
        });
      });
    } catch (error) {
      console.error('Failed to connect:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to peer.',
        variant: 'destructive'
      });
    }
  }, [peer, toast]);

  const acceptConnection = useCallback(() => {
    if (incomingConn) {
      handleIncomingConnection(incomingConn);
    }
  }, [incomingConn, handleIncomingConnection]);

  const rejectConnection = useCallback(() => {
    if (incomingConn) {
      incomingConn.close();
      setIncomingConn(null);
    }
  }, [incomingConn]);

  const manualReconnect = useCallback(() => {
    console.log('Manual reconnect triggered');
    connectionManager.manualRetry(() => {
      if (peer && !peer.destroyed) {
        peer.destroy();
      }
      setPeer(null);
      setTimeout(() => createPeer(), 500);
    });
  }, [peer, createPeer]);

  const sendData = useCallback((dataToSend: DataType) => {
    if (connection && connection.open) {
      connection.send(dataToSend);
    }
  }, [connection]);

  const sendMessage = useCallback((message: string) => {
    if (connection && connection.open) {
      const newMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        text: message,
        sender: 'me',
        timestamp: new Date(),
        type: 'text',
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      sendData({ type: 'message', payload: message });
    } else {
      toast({
        title: 'Not Connected',
        description: 'Please connect to a peer to send messages.',
        variant: 'destructive',
      });
    }
  }, [connection, sendData, toast]);

  const handleVideoSelect = useCallback((videoId: string) => {
    setSelectedVideoId(videoId);
    if (connection && connection.open) {
      sendData({
        type: 'player',
        payload: { action: 'changeVideo', videoId }
      });
    }
  }, [connection, sendData]);

  const startCall = useCallback(async (type: 'audio' | 'video') => {
    if (!peer) {
      toast({
        title: 'Error',
        description: 'Peer not initialized.',
        variant: 'destructive'
      });
      return;
    }

    if (!connection) {
      toast({
        title: 'Error',
        description: 'Not connected to a peer.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true,
      });
      setLocalStream(stream);

      const callOptions: CallOption = {
        metadata: {
          nickname: myNickname
        }
      };

      const userCall = peer.call(connection.peer, stream, callOptions);
      setCall(userCall);
      setIsCallActive(true);

      userCall.on('stream', (remoteStream) => {
        console.log('Received remote stream');
        setRemoteStream(remoteStream);
      });

      userCall.on('close', () => {
        console.log('Call ended');
        setIsCallActive(false);
        setRemoteStream(null);
      });

      userCall.on('error', (error) => {
        console.error('Call error:', error);
        setIsCallActive(false);
        setRemoteStream(null);
        toast({
          title: 'Call Error',
          description: 'An error occurred during the call.',
          variant: 'destructive'
        });
      });
    } catch (error: any) {
      console.error('Failed to get local stream:', error);
      toast({
        title: 'Camera/Microphone Error',
        description: error.message || 'Failed to access camera/microphone.',
        variant: 'destructive'
      });
    }
  }, [peer, connection, myNickname, toast]);

  const endCall = useCallback(() => {
    if (call) {
      call.close();
      setCall(null);
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setIsCallActive(false);
    setRemoteStream(null);
  }, [call, localStream]);

  const toggleMedia = useCallback((type: 'audio' | 'video') => {
    if (localStream) {
      const tracks = type === 'audio' ? localStream.getAudioTracks() : localStream.getVideoTracks();
      tracks.forEach(track => track.enabled = !track.enabled);
    }
  }, [localStream]);

  const handleSendReaction = useCallback((reaction: string) => {
    if (connection && connection.open) {
      const newMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        text: reaction,
        sender: 'me',
        timestamp: new Date(),
        type: 'reaction',
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      sendData({ type: 'reaction', payload: reaction });
    }
  }, [connection, sendData]);

  const handleSendFile = useCallback((file: File) => {
    if (connection && connection.open) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          url: reader.result,
        };
        sendData({ type: 'file', payload: fileData });

        const newMessage: ChatMessage = {
          id: Math.random().toString(36).substring(2, 9),
          text: 'File sent',
          sender: 'me',
          timestamp: new Date(),
          type: 'file',
          fileName: file.name,
          fileSize: file.size,
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      };
      reader.readAsDataURL(file);
    }
  }, [connection, sendData]);

  return {
    peer,
    peerId,
    connection,
    conn: connection, // Alias for compatibility
    isConnected,
    messages,
    myNickname,
    remoteNickname,
    selectedVideoId,
    playerSyncData,
    localStream,
    remoteStream,
    isCallActive,
    connectionState,
    data,
    incomingConn,
    connectToPeer,
    acceptConnection,
    rejectConnection,
    sendData,
    sendMessage,
    handleVideoSelect,
    startCall,
    endCall,
    toggleMedia,
    handleSendReaction,
    handleSendFile,
    manualReconnect,
    setNickname: setMyNickname
  };
};
