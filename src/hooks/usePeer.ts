
import { useState, useEffect, useRef } from 'react';
// Note: The peerjs imports have been removed from here to fix the build error.
// We will import it dynamically inside the useEffect hook.

export interface Message {
  id: string;
  sender: 'me' | 'them' | 'system';
  content: string;
  timestamp: string;
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
}

export const usePeer = () => {
  const [peer, setPeer] = useState<any | null>(null);
  const [peerId, setPeerId] = useState('');
  const [conn, setConn] = useState<any | null>(null);
  const [data, setData] = useState<DataType | null>(null);
  const peerInstance = useRef<any | null>(null);
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

      newPeer.on('connection', (newConn: any) => {
        setConn(newConn);
        setIsConnected(true);
        setData({ type: 'system', payload: `Connected to ${newConn.peer}` });
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
    conn.on('data', (data: DataType) => {
      setData(data as DataType);
    });
    conn.on('close', () => {
      setIsConnected(false);
      setConn(null);
      setData({ type: 'system', payload: 'Peer has disconnected.' });
    });
    conn.on('error', (err: Error) => {
      console.error(err);
      setData({ type: 'system', payload: `Connection error: ${err.message}` });
    });
  }, [conn]);

  const connectToPeer = (remoteId: string) => {
    if (!peer) return;
    const newConn = peer.connect(remoteId);
    setConn(newConn);
    newConn.on('open', () => {
      setIsConnected(true);
      setData({ type: 'system', payload: `Connected to ${remoteId}` });
    });
  };
  
  const sendData = (data: DataType) => {
    if (conn) {
      conn.send(data);
    }
  };

  return { peerId, connectToPeer, sendData, data, isConnected, conn };
};

