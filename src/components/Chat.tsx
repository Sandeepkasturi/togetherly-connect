
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message } from '@/hooks/usePeer';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatProps {
  messages: Message[];
  sendMessage: (content: string) => void;
  isConnected: boolean;
}

const Chat = ({ messages, sendMessage, isConnected }: ChatProps) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="p-4 bg-secondary/30 rounded-lg border border-border flex flex-col h-[400px]">
      <h2 className="text-lg font-semibold mb-4">Chat</h2>
      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex flex-col ${
                msg.sender === 'me' ? 'items-end' : 
                msg.sender === 'them' ? 'items-start' : 'items-center'
              }`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  msg.sender === 'me'
                    ? 'bg-primary text-primary-foreground'
                    : msg.sender === 'them'
                    ? 'bg-muted'
                    : 'bg-transparent text-muted-foreground italic'
                }`}
              >
                <p>{msg.content}</p>
                 {msg.sender !== 'system' && <p className="text-xs text-muted-foreground/70 mt-1">{msg.timestamp}</p>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={!isConnected}
        />
        <Button size="icon" onClick={handleSend} disabled={!isConnected || !message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Chat;
