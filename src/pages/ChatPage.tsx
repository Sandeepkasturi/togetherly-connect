import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Phone, Video, Send, Check, CheckCheck, Loader2,
  MessageCircle, Plus, Image as ImageIcon, File as FileIcon,
  Mic, Square, Play, Pause, Trash2, MoreVertical, Download, X, Tv,
  Search, Users, Camera
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useChat, ChatMessage, getUnreadCounts } from '@/hooks/useChat';
import { AppContextType } from '@/layouts/AppLayout';
import { DBUser } from '@/lib/supabase';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CameraCapture } from '@/components/CameraCapture';

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

// ── Instagram-style Chat List ──────────────────────────────────
interface ChatConversation {
  friend: DBUser;
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

const ChatList = ({ userProfile, navigate }: { userProfile: any; navigate: (path: string) => void }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!userProfile) return;
    const loadConversations = async () => {
      setLoading(true);
      try {
        // Load friends
        const { data: followData } = await supabase
          .from('follows')
          .select('followerUser:users!follower_id(*), followingUser:users!following_id(*)')
          .or(`follower_id.eq.${userProfile.id},following_id.eq.${userProfile.id}`)
          .eq('status', 'accepted');

        const friendMap = new Map<string, DBUser>();
        (followData ?? []).forEach((f: any) => {
          const friend = f.followerUser.id === userProfile.id ? f.followingUser : f.followerUser;
          if (friend && !friendMap.has(friend.id)) friendMap.set(friend.id, friend);
        });

        const friendsList = Array.from(friendMap.values());

        // Get unread counts
        const unreadCounts = await getUnreadCounts(userProfile.id);

        // Get last message for each friend
        const convos: ChatConversation[] = [];
        for (const friend of friendsList) {
          const { data: lastMsgs } = await supabase
            .from('messages')
            .select('*')
            .or(
              `and(sender_id.eq.${userProfile.id},receiver_id.eq.${friend.id}),` +
              `and(sender_id.eq.${friend.id},receiver_id.eq.${userProfile.id})`
            )
            .order('created_at', { ascending: false })
            .limit(1);

          convos.push({
            friend,
            lastMessage: (lastMsgs?.[0] as ChatMessage) ?? null,
            unreadCount: unreadCounts[friend.id] ?? 0,
          });
        }

        // Sort: unread first, then by last message time
        convos.sort((a, b) => {
          if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
          if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
          const aTime = a.lastMessage?.created_at ?? '0';
          const bTime = b.lastMessage?.created_at ?? '0';
          return bTime.localeCompare(aTime);
        });

        setConversations(convos);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, [userProfile]);

  const filteredConversations = searchQuery.trim()
    ? conversations.filter(c => c.friend.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return format(d, 'h:mm a');
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d');
  };

  const getPreview = (msg: ChatMessage | null) => {
    if (!msg) return 'Tap to start chatting';
    if (msg.type === 'image') return '📷 Photo';
    if (msg.type === 'voice') return '🎤 Voice message';
    if (msg.type === 'file') return `📎 ${msg.file_name || 'File'}`;
    if (msg.type === 'watch_invite') return '🎥 Watch invite';
    return msg.content.length > 50 ? msg.content.slice(0, 50) + '…' : msg.content;
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F]">
      {/* Header */}
      <div className="px-5 pt-6 pb-2 shrink-0 bg-[#000000] border-b border-white/[0.05] z-10 relative">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[28px] font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Messages
          </h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/friends')}
            className="h-10 w-10 flex items-center justify-center text-white/90 hover:bg-white/5 rounded-full transition-all"
          >
            <Users className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-[#0A84FF] transition-colors" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full rounded-[10px] pl-11 pr-5 py-2 text-[15px] text-white outline-none bg-[#262626] border-none focus:bg-[#333333] transition-all placeholder:text-[#A8A8A8] font-medium"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="flex justify-center pt-16">
            <Loader2 className="h-8 w-8 text-[#0A84FF] animate-spin opacity-30" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-20 h-20 rounded-full bg-[#0A84FF]/10 flex items-center justify-center mb-6">
              <MessageCircle className="h-10 w-10 text-[#0A84FF]" />
            </motion.div>
            <h2 className="text-lg font-bold text-white mb-2">No conversations yet</h2>
            <p className="text-white/40 text-sm max-w-[260px] leading-relaxed mb-6">
              Add friends to start chatting with them
            </p>
            <button
              onClick={() => navigate('/friends?filter=discover')}
              className="bg-[#0A84FF] text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-[#0A84FF]/20"
            >
              Find Friends
            </button>
          </div>
        ) : (
          <div className="px-2">
            {filteredConversations.map((convo, i) => {
              const { friend, lastMessage, unreadCount } = convo;
              const isMine = lastMessage?.sender_id === userProfile?.id;

              return (
                <motion.button
                  key={friend.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(`/chat/${friend.id}`)}
                  className="w-full flex items-center gap-3.5 px-5 py-2 hover:bg-[#121212] active:bg-[#1A1A1A] transition-colors text-left"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="h-14 w-14 rounded-full overflow-hidden bg-[#262626]">
                      {friend.photo_url ? (
                        <img src={friend.photo_url} alt={friend.display_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0A84FF] to-[#BF5AF2] flex items-center justify-center text-white font-bold text-lg">
                          {friend.display_name[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    {friend.is_online && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-[#30D158] border-[3px] border-[#0A0A0F]"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 border-b border-white/[0.04] pb-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-[16px] font-semibold truncate",
                        unreadCount > 0 ? "text-white" : "text-white/90"
                      )}>
                        {friend.display_name}
                      </span>
                      {lastMessage && (
                        <span className={cn(
                          "text-[12px] shrink-0 ml-2",
                          unreadCount > 0 ? "text-[#0A84FF] font-bold" : "text-white/30"
                        )}>
                          {formatTime(lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        "text-[13px] truncate pr-2",
                        unreadCount > 0 ? "text-white/70 font-medium" : "text-white/35"
                      )}>
                        {isMine && lastMessage && <span className="text-white/25">You: </span>}
                        {getPreview(lastMessage)}
                      </p>
                      {unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="shrink-0 min-w-[22px] h-[22px] rounded-full bg-[#0A84FF] text-white text-[11px] font-bold flex items-center justify-center px-1.5"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </motion.span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Individual Chat View ──────────────────────────────────────
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
  const [isSelectMode, setIsSelectMode] = useState(false); // Added state for select mode
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const toggleSelection = (id: string) => {
    setSelectedMessages(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (next.size === 0) setIsSelectMode(false);
      return next;
    });
  };

  const handleLongPress = (id: string) => {
    setIsSelectMode(true);
    setSelectedMessages(new Set([id]));
  };

  const deleteSelected = async () => {
    if (selectedMessages.size === 0) return;
    setIsSelectMode(false);
    for (const id of selectedMessages) {
      await deleteMessage(id);
    }
    setSelectedMessages(new Set());
    toast({ title: 'Messages Deleted', description: 'Successfully removed from database' });
  };

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

  const handleDirectMedia = async (file: File, type: 'image' | 'video') => {
    const attachType = type === 'video' ? 'file' : 'image';
    const success = await sendMessage('', attachType, { file, name: file.name, size: file.size });
    if (!success) {
      toast({ title: 'Upload failed', description: 'Could not send captured media', variant: 'destructive' });
    }
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
    return <ChatList userProfile={userProfile} navigate={navigate} />;
  }

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-[#000000] relative overflow-hidden">
      {/* Instagram dark background is solid #000 */}

      {/* Luxury Floating Header */}
      <div className="sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 bg-[#000000] border-b border-white/[0.05]">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="h-10 w-10 flex items-center text-white/90 hover:opacity-70 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>

          <div className="relative group cursor-pointer">
            <div className="h-9 w-9 rounded-full overflow-hidden bg-[#262626]">
              <img
                src={friend?.photo_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${friendId}`}
                className="h-full w-full object-cover"
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
            <p className="text-[15px] font-semibold text-white tracking-tight leading-tight">{friend?.display_name ?? '...'}</p>
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
              className="h-10 w-10 flex items-center justify-center text-white/90 hover:opacity-70 transition-all"
            >
              <Phone className="h-5 w-5" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => initiateCall(friendId!, 'video')}
              className="h-10 w-10 flex items-center justify-center text-white/90 hover:opacity-70 transition-all"
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
                      payload: { peer_id: userProfile?.peer_id }
                    };
                    await supabase.from('messages').insert(inviteMsg);
                    localStorage.setItem('peerIdToConnect', friend.peer_id);
                    navigate('/watch');
                  };
                  invite();
                }}
                className="h-10 w-10 flex items-center justify-center text-white/90 hover:opacity-70 transition-all"
              >
                <Tv className="h-5 w-5" />
              </motion.button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button whileTap={{ scale: 0.9 }} className="h-10 w-10 flex items-center justify-center text-white/90 hover:opacity-70 transition-all">
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
          <div className="flex flex-col gap-2 w-full mx-auto relative px-2">

            {/* Multi-Select Action Bar */}
            <AnimatePresence>
              {isSelectMode && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="sticky top-2 mx-2 bg-[#262626] rounded-[22px] p-3 px-5 flex items-center justify-between shadow-2xl z-50 border border-white/10"
                >
                  <button onClick={() => { setIsSelectMode(false); setSelectedMessages(new Set()); }} className="text-white/70 font-medium active:scale-95 transition-all">Cancel</button>
                  <span className="text-white font-black tracking-tight">{selectedMessages.size} Selected</span>
                  <button onClick={deleteSelected} className="text-[#FF3B30] font-bold active:scale-95 transition-all">Delete</button>
                </motion.div>
              )}
            </AnimatePresence>

            {messages.map((msg, i) => {
              const mine = isMe(msg);
              const showDate = i === 0 || formatDateLabel(messages[i - 1].created_at) !== formatDateLabel(msg.created_at);

              return (
                <div key={msg.id} className="w-full">
                  {showDate && (
                    <div className="flex justify-center my-6">
                      <span className="text-[12px] font-medium text-[#A8A8A8]">
                        {formatDateLabel(msg.created_at)}
                      </span>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, x: mine ? 20 : -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className={cn(
                      "flex group mb-2 px-1 transition-all duration-300 relative",
                      mine ? "justify-end" : "justify-start"
                    )}
                  >
                    {isSelectMode && (
                      <div
                        onClick={() => toggleSelection(msg.id)}
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-full border-2 transition-all z-10 cursor-pointer shadow-lg",
                          mine ? "left-4" : "right-4",
                          selectedMessages.has(msg.id) ? "bg-[#0A84FF] border-[#0A84FF]" : "border-white/20 bg-black/20"
                        )}
                      >
                        {selectedMessages.has(msg.id) && <Check className="h-4 w-4 text-white" />}
                      </div>
                    )}

                    <div
                      onContextMenu={(e) => { e.preventDefault(); handleLongPress(msg.id); }}
                      onClick={() => { if (isSelectMode) toggleSelection(msg.id); }}
                      className={cn(
                        "relative max-w-[75%] px-3.5 py-2.5 group transition-transform",
                        isSelectMode ? (mine ? "translate-x-[-48px]" : "translate-x-[48px]") : "",
                        mine
                          ? "bg-[#3797F0] text-white rounded-[22px] rounded-br-[4px]"
                          : "bg-[#262626] text-white rounded-[22px] rounded-bl-[4px]",
                        isSelectMode && "cursor-pointer"
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
            className="flex-1 min-h-[44px] rounded-full bg-[#262626] border border-transparent flex flex-col overflow-hidden transition-all focus-within:border-white/20"
          >
            <div className="flex items-end px-2 py-2">
              {/* Attachment Actions */}
              {/* Attachment Actions */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCameraOpen(true)}
                className="h-9 w-9 rounded-full flex items-center justify-center bg-[#0095F6] text-white hover:bg-[#1877F2] transition-all mb-1 ml-1 shrink-0"
              >
                <Camera className="h-5 w-5" />
              </motion.button>

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
                  placeholder="Message..."
                  className="flex-1 bg-transparent border-none text-white text-[15px] font-normal py-2.5 px-3 outline-none resize-none max-h-32 min-h-[44px] no-scrollbar placeholder:text-[#A8A8A8]"
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

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {(!input.trim() && !isRecording) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => startRecording()}
                className="h-11 w-11 shrink-0 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 transition-all duration-200"
              >
                <Mic className="h-6 w-6" />
              </motion.button>
            )}
            {(!input.trim() && !isRecording) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="h-11 w-11 shrink-0 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 transition-all duration-200"
              >
                <ImageIcon className="h-6 w-6" />
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e, 'image')}
                />
              </motion.button>
            )}

            {(input.trim() || isRecording) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={isRecording ? stopRecording : handleSend}
                disabled={sending}
                className={cn(
                  "h-11 px-4 shrink-0 rounded-full flex items-center justify-center transition-all duration-200",
                  "text-[#0095F6] font-semibold text-base hover:text-white"
                )}
              >
                {sending ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : isRecording ? (
                  <Square className="h-6 w-6 fill-current rounded-sm shadow-inner" />
                ) : input.trim() ? (
                  "Send"
                ) : (
                  ""
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isCameraOpen && (
          <CameraCapture
            onClose={() => setIsCameraOpen(false)}
            onCapture={handleDirectMedia}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
