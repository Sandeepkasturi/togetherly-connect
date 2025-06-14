
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message } from '@/hooks/usePeer';
import { Send, File as FileIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import FileDisplay from './FileDisplay';

interface ChatProps {
  messages: Message[];
  sendMessage: (content: string) => void;
  handleSendFile: (file: File) => void;
  isConnected: boolean;
  handleSendReaction: (messageId: string, emoji: string) => void;
}

const Chat = ({ messages, sendMessage, handleSendFile, isConnected, handleSendReaction }: ChatProps) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDoubleClick = (messageId: string) => {
    if (!isConnected) return;
    handleSendReaction(messageId, '❤️');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleSendFile(file);
    }
    // Reset file input to allow selecting the same file again
    if(event.target) {
        event.target.value = '';
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
              className={cn(
                "flex flex-col",
                msg.sender === 'me' ? 'items-end' : 
                msg.sender === 'them' ? 'items-start' : 'items-center'
              )}
            >
              {msg.nickname && msg.sender === 'them' && (
                <p className="text-xs text-muted-foreground/80 mb-1 px-2">{msg.nickname}</p>
              )}
              <div
                className={cn(
                  "max-w-xs p-3 rounded-lg relative",
                  msg.sender === 'me'
                    ? 'bg-primary text-primary-foreground'
                    : msg.sender === 'them'
                    ? 'bg-muted'
                    : 'bg-transparent text-muted-foreground italic',
                  msg.sender !== 'system' && msg.messageType !== 'file' && 'cursor-pointer'
                )}
                onDoubleClick={() => msg.sender !== 'system' && msg.messageType !== 'file' && handleDoubleClick(msg.id)}
              >
                {msg.messageType === 'file' ? (
                  <FileDisplay 
                    fileName={msg.fileName}
                    fileSize={msg.fileSize}
                    fileData={msg.fileData}
                    isMe={msg.sender === 'me'}
                  />
                ) : (
                  <p className="break-words">{msg.content}</p>
                )}
                 {msg.sender !== 'system' && <p className="text-xs text-muted-foreground/70 mt-1">{msg.timestamp}</p>}
                
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="absolute -bottom-4 right-1 flex items-center gap-1">
                    {Object.entries(
                      msg.reactions.reduce((acc, reaction) => {
                        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([emoji, count]) => (
                      <div
                        key={emoji}
                        className="bg-background/80 border border-border/50 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-xs flex items-center gap-1 shadow-sm"
                      >
                        <span>{emoji}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          disabled={!isConnected}
        />
        <Button size="icon" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={!isConnected}>
          <FileIcon className="h-4 w-4" />
        </Button>
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
