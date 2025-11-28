import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message } from '@/hooks/usePeer';
import { Send, File as FileIcon, Mic, Trash2, Edit2, MoreVertical, X, Check } from 'lucide-react';
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
  clearChat
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
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          handleSendVoice(base64Audio, recordingDuration);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
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
    if (file) {
      handleSendFile(file);
    }
    if (event.target) {
      event.target.value = '';
    }
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

  return (
    <div className="flex flex-col h-full bg-[#0b141a] rounded-xl">
      {/* WhatsApp-style Header */}
      <div className="px-4 py-3 border-b border-[#2a3942] bg-[#1f2c34]">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-[#e9edef]">Messages</h2>
          <div className="flex items-center gap-4">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#8696a0]">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#2a3942] border-[#1f2c34] text-[#e9edef]">
                <DropdownMenuItem onClick={clearChat} className="text-red-400 focus:text-red-400 focus:bg-[#1f2c34]">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages Area */}
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
                  "flex w-full group",
                  msg.sender === 'me' ? 'justify-end' :
                    msg.sender === 'them' ? 'justify-start' : 'justify-center'
                )}
              >
                <div className={cn(
                  "max-w-[85%] relative",
                  msg.sender === 'me' ? 'items-end' :
                    msg.sender === 'them' ? 'items-start' : 'items-center'
                )}>
                  {msg.nickname && msg.sender === 'them' && (
                    <p className="text-xs text-[#8696a0] mb-1 px-2">{msg.nickname}</p>
                  )}

                  <div
                    className={cn(
                      "relative px-3 py-2 shadow-sm group",
                      msg.sender === 'me'
                        ? 'bg-[#005c4b] text-white rounded-lg rounded-br-none'
                        : msg.sender === 'them'
                          ? 'bg-[#1f2c34] text-[#e9edef] rounded-lg rounded-bl-none'
                          : 'bg-[#182229] text-[#8696a0] italic text-center rounded-lg',
                      msg.sender !== 'system' && msg.messageType !== 'file' && 'cursor-pointer active:opacity-80',
                      msg.isDeleted && "opacity-60 italic"
                    )}
                    onDoubleClick={() => msg.sender !== 'system' && msg.messageType !== 'file' && !msg.isDeleted && handleDoubleClick(msg.id)}
                  >
                    {/* Message Actions Dropdown */}
                    {msg.sender === 'me' && !msg.isDeleted && msg.messageType !== 'system' && (
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-bl-lg p-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-4 w-4 p-0 text-white/70 hover:text-white">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#2a3942] border-[#1f2c34] text-[#e9edef]">
                            {msg.messageType === 'text' && (
                              <DropdownMenuItem onClick={() => startEditing(msg)}>
                                <Edit2 className="h-3 w-3 mr-2" /> Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDeleteMessage(msg.id)} className="text-red-400">
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
                      <div className="flex items-center gap-2 min-w-[150px]">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/30 text-white">
                          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                        </Button>
                        <div className="flex flex-col flex-1">
                          <div className="h-1 bg-white/30 rounded-full w-full mb-1">
                            <div className="h-full bg-white rounded-full w-1/3" />
                          </div>
                          <span className="text-[10px] opacity-70">{formatDuration(msg.voiceDuration || 0)}</span>
                        </div>
                        <audio src={msg.voiceData} controls className="hidden" />
                      </div>
                    ) : (
                      <p className="break-words text-sm leading-snug pr-4">{msg.content}</p>
                    )}

                    <div className="flex items-center justify-end gap-1 mt-1">
                      {msg.isEdited && <span className="text-[10px] opacity-60 italic">edited</span>}
                      {msg.sender !== 'system' && (
                        <p className="text-[10px] opacity-60">{msg.timestamp}</p>
                      )}
                    </div>

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

      {/* Input Area */}
      <div className="px-2 py-2 bg-[#1f2c34]">
        {!isConnected && (
          <div className="mb-2 p-2 bg-[#182229] rounded-lg text-center">
            <p className="text-xs text-[#8696a0]">Connect to start chatting</p>
          </div>
        )}

        {editingMessageId && (
          <div className="flex items-center justify-between bg-[#0b141a] p-2 rounded-t-lg mb-1 border-l-4 border-[#005c4b]">
            <div className="flex flex-col">
              <span className="text-xs text-[#005c4b] font-medium">Editing Message</span>
              <span className="text-xs text-[#8696a0] truncate max-w-[200px]">{editContent}</span>
            </div>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={cancelEditing}>
              <X className="h-4 w-4 text-[#8696a0]" />
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
            className="shrink-0 h-9 w-9 rounded-full hover:bg-[#2a3942] text-[#8696a0] hover:text-[#e9edef]"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected}
          >
            <FileIcon className="h-5 w-5" />
          </Button>

          <div className="flex-1 flex items-center gap-2 bg-[#2a3942] rounded-full px-4 py-2">
            <Input
              placeholder={isConnected ? (editingMessageId ? "Edit message..." : "Message") : "Offline"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={!isConnected}
              className="border-0 bg-transparent text-[#e9edef] placeholder:text-[#8696a0] focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-6 text-sm"
            />
          </div>

          {message.trim() || editingMessageId ? (
            <Button
              size="icon"
              className="shrink-0 h-9 w-9 rounded-full bg-[#25d366] hover:bg-[#20bd5a]"
              onClick={handleSend}
              disabled={!isConnected}
            >
              {editingMessageId ? <Check className="h-4 w-4 text-white" /> : <Send className="h-4 w-4 text-white" />}
            </Button>
          ) : (
            <Button
              size="icon"
              className={cn(
                "shrink-0 h-9 w-9 rounded-full transition-colors",
                isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-[#2a3942] hover:bg-[#374248]"
              )}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isConnected}
            >
              {isRecording ? (
                <div className="h-3 w-3 bg-white rounded-sm" />
              ) : (
                <Mic className="h-4 w-4 text-[#8696a0]" />
              )}
            </Button>
          )}
        </div>
        {isRecording && (
          <div className="text-center text-xs text-red-400 mt-1 font-medium">
            Recording: {formatDuration(recordingDuration)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
