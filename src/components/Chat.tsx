import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Message } from '@/hooks/usePeer';
import {
  Send, Mic, Trash2, Edit2, X, Check,
  MessageCircle, Camera, Video, Paperclip, StopCircle, Play, Pause, MoreVertical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import FileDisplay from './FileDisplay';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
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

const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

// ── Voice player ────────────────────────────────────────────────
const VoicePlayer = ({ src, duration, isMe }: { src: string; duration: number; isMe: boolean }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => { setCurrentTime(a.currentTime); setProgress(a.currentTime / (a.duration || 1)); };
    const onEnded = () => { setPlaying(false); setProgress(0); setCurrentTime(0); };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended', onEnded);
    return () => { a.removeEventListener('timeupdate', onTime); a.removeEventListener('ended', onEnded); };
  }, []);

  const barColor = isMe ? 'rgba(255,255,255,0.6)' : 'rgba(10,132,255,0.8)';
  const trackColor = isMe ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)';

  return (
    <div className="flex items-center gap-3 min-w-[160px] max-w-[220px]">
      <audio ref={audioRef} src={src} preload="none" />
      <button
        onClick={toggle}
        className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90"
        style={{ background: isMe ? 'rgba(255,255,255,0.15)' : 'rgba(10,132,255,0.15)' }}
      >
        {playing
          ? <Pause className="h-4 w-4 text-white" />
          : <Play className="h-4 w-4 text-white ml-0.5" />}
      </button>

      <div className="flex-1 flex flex-col gap-1.5">
        {/* Waveform-style progress bar */}
        <div
          className="relative h-1.5 rounded-full overflow-hidden"
          style={{ background: trackColor }}
          onClick={(e) => {
            if (!audioRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = pct * (audioRef.current.duration || 0);
          }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${progress * 100}%`, background: barColor }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <span className="text-[10px] opacity-50">{playing ? fmt(Math.floor(currentTime)) : fmt(duration)}</span>
      </div>
    </div>
  );
};

// ── Recording overlay ────────────────────────────────────────────
const RecordingBar = ({ duration, onStop, onCancel }: { duration: number; onStop: () => void; onCancel: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    className="flex items-center gap-3 px-4 py-3 bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-2xl mx-3 mb-2"
  >
    <span className="h-2.5 w-2.5 rounded-full bg-[#FF453A] animate-pulse shrink-0" />
    <span className="text-[14px] font-semibold text-[#FF453A] flex-1">Recording {fmt(duration)}</span>

    {/* Animated waveform bars */}
    <div className="flex items-end gap-[3px] mr-2">
      {[5, 9, 6, 11, 7, 10, 5].map((h, i) => (
        <motion.span
          key={i}
          className="w-[2.5px] rounded-full bg-[#FF453A]"
          animate={{ height: [h, h + 6, h, h + 8, h] }}
          transition={{ duration: 0.5 + i * 0.07, repeat: Infinity, ease: 'easeInOut', delay: i * 0.05 }}
          style={{ height: h }}
        />
      ))}
    </div>

    <button onClick={onCancel} className="text-[#FF453A]/60 hover:text-[#FF453A] p-1"><X className="h-4 w-4" /></button>
    <button onClick={onStop} className="h-8 w-8 rounded-full bg-[#FF453A] flex items-center justify-center">
      <StopCircle className="h-4 w-4 text-white" />
    </button>
  </motion.div>
);

// ── Main Chat ────────────────────────────────────────────────────
const Chat = ({
  messages, sendMessage, handleSendFile, isConnected,
  handleSendReaction, handleSendVoice, handleEditMessage,
  handleDeleteMessage, clearChat, remoteNickname,
}: ChatProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showMedia, setShowMedia] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelRef = useRef(false);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    if (editingMessageId) {
      handleEditMessage(editingMessageId, message);
      setEditingMessageId(null); setMessage('');
    } else if (message.trim()) {
      sendMessage(message.trim()); setMessage('');
    }
  };

  // ── Voice recording ──────────────────────────────────────────
  const startRecording = useCallback(async () => {
    cancelRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      mediaRecRef.current = rec;
      audioChunksRef.current = [];

      rec.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };

      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (cancelRef.current) return; // cancelled — don't send
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => handleSendVoice(reader.result as string, recordingDuration);
      };

      rec.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => setRecordingDuration((p) => p + 1), 1000);
    } catch {
      console.warn('Microphone access denied');
    }
  }, [handleSendVoice, recordingDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecRef.current && isRecording) {
      mediaRecRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    cancelRef.current = true;
    stopRecording();
  }, [stopRecording]);

  // ── File / Camera helpers ────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleSendFile(file);
    if (e.target) e.target.value = '';
    setShowMedia(false);
  };

  const startEditing = (msg: Message) => {
    setEditingMessageId(msg.id); setMessage(msg.content); setEditContent(msg.content);
  };
  const cancelEditing = () => { setEditingMessageId(null); setMessage(''); setEditContent(''); };

  const peerInitial = (remoteNickname || 'P')[0].toUpperCase();

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--chat-bg))]">

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5" style={{ WebkitOverflowScrolling: 'touch' }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#0A84FF]/10 border border-[#0A84FF]/20 flex items-center justify-center mx-auto">
                <MessageCircle className="h-7 w-7 text-[#0A84FF]/60" />
              </div>
              <p className="text-[15px] font-semibold text-white/60">No messages yet</p>
              <p className="text-[13px] text-white/30">{isConnected ? 'Say hello! 👋' : 'Connect to start chatting'}</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const prev = messages[idx - 1];
              const grouped = prev && prev.sender === msg.sender && msg.sender !== 'system';

              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} className="flex justify-center my-3">
                    <span className="text-[11px] text-white/25 bg-white/5 px-3 py-1 rounded-full">{msg.content}</span>
                  </div>
                );
              }

              const isMe = msg.sender === 'me';

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn('flex w-full group', isMe ? 'justify-end' : 'justify-start', !grouped && idx > 0 && 'mt-4')}
                >
                  {/* Peer avatar for first in group */}
                  {!isMe && !grouped && (
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#BF5AF2] to-[#0A84FF] flex items-center justify-center text-[11px] font-bold text-white shrink-0 mr-2 mt-auto mb-0.5">
                      {peerInitial}
                    </div>
                  )}
                  {!isMe && grouped && <div className="w-9 shrink-0" />}

                  <div className={cn('max-w-[78%] relative')}>
                    {msg.nickname && !isMe && !grouped && (
                      <p className="text-[11px] text-white/35 mb-1 px-1">{msg.nickname}</p>
                    )}

                    <div
                      className={cn(
                        'relative px-3.5 py-2.5 shadow-sm',
                        isMe
                          ? 'bg-[#0A84FF] text-white rounded-[20px] rounded-br-[5px]'
                          : 'bg-[hsl(var(--chat-bubble-them))] text-white rounded-[20px] rounded-bl-[5px]',
                        msg.isDeleted && 'opacity-50 italic',
                        msg.messageType !== 'file' && 'cursor-pointer active:opacity-80'
                      )}
                      onDoubleClick={() => !msg.isDeleted && msg.messageType !== 'file' && handleSendReaction(msg.id, '❤️')}
                    >
                      {/* Message action menu */}
                      {isMe && !msg.isDeleted && msg.messageType !== 'system' && (
                        <div className="absolute -top-1 -left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="h-5 w-5 flex items-center justify-center rounded-full bg-black/50 text-white/70">
                                <MoreVertical className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="bg-[hsl(var(--chat-header))] border-white/10 text-white">
                              {msg.messageType === 'text' && (
                                <DropdownMenuItem onClick={() => startEditing(msg)}>
                                  <Edit2 className="h-3.5 w-3.5 mr-2" /> Edit
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDeleteMessage(msg.id)} className="text-[#FF453A]">
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}

                      {/* Content */}
                      {msg.messageType === 'file' ? (
                        <FileDisplay fileName={msg.fileName} fileSize={msg.fileSize} fileData={msg.fileData} isMe={isMe} />
                      ) : msg.messageType === 'voice' ? (
                        <VoicePlayer src={msg.voiceData!} duration={msg.voiceDuration || 0} isMe={isMe} />
                      ) : (
                        <p className="break-words text-[15px] leading-relaxed">{msg.content}</p>
                      )}

                      {/* Timestamp + edited */}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        {msg.isEdited && <span className="text-[10px] opacity-40 italic">edited</span>}
                        <p className="text-[10px] opacity-35">{msg.timestamp}</p>
                      </div>
                    </div>

                    {/* Reactions */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className={cn('flex gap-0.5 mt-1', isMe ? 'justify-end' : 'justify-start')}>
                        {Object.entries(
                          msg.reactions.reduce((acc, r) => { acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc; }, {} as Record<string, number>)
                        ).map(([emoji, count]) => (
                          <div key={emoji} className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded-full text-[11px] flex items-center gap-0.5">
                            {emoji}<span className="text-[#0A84FF] font-semibold">{count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Media picker row (Camera / Video / File) ── */}
      <AnimatePresence>
        {showMedia && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-3 px-4 py-3 border-t border-white/[0.05]">
              {/* Camera photo */}
              <button
                className="flex flex-col items-center gap-1.5"
                onClick={() => cameraInputRef.current?.click()}
              >
                <div className="h-14 w-14 rounded-2xl bg-[#0A84FF]/15 border border-[#0A84FF]/25 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-[#0A84FF]" />
                </div>
                <span className="text-[10px] text-white/40 font-medium">Photo</span>
              </button>

              {/* Video note */}
              <button
                className="flex flex-col items-center gap-1.5"
                onClick={() => videoInputRef.current?.click()}
              >
                <div className="h-14 w-14 rounded-2xl bg-[#BF5AF2]/15 border border-[#BF5AF2]/25 flex items-center justify-center">
                  <Video className="h-6 w-6 text-[#BF5AF2]" />
                </div>
                <span className="text-[10px] text-white/40 font-medium">Video</span>
              </button>

              {/* Any file */}
              <button
                className="flex flex-col items-center gap-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="h-14 w-14 rounded-2xl bg-[#30D158]/15 border border-[#30D158]/25 flex items-center justify-center">
                  <Paperclip className="h-6 w-6 text-[#30D158]" />
                </div>
                <span className="text-[10px] text-white/40 font-medium">File</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
      <input ref={videoInputRef} type="file" accept="video/*" capture="environment" onChange={handleFileSelect} className="hidden" />

      {/* ── Input bar ── */}
      <div className="bg-[hsl(var(--chat-header))] border-t border-white/[0.05]">
        {/* Not-connected banner */}
        {!isConnected && (
          <div className="mx-3 mt-2 p-2 bg-white/4 rounded-xl text-center">
            <p className="text-[12px] text-white/30">Connect to a peer to start chatting</p>
          </div>
        )}

        {/* Editing indicator */}
        <AnimatePresence>
          {editingMessageId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between bg-[#0A84FF]/8 px-4 py-2 border-l-2 border-[#0A84FF] mx-3 mt-2 rounded-xl"
            >
              <div>
                <span className="text-[11px] text-[#0A84FF] font-semibold">Editing</span>
                <p className="text-[12px] text-white/40 truncate max-w-[200px]">{editContent}</p>
              </div>
              <button onClick={cancelEditing}><X className="h-4 w-4 text-white/40" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recording bar */}
        <AnimatePresence>
          {isRecording && (
            <RecordingBar duration={recordingDuration} onStop={stopRecording} onCancel={cancelRecording} />
          )}
        </AnimatePresence>

        {/* Main input row */}
        {!isRecording && (
          <div className="flex items-center gap-2 px-3 py-2.5">
            {/* + media button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMedia((v) => !v)}
              className={cn(
                'h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-colors',
                showMedia ? 'bg-[#0A84FF] text-white' : 'bg-white/8 text-white/50 hover:text-white/80'
              )}
              disabled={!isConnected}
            >
              <Paperclip className={cn('h-4 w-4 transition-transform', showMedia && 'rotate-45')} />
            </motion.button>

            {/* Text input */}
            <div className="flex-1 flex items-center bg-white/8 rounded-full px-4 py-2 border border-white/8">
              <Input
                placeholder={isConnected ? (editingMessageId ? 'Edit message…' : 'iMessage') : 'Offline'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={!isConnected}
                className="border-0 bg-transparent text-white placeholder:text-white/25 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-6 text-[15px]"
              />
            </div>

            {/* Send / Mic */}
            <AnimatePresence mode="wait">
              {message.trim() || editingMessageId ? (
                <motion.button
                  key="send"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.15, type: 'spring' }}
                  whileTap={{ scale: 0.88 }}
                  onClick={handleSend}
                  disabled={!isConnected}
                  className="h-9 w-9 rounded-full bg-[#0A84FF] flex items-center justify-center shrink-0 shadow-lg shadow-[#0A84FF]/30"
                >
                  {editingMessageId ? <Check className="h-4 w-4 text-white" /> : <Send className="h-4 w-4 text-white" />}
                </motion.button>
              ) : (
                <motion.button
                  key="mic"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.15, type: 'spring' }}
                  whileTap={{ scale: 0.88 }}
                  onPointerDown={isConnected ? startRecording : undefined}
                  className="h-9 w-9 rounded-full bg-white/8 hover:bg-white/12 flex items-center justify-center shrink-0 transition-colors"
                  disabled={!isConnected}
                  title="Hold to record"
                >
                  <Mic className="h-4 w-4 text-white/50" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
