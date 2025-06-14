import { useState, useEffect, useRef, useCallback } from 'react';
// We use type-only imports for type safety, and dynamic import for the implementation.
import type Peer from 'peerjs';
import type { DataConnection } from 'peerjs';

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
}

export type DataType = {
  type: 'chat';
  payload: Omit<Message, 'sender'>;
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
};

export const usePeer = () => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState('');
  const [conn, setConn] = useState<DataConnection | null>(null);
  const [data, setData] = useState<DataType | null>(null);
  const peerInstance = useRef<Peer | null>(null);
  const [isConnected, setIsConnected] = useState(false);

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
        setConn(newConn);
      });
    };

    initializePeer();

    return () => {
      if (peerInstance.current) {
        peerInstance.current.destroy();
      }
    };
  }, []);

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

  const connectToPeer = useCallback((remoteId: string) => {
    if (!peer) return;
    const newConn = peer.connect(remoteId);
    setConn(newConn);
  }, [peer]);
  
  const sendData = useCallback((data: DataType) => {
    if (conn && conn.open) {
      conn.send(data);
    } else {
      console.error("Connection is not open. You should listen for the `open` event before sending messages.");
    }
  }, [conn]);

  return { peerId, connectToPeer, sendData, data, isConnected, conn };
};
