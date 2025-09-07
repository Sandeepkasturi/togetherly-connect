
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
    <div className="flex flex-col h-full bg-card border border-border/50 rounded-xl shadow-sm">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-border/50 bg-gradient-to-r from-card to-card/80">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Messages</h2>
          <div className={cn(
            "flex items-center gap-2 text-sm",
            isConnected ? "text-emerald-500" : "text-muted-foreground"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
            )} />
            {isConnected ? "Connected" : "Disconnected"}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="text-muted-foreground">
              <p className="text-lg font-medium mb-2">No messages yet</p>
              <p className="text-sm">Start a conversation with your watch buddy!</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className={cn(
                  "flex w-full",
                  msg.sender === 'me' ? 'justify-end' : 
                  msg.sender === 'them' ? 'justify-start' : 'justify-center'
                )}
              >
                <div className={cn(
                  "max-w-[80%] md:max-w-[70%]",
                  msg.sender === 'me' ? 'items-end' : 
                  msg.sender === 'them' ? 'items-start' : 'items-center'
                )}>
                  {msg.nickname && msg.sender === 'them' && (
                    <p className="text-xs text-muted-foreground mb-1 px-3 font-medium">{msg.nickname}</p>
                  )}
                  <div
                    className={cn(
                      "relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200",
                      msg.sender === 'me'
                        ? 'bg-primary text-primary-foreground rounded-br-md hover:shadow-glow-primary/20'
                        : msg.sender === 'them'
                        ? 'bg-muted/80 border border-border/50 rounded-bl-md hover:bg-muted'
                        : 'bg-transparent text-muted-foreground italic text-center',
                      msg.sender !== 'system' && msg.messageType !== 'file' && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
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
                      <p className="break-words leading-relaxed">{msg.content}</p>
                    )}
                    
                    {msg.sender !== 'system' && (
                      <p className="text-xs opacity-70 mt-2 font-medium">{msg.timestamp}</p>
                    )}
                    
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="absolute -bottom-3 right-2 flex items-center gap-1">
                        {Object.entries(
                          msg.reactions.reduce((acc, reaction) => {
                            acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([emoji, count]) => (
                          <div
                            key={emoji}
                            className="bg-card/95 border border-border/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow-sm hover:scale-110 transition-transform"
                          >
                            <span className="text-sm">{emoji}</span>
                            <span className="font-semibold text-primary">{count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-4 border-t border-border/50 bg-card/50">
        {!isConnected && (
          <div className="mb-3 p-3 bg-muted/50 border border-border/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Connect with a friend to start chatting</p>
          </div>
        )}
        <div className="flex items-end gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            disabled={!isConnected}
          />
          <Button 
            size="icon" 
            variant="ghost" 
            className="shrink-0 h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={!isConnected}
          >
            <FileIcon className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              placeholder={isConnected ? "Type your message..." : "Connect to chat"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={!isConnected}
              className="pr-12 py-3 rounded-xl border-border/50 bg-background/80 focus:bg-background transition-colors resize-none min-h-[44px]"
            />
            <Button 
              size="icon" 
              className="absolute right-1 top-1 h-8 w-8 rounded-lg" 
              onClick={handleSend} 
              disabled={!isConnected || !message.trim()}
              variant={message.trim() ? "default" : "ghost"}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {isConnected && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Double-tap messages to react • Press Enter to send
          </p>
        )}
      </div>
    </div>
  );
};

export default Chat;
