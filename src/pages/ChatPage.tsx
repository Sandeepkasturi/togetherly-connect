import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Phone, Video, Send, Check, CheckCheck, Loader2,
  MessageCircle, Plus, Image as ImageIcon, File as FileIcon,
  Mic, Square, Play, Pause, Trash2, MoreVertical, Download, X, Tv
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { AppContextType } from '@/layouts/AppLayout';
import { DBUser } from '@/lib/supabase';
import { format, isToday, isYesterday } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const VoicePlayer = ({ url, duration, isMine }: { url: string, duration?: number, isMine: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.error("Playback failed", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-4 w-full min-w-[240px] py-2 px-3 rounded-[24px] bg-white/5 border border-white/5 backdrop-blur-sm">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={(e) => setProgress((e.currentTarget.currentTime / (e.currentTarget.duration || 1)) * 100)}
        onEnded={() => { setIsPlaying(false); setProgress(0); }}
        className="hidden"
      />
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={togglePlay}
        className={cn(
          "h-12 w-12 shrink-0 rounded-[18px] flex items-center justify-center transition-all shadow-lg",
          isMine ? "bg-white text-primary" : "bg-primary text-white"
        )}
      >
        {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-1" />}
      </motion.button>

      <div className="flex-1 space-y-2">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={cn("h-full rounded-full transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.3)]", isMine ? "bg-white" : "bg-primary")}
          />
        </div>
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
          <span>{formatDuration(Math.round((progress / 100) * (duration || 0)))}</span>
          <span>{duration ? formatDuration(Math.round(duration)) : '0:00'}</span>
        </div>
      </div>
    </div>
  );
};

const ChatPage = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const [friend, setFriend] = useState<DBUser | null>(null);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const durationRef = useRef(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    messages, loading, sending, sendMessage,
    deleteMessage, clearChat, markAllRead
  } = useChat({
    currentUserId: userProfile?.id ?? '',
    friendId: friendId ?? '',
  });

  const { initiateCall } = useOutletContext<AppContextType>();

  useEffect(() => {
    if (!friendId) return;
    supabase.from('users').select('*').eq('id', friendId).single()
      .then(({ data }) => { if (data) setFriend(data as DBUser); });
  }, [friendId]);

  useEffect(() => {
    const intent = localStorage.getItem('share_intent');
    if (intent) {
      setInput(intent);
      localStorage.removeItem('share_intent');
    }
  }, []);

  useEffect(() => { markAllRead(); }, [markAllRead]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [messages, loading]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || sending) return;
    const text = input;
    setInput('');
    const success = await sendMessage(text);
    if (!success) {
      toast({ title: 'Failed to send', description: 'Please try again', variant: 'destructive' });
      setInput(text); // Restore input on failure
    }
  }, [input, sendMessage, sending, toast]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max size is 10MB', variant: 'destructive' });
      return;
    }

    const success = await sendMessage('', type, { file, name: file.name, size: file.size });
    if (!success) {
      toast({ title: 'Upload failed', description: 'Could not send file', variant: 'destructive' });
    }
    // Reset input
    e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      durationRef.current = 0;
      setRecordingDuration(0);

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const finalDuration = durationRef.current;
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });

        const success = await sendMessage('', 'voice', {
          file: audioBlob,
          name: `voice_${Date.now()}.webm`,
          duration: finalDuration
        });

        if (!success) {
          toast({ title: 'Voice message failed', description: 'Could not send recording', variant: 'destructive' });
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setRecordingDuration(durationRef.current);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
      toast({ title: 'Permission Denied', description: 'Could not access microphone', variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setMediaRecorder(null);
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatDateLabel = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMMM d, yyyy');
  };

  const isMe = (msg: ChatMessage) => msg.sender_id === userProfile?.id;

  if (!friendId) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <MessageCircle className="h-10 w-10 text-primary" />
        </motion.div>
        <h2 className="text-xl font-bold text-white mb-2">Togetherly Chat</h2>
        <p className="text-white/50 max-w-[260px] leading-relaxed mb-8">
          Secure, real-time messaging with your friends. Select a friend to start chatting.
        </p>
        <button
          onClick={() => navigate('/friends')}
          className="ios-btn bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg"
        >
          View Friends
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-[#0A0A0F] relative overflow-hidden">
      {/* WhatsApp Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')` }} />

      {/* Luxury Floating Header */}
      <div className="sticky top-0 z-30 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-[28px] bg-[#121217]/60 backdrop-blur-2xl border border-white/5 shadow-2xl">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full flex items-center justify-center text-white/50 hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>

          <div className="relative group cursor-pointer">
            <div className="h-11 w-11 rounded-[16px] overflow-hidden bg-white/10 p-0.5 border border-white/10 group-hover:border-[#0A84FF]/40 transition-colors">
              <img
                src={friend?.photo_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${friendId}`}
                className="h-full w-full object-cover rounded-[14px]"
              />
            </div>
            {friend?.is_online && (
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#30D158] border-2 border-[#121217] shadow-lg"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-black text-white truncate tracking-tight">{friend?.display_name ?? '...'}</p>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "h-1.5 w-1.5 rounded-full",
                friend?.is_online ? "bg-[#30D158] glow-green" : "bg-white/20"
              )} />
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest truncate">
                {friend?.is_online ? 'Active Now' : 'Disconnected'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mr-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => initiateCall(friendId!, 'audio')}
              className="h-10 w-10 rounded-[14px] flex items-center justify-center bg-white/[0.04] text-white/60 hover:bg-[#30D158]/10 hover:text-[#30D158] transition-all"
            >
              <Phone className="h-5 w-5" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => initiateCall(friendId!, 'video')}
              className="h-10 w-10 rounded-[14px] flex items-center justify-center bg-white/[0.04] text-white/60 hover:bg-[#0A84FF]/10 hover:text-[#0A84FF] transition-all"
            >
              <Video className="h-5 w-5" />
            </motion.button>

            {friend && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  const invite = async () => {
                    const inviteMsg = {
                      sender_id: userProfile?.id,
                      receiver_id: friend.id,
                      content: `🎥 I'm inviting you to watch together!`,
                      type: 'watch_invite',
                      payload: { peer_id: permanentPeerId }
                    };
                    await supabase.from('messages').insert(inviteMsg);
                    localStorage.setItem('peerIdToConnect', friend.peer_id);
                    navigate('/watch');
                  };
                  invite();
                }}
                className="h-10 w-10 rounded-[14px] flex items-center justify-center bg-[#FF375F]/5 text-[#FF375F]/60 hover:bg-[#FF375F]/10 hover:text-[#FF375F] transition-all shadow-sm"
              >
                <Tv className="h-5 w-5" />
              </motion.button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button whileTap={{ scale: 0.9 }} className="h-10 w-10 rounded-[14px] flex items-center justify-center bg-white/[0.04] text-white/40 hover:bg-white/10 transition-all">
                  <MoreVertical className="h-5 w-5" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1A1A23] border-white/10 rounded-[20px] p-1 shadow-2xl">
                <DropdownMenuItem onClick={clearChat} className="text-red-400 focus:text-red-400 focus:bg-red-400/10 rounded-[14px] p-2.5 font-bold cursor-pointer">
                  Clear Conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 z-10 no-scrollbar">
        {loading ? (
          <div className="flex justify-center pt-8"><Loader2 className="h-8 w-8 text-[#0A84FF] animate-spin opacity-20" /></div>
        ) : (
          <div className="flex flex-col gap-2 pb-6">
            {messages.map((msg, i) => {
              const mine = isMe(msg);
              const showDate = i === 0 || formatDateLabel(messages[i - 1].created_at) !== formatDateLabel(msg.created_at);

              return (
                <div key={msg.id} className="w-full">
                  {showDate && (
                    <div className="flex justify-center my-8">
                      <span className="text-[10px] font-black text-white/20 px-4 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] uppercase tracking-[0.2em] shadow-sm">
                        {formatDateLabel(msg.created_at)}
                      </span>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, x: mine ? 20 : -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className={cn(
                      "flex group mb-2 px-1 transition-all duration-300",
                      mine ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "relative max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-[28px] shadow-2xl group",
                      mine
                        ? "bg-[#0A84FF] text-white rounded-tr-none shadow-[#0A84FF]/10 ring-1 ring-white/10"
                        : "bg-[#1C1C26]/80 backdrop-blur-xl text-white rounded-tl-none border border-white/5"
                    )}>
                      {/* Multimedia Content */}
                      {msg.type === 'image' && msg.file_url && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="mb-3 rounded-[22px] overflow-hidden border border-white/10 bg-black/40 shadow-xl"
                        >
                          <img
                            src={msg.file_url}
                            alt="Shared"
                            className="max-w-full h-auto object-cover cursor-pointer"
                            onClick={() => window.open(msg.file_url, '_blank')}
                          />
                        </motion.div>
                      )}

                      {msg.type === 'file' && msg.file_url && (
                        <div className="mb-3 p-4 rounded-[22px] bg-black/20 flex items-center gap-4 border border-white/5">
                          <div className="h-12 w-12 rounded-[16px] bg-[#0A84FF]/10 flex items-center justify-center text-[#0A84FF] border border-[#0A84FF]/20">
                            <FileIcon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold truncate leading-tight">{msg.file_name}</p>
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-1">
                              {(msg.file_size! / 1024).toFixed(0)} KB · DOCUMENT
                            </p>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => window.open(msg.file_url, '_blank')}
                            className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </motion.button>
                        </div>
                      )}

                      {msg.type === 'voice' && msg.file_url && (
                        <VoicePlayer url={msg.file_url} duration={msg.duration} isMine={mine} />
                      )}

                      {msg.type === 'watch_invite' && (
                        <div className="mb-3 p-5 rounded-[24px] bg-black/40 flex flex-col gap-4 border border-white/5 min-w-[240px] shadow-2xl">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-[18px] bg-[#FF375F]/20 flex items-center justify-center text-[#FF375F] border border-[#FF375F]/20 relative">
                              <Tv className="h-7 w-7" />
                              <div className="absolute inset-0 bg-[#FF375F]/20 rounded-[18px] blur-xl animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[16px] font-black tracking-tight leading-tight">Togetherly Watch</p>
                              <p className="text-[11px] font-bold opacity-30 uppercase tracking-widest mt-1">Live Session Invite</p>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (msg.payload?.peer_id) {
                                localStorage.setItem('peerIdToConnect', msg.payload.peer_id);
                                navigate('/watch');
                              }
                            }}
                            className="w-full py-3.5 bg-gradient-to-r from-[#FF375F] to-[#FF2D55] text-white rounded-[16px] text-sm font-black uppercase tracking-wider transition-all shadow-[0_10px_20px_rgba(255,55,95,0.3)] flex items-center justify-center gap-2.5"
                          >
                            <Play className="h-4 w-4 fill-current" />
                            Join Session
                          </motion.button>
                        </div>
                      )}

                      {msg.content && (msg.type === 'text' || (msg.type !== 'voice' && msg.type !== 'watch_invite' && !msg.file_url)) && (
                        <p className="text-[16px] leading-[1.45] font-medium tracking-tight whitespace-pre-wrap">{msg.content}</p>
                      )}

                      <div className={cn(
                        "flex items-center gap-2 mt-2 transition-opacity",
                        mine ? "justify-end" : "justify-start"
                      )}>
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] opacity-30">
                          {format(new Date(msg.created_at), 'h:mm a')}
                        </span>
                        {mine && (
                          msg.read_at
                            ? <CheckCheck className="h-3 w-3 text-white/60" />
                            : <Check className="h-3 w-3 text-white/30" />
                        )}
                      </div>

                      {/* Delete Action (Luxury Popup) */}
                      <motion.button
                        whileHover={{ scale: 1.2, backgroundColor: 'rgba(255,59,48,0.2)' }}
                        onClick={() => deleteMessage(msg.id)}
                        className={cn(
                          "absolute top-2 h-7 w-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40 text-red-500 shadow-xl",
                          mine ? "-left-10" : "-right-10"
                        )}
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Luxury Liquid Input Bar */}
      <div className="p-4 pt-2 shrink-0 z-30 bg-gradient-to-t from-[#0A0A0F] to-transparent">
        <div className="flex items-end gap-3 max-w-5xl mx-auto">
          <motion.div
            layout
            className="flex-1 min-h-[56px] rounded-[32px] bg-white/[0.03] border border-white/[0.08] backdrop-blur-3xl shadow-2xl flex flex-col overflow-hidden transition-all focus-within:border-[#0A84FF]/40 focus-within:bg-white/[0.05]"
          >
            <div className="flex items-end px-2 py-2">
              {/* Attachment Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all mb-1 ml-1"
                  >
                    <Plus className="h-6 w-6" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="bg-[#1A1A23]/95 backdrop-blur-2xl border-white/5 rounded-[28px] p-2 mb-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <DropdownMenuItem className="p-0 mb-1 border-none bg-transparent focus:bg-transparent">
                    <label className="flex items-center gap-4 w-full px-4 py-3.5 rounded-[20px] cursor-pointer hover:bg-white/5 transition-colors text-white/90">
                      <div className="h-11 w-11 rounded-[16px] bg-[#0A84FF]/10 flex items-center justify-center text-[#0A84FF] border border-[#0A84FF]/10">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-black tracking-tight">Gallery</span>
                        <span className="text-[10px] font-bold opacity-30 uppercase tracking-[0.1em]">Photos & Videos</span>
                      </div>
                      <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                    </label>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-0 border-none bg-transparent focus:bg-transparent">
                    <label className="flex items-center gap-4 w-full px-4 py-3.5 rounded-[20px] cursor-pointer hover:bg-white/5 transition-colors text-white/90">
                      <div className="h-11 w-11 rounded-[16px] bg-[#BF5AF2]/10 flex items-center justify-center text-[#BF5AF2] border border-[#BF5AF2]/10">
                        <FileIcon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-black tracking-tight">Documents</span>
                        <span className="text-[10px] font-bold opacity-30 uppercase tracking-[0.1em]">Shared Files</span>
                      </div>
                      <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'file')} />
                    </label>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isRecording ? (
                <div className="flex-1 flex items-center px-4 h-[44px] gap-4">
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="h-3 w-3 rounded-full bg-[#FF3B30] glow-red"
                  />
                  <div className="flex flex-col">
                    <span className="text-[16px] font-black text-white tabular-nums tracking-tight">
                      {formatDuration(recordingDuration)}
                    </span>
                    <span className="text-[9px] font-black text-[#FF3B30] uppercase tracking-[0.15em]">Live Recording</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setIsRecording(false);
                      if (mediaRecorder) {
                        mediaRecorder.onstop = null;
                        mediaRecorder.stop();
                      }
                      setMediaRecorder(null);
                      if (timerRef.current) clearInterval(timerRef.current);
                      setRecordingDuration(0);
                    }}
                    className="ml-auto h-10 w-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </motion.button>
                </div>
              ) : (
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Shared thoughts..."
                  className="flex-1 bg-transparent border-none text-white text-[16px] font-medium py-3 px-3 outline-none resize-none max-h-40 min-h-[44px] no-scrollbar placeholder:text-white/10"
                  rows={1}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
              )}
            </div>
          </motion.div>

          {/* Primary Action Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={isRecording ? stopRecording : (input.trim() ? handleSend : startRecording)}
            disabled={sending}
            className={cn(
              "h-14 w-14 shrink-0 rounded-[28px] flex items-center justify-center shadow-2xl transition-all duration-500",
              (input.trim() || isRecording)
                ? "bg-[#0A84FF] text-white shadow-[#0A84FF]/20"
                : "bg-white/5 text-white/30 border border-white/5 hover:bg-white/10 hover:text-white"
            )}
          >
            {sending ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isRecording ? (
              <Square className="h-6 w-6 fill-current rounded-sm shadow-inner" />
            ) : input.trim() ? (
              <Send className="h-6 w-6 fill-current ml-0.5" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
