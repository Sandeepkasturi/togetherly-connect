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
      setConn(incomingConn);
      setIncomingConn(null);
    }
  }, [incomingConn]);

  const rejectConnection = useCallback(() => {
    if (incomingConn) {
      incomingConn.close();
      setIncomingConn(null);
      setData({ type: 'system', payload: 'Connection request rejected.' });
    }
  }, [incomingConn]);

  useEffect(() => {
    const initializePeer = async () => {
      // Dynamically import PeerJS to solve module resolution issues with Vite
      const { default: Peer } = await import('peerjs');

      const newPeer = new Peer();
      peerInstance.current = newPeer;
      setPeer(newPeer);

      newPeer.on('open', (id: string) => {
        setPeerId(id);
      });

      newPeer.on('connection', (newConn: DataConnection) => {
        if (conn?.open || isCallActive || incomingConn) {
          // If busy, reject new connection.
          newConn.close();
          return;
        }
        setData({type: 'system', payload: `Incoming connection from ${newConn.metadata.nickname || newConn.peer}`});
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

    initializePeer();

    return () => {
      if (peerInstance.current) {
        peerInstance.current.destroy();
      }
    };
  }, [endCall]);

  useEffect(() => {
    if (!conn) return;

    const onOpen = () => {
      setIsConnected(true);
      setData({ type: 'system', payload: `Connected to ${conn.peer}` });
    };

    const onData = (receivedData: unknown) => {
      setData(receivedData as DataType);
    };

    const onClose = () => {
      setIsConnected(false);
      setConn(null);
      setData({ type: 'system', payload: 'Peer has disconnected.' });
    };

    const onError = (err: Error) => {
      console.error(err);
      setData({ type: 'system', payload: `Connection error: ${err.message}` });
    };

    conn.on('open', onOpen);
    conn.on('data', onData);
    conn.on('close', onClose);
    conn.on('error', onError);
    
    // This handles the case where the connection is already open
    if (conn.open) {
      onOpen();
    }

    return () => {
      conn.off('open', onOpen);
      conn.off('data', onData);
      conn.off('close', onClose);
      conn.off('error', onError);
    };
  }, [conn]);

  const connectToPeer = useCallback((remoteId: string, metadata: { nickname: string }) => {
    if (!peer) return;
    const newConn = peer.connect(remoteId, { metadata });
    setConn(newConn);
  }, [peer]);
  
  const sendData = useCallback((data: DataType) => {
    if (conn && conn.open) {
      conn.send(data);
    } else {
      console.error("Connection is not open. You should listen for the `open` event before sending messages.");
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
