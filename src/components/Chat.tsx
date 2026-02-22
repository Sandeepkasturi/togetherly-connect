import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message } from '@/hooks/usePeer';
import { Send, File as FileIcon, Mic, Trash2, Edit2, MoreVertical, X, Check, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import FileDisplay from './FileDisplay';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatProps {
  messages: Message[];
  sendMessage: (content: string) => void;
  handleSendFile: (file: File) => void;
  isConnected: boolean;
  handleSendReaction: (messageId: string, emoji: string) => void;
  handleSendVoice: (voiceData: string, duration: number) => void;
  handleEditMessage: (id: string, newContent: string) => void;
  handleDeleteMessage: (id: string) => void;
  clearChat: () => void;
  remoteNickname?: string;
}

const Chat = ({
  messages,
  sendMessage,
  handleSendFile,
  isConnected,
  handleSendReaction,
  handleSendVoice,
  handleEditMessage,
  handleDeleteMessage,
  clearChat,
  remoteNickname
}: ChatProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (editingMessageId) {
      handleEditMessage(editingMessageId, message);
      setEditingMessageId(null);
      setMessage('');
    } else if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          handleSendVoice(reader.result as string, recordingDuration);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDoubleClick = (messageId: string) => {
    if (!isConnected) return;
    handleSendReaction(messageId, '❤️');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleSendFile(file);
    if (event.target) event.target.value = '';
  };

  const startEditing = (msg: Message) => {
    setEditingMessageId(msg.id);
    setMessage(msg.content);
    setEditContent(msg.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setMessage('');
    setEditContent('');
  };

  const peerInitial = (remoteNickname || 'P')[0].toUpperCase();

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--chat-bg))]">
      {/* Header with peer avatar */}
      <div className="px-4 py-3 border-b border-white/5 bg-[hsl(var(--chat-header))]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                {peerInitial}
              </div>
              {isConnected && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[hsl(var(--chat-online))] border-2 border-[hsl(var(--chat-header))]" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[hsl(var(--chat-text))]">
                {isConnected ? (remoteNickname || 'Peer') : 'Messages'}
              </h2>
              <p className="text-[11px] text-[hsl(var(--chat-muted))]">
                {isConnected ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--chat-muted))] hover:bg-white/5 rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[hsl(var(--chat-header))] border-white/10 text-[hsl(var(--chat-text))]">
              <DropdownMenuItem onClick={clearChat} className="text-destructive focus:text-destructive focus:bg-white/5">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                <MessageCircle className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isConnected ? 'Say hello!' : 'Connect to start chatting'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const prevMsg = messages[idx - 1];
              const isGrouped = prevMsg && prevMsg.sender === msg.sender && msg.sender !== 'system';

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex w-full group",
                    msg.sender === 'me' ? 'justify-end' :
                      msg.sender === 'them' ? 'justify-start' : 'justify-center',
                    !isGrouped && idx > 0 && 'mt-3'
                  )}
                >
                  <div className={cn("max-w-[80%] relative")}>
                    {msg.nickname && msg.sender === 'them' && !isGrouped && (
                      <p className="text-[11px] text-[hsl(var(--chat-muted))] mb-1 px-1">{msg.nickname}</p>
                    )}

                    <div
                      className={cn(
                        "relative px-3 py-2 shadow-sm",
                        msg.sender === 'me'
                          ? 'bg-[hsl(var(--chat-bubble-me))] text-white rounded-2xl rounded-br-md'
                          : msg.sender === 'them'
                            ? 'bg-[hsl(var(--chat-bubble-them))] text-[hsl(var(--chat-text))] rounded-2xl rounded-bl-md'
                            : 'bg-white/5 text-[hsl(var(--chat-muted))] italic text-center rounded-xl text-xs',
                        msg.sender !== 'system' && msg.messageType !== 'file' && 'cursor-pointer active:opacity-80',
                        msg.isDeleted && "opacity-60 italic"
                      )}
                      onDoubleClick={() => msg.sender !== 'system' && msg.messageType !== 'file' && !msg.isDeleted && handleDoubleClick(msg.id)}
                    >
                      {/* Message Actions */}
                      {msg.sender === 'me' && !msg.isDeleted && msg.messageType !== 'system' && (
                        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5 p-0 rounded-full bg-black/40 text-white/80 hover:text-white">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[hsl(var(--chat-header))] border-white/10 text-[hsl(var(--chat-text))]">
                              {msg.messageType === 'text' && (
                                <DropdownMenuItem onClick={() => startEditing(msg)}>
                                  <Edit2 className="h-3 w-3 mr-2" /> Edit
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDeleteMessage(msg.id)} className="text-destructive">
                                <Trash2 className="h-3 w-3 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}

                      {msg.messageType === 'file' ? (
                        <FileDisplay
                          fileName={msg.fileName}
                          fileSize={msg.fileSize}
                          fileData={msg.fileData}
                          isMe={msg.sender === 'me'}
                        />
                      ) : msg.messageType === 'voice' ? (
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 text-white">
                            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
                          </Button>
                          <div className="flex flex-col flex-1">
                            <div className="h-1 bg-white/20 rounded-full w-full mb-1">
                              <div className="h-full bg-white/60 rounded-full w-1/3" />
                            </div>
                            <span className="text-[10px] opacity-60">{formatDuration(msg.voiceDuration || 0)}</span>
                          </div>
                          <audio src={msg.voiceData} controls className="hidden" />
                        </div>
                      ) : (
                        <p className="break-words text-[14px] leading-relaxed">{msg.content}</p>
                      )}

                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        {msg.isEdited && <span className="text-[10px] opacity-50 italic">edited</span>}
                        {msg.sender !== 'system' && (
                          <p className="text-[10px] opacity-40">{msg.timestamp}</p>
                        )}
                      </div>

                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="absolute -bottom-2.5 right-1 flex items-center gap-0.5">
                          {Object.entries(
                            msg.reactions.reduce((acc, reaction) => {
                              acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).map(([emoji, count]) => (
                            <div
                              key={emoji}
                              className="bg-[hsl(var(--chat-header))] border border-white/10 px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-0.5 shadow-sm"
                            >
                              <span>{emoji}</span>
                              <span className="text-primary">{count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-3 py-2.5 bg-[hsl(var(--chat-header))] border-t border-white/5">
        {!isConnected && (
          <div className="mb-2 p-2 bg-white/5 rounded-xl text-center">
            <p className="text-xs text-muted-foreground">Connect to start chatting</p>
          </div>
        )}

        {editingMessageId && (
          <div className="flex items-center justify-between bg-primary/5 p-2 rounded-xl mb-2 border-l-2 border-primary">
            <div className="flex flex-col">
              <span className="text-[11px] text-primary font-medium">Editing</span>
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">{editContent}</span>
            </div>
            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={cancelEditing}>
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
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
            className="shrink-0 h-9 w-9 rounded-full hover:bg-white/5 text-[hsl(var(--chat-muted))]"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected}
          >
            <FileIcon className="h-5 w-5" />
          </Button>

          <div className="flex-1 flex items-center bg-[hsl(var(--chat-input-bg))] rounded-full px-4 py-2 border border-white/5">
            <Input
              placeholder={isConnected ? (editingMessageId ? "Edit message..." : "Message") : "Offline"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={!isConnected}
              className="border-0 bg-transparent text-[hsl(var(--chat-text))] placeholder:text-[hsl(var(--chat-muted))] focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-6 text-sm"
            />
          </div>

          <AnimatePresence mode="wait">
            {message.trim() || editingMessageId ? (
              <motion.div
                key="send"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  size="icon"
                  className="shrink-0 h-9 w-9 rounded-full bg-primary hover:bg-primary/90"
                  onClick={handleSend}
                  disabled={!isConnected}
                >
                  {editingMessageId ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="mic"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  size="icon"
                  className={cn(
                    "shrink-0 h-9 w-9 rounded-full transition-colors",
                    isRecording ? "bg-destructive hover:bg-destructive/90 animate-pulse" : "bg-white/5 hover:bg-white/10"
                  )}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!isConnected}
                >
                  {isRecording ? (
                    <div className="h-3 w-3 bg-white rounded-sm" />
                  ) : (
                    <Mic className="h-4 w-4 text-[hsl(var(--chat-muted))]" />
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {isRecording && (
          <div className="text-center text-xs text-destructive mt-1.5 font-medium">
            Recording: {formatDuration(recordingDuration)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
