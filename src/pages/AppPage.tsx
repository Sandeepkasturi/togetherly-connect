
import { useState, useEffect } from 'react';
import { usePeer, Message, DataType } from '@/hooks/usePeer';
import Header from '@/components/Header';
import PeerConnection from '@/components/PeerConnection';
import Chat from '@/components/Chat';
import YouTubePlayer from '@/components/YouTubePlayer';
import YouTubeSearch from '@/components/YouTubeSearch';
import { motion } from 'framer-motion';

const Index = () => {
  const { peerId, connectToPeer, sendData, data, isConnected } = usePeer();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState('');

  useEffect(() => {
    if (data) {
      if (data.type === 'chat') {
        const newMessage: Message = { ...data.payload, sender: 'them' };
        setMessages((prev) => [...prev, newMessage]);
      } else if (data.type === 'video') {
        setSelectedVideoId(data.payload);
      } else if (data.type === 'system') {
        const systemMessage: Message = { 
          id: Date.now().toString(), 
          content: data.payload, 
          sender: 'system', 
          timestamp: new Date().toLocaleTimeString() 
        };
        setMessages((prev) => [...prev, systemMessage]);
      }
    }
  }, [data]);

  const handleSendMessage = (content: string) => {
    const message: Omit<Message, 'sender'> = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toLocaleTimeString(),
    };
    const dataToSend: DataType = { type: 'chat', payload: message };
    sendData(dataToSend);
    setMessages((prev) => [...prev, { ...message, sender: 'me' }]);
  };

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideoId(videoId);
    const dataToSend: DataType = { type: 'video', payload: videoId };
    sendData(dataToSend);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 flex flex-col gap-8"
        >
          <YouTubePlayer videoId={selectedVideoId} />
          <YouTubeSearch onVideoSelect={handleVideoSelect} isConnected={isConnected} />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col gap-8"
        >
          <PeerConnection peerId={peerId} connectToPeer={connectToPeer} isConnected={isConnected} />
          <Chat messages={messages} sendMessage={handleSendMessage} isConnected={isConnected} />
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
