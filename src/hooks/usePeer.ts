
import { useState, useEffect, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';

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
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState('');
  const [conn, setConn] = useState<DataConnection | null>(null);
  const [data, setData] = useState<DataType | null>(null);
  const peerInstance = useRef<Peer | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newPeer = new Peer();
    peerInstance.current = newPeer;
    setPeer(newPeer);

    newPeer.on('open', (id) => {
      setPeerId(id);
    });

    newPeer.on('connection', (newConn) => {
      setConn(newConn);
      setIsConnected(true);
      setData({ type: 'system', payload: `Connected to ${newConn.peer}` });
    });

    return () => {
      newPeer.destroy();
    };
  }, []);

  useEffect(() => {
    if (!conn) return;
    conn.on('data', (data) => {
      setData(data as DataType);
    });
    conn.on('close', () => {
      setIsConnected(false);
      setConn(null);
      setData({ type: 'system', payload: 'Peer has disconnected.' });
    });
    conn.on('error', (err) => {
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
