
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
    <div className="flex flex-col h-full bg-[#0b141a] rounded-xl">
      {/* WhatsApp-style Header */}
      <div className="px-4 py-3 border-b border-[#2a3942] bg-[#1f2c34]">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-[#e9edef]">Messages</h2>
          <div className={cn(
            "flex items-center gap-2 text-xs",
            isConnected ? "text-[#25d366]" : "text-[#8696a0]"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-[#25d366]" : "bg-[#8696a0]"
            )} />
            {isConnected ? "Online" : "Offline"}
          </div>
        </div>
      </div>

      {/* Messages Area - WhatsApp background pattern */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#0b141a]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23182229\'/%3E%3Cpath d=\'M20 20l5 5-5 5m10-10l5 5-5 5\' stroke=\'%231f2c34\' stroke-width=\'0.5\' fill=\'none\' opacity=\'0.1\'/%3E%3C/svg%3E")', backgroundSize: '100px 100px' }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="text-[#8696a0]">
              <p className="text-base mb-1">No messages yet</p>
              <p className="text-sm">Send a message to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full",
                  msg.sender === 'me' ? 'justify-end' : 
                  msg.sender === 'them' ? 'justify-start' : 'justify-center'
                )}
              >
                <div className={cn(
                  "max-w-[85%]",
                  msg.sender === 'me' ? 'items-end' : 
                  msg.sender === 'them' ? 'items-start' : 'items-center'
                )}>
                  {msg.nickname && msg.sender === 'them' && (
                    <p className="text-xs text-[#8696a0] mb-1 px-2">{msg.nickname}</p>
                  )}
                  <div
                    className={cn(
                      "relative px-3 py-2 shadow-sm",
                      msg.sender === 'me'
                        ? 'bg-[#005c4b] text-white rounded-lg rounded-br-none'
                        : msg.sender === 'them'
                        ? 'bg-[#1f2c34] text-[#e9edef] rounded-lg rounded-bl-none'
                        : 'bg-[#182229] text-[#8696a0] italic text-center rounded-lg',
                      msg.sender !== 'system' && msg.messageType !== 'file' && 'cursor-pointer active:opacity-80'
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
                      <p className="break-words text-sm leading-snug">{msg.content}</p>
                    )}
                    
                    {msg.sender !== 'system' && (
                      <p className="text-[10px] opacity-60 mt-1 text-right">{msg.timestamp}</p>
                    )}
                    
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="absolute -bottom-2 right-2 flex items-center gap-1">
                        {Object.entries(
                          msg.reactions.reduce((acc, reaction) => {
                            acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([emoji, count]) => (
                          <div
                            key={emoji}
                            className="bg-[#1f2c34] border border-[#2a3942] px-1.5 py-0.5 rounded-full text-xs flex items-center gap-0.5"
                          >
                            <span className="text-xs">{emoji}</span>
                            <span className="text-[10px] text-[#25d366]">{count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp-style Input Area */}
      <div className="px-2 py-2 bg-[#1f2c34]">
        {!isConnected && (
          <div className="mb-2 p-2 bg-[#182229] rounded-lg text-center">
            <p className="text-xs text-[#8696a0]">Connect to start chatting</p>
          </div>
        )}
        <div className="flex items-center gap-2">
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
            className="shrink-0 h-9 w-9 rounded-full hover:bg-[#2a3942] text-[#8696a0] hover:text-[#e9edef]" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={!isConnected}
          >
            <FileIcon className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 flex items-center gap-2 bg-[#2a3942] rounded-full px-4 py-2">
            <Input
              placeholder={isConnected ? "Message" : "Offline"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={!isConnected}
              className="border-0 bg-transparent text-[#e9edef] placeholder:text-[#8696a0] focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-6 text-sm"
            />
          </div>
          
          <Button 
            size="icon" 
            className="shrink-0 h-9 w-9 rounded-full bg-[#25d366] hover:bg-[#20bd5a]" 
            onClick={handleSend} 
            disabled={!isConnected || !message.trim()}
          >
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
