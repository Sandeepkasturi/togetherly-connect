import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Phone, Video, Send, Check, CheckCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useCallSignaling } from '@/hooks/useCallSignaling';
import { DBUser } from '@/lib/supabase';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, delay } },
});

const ChatPage = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const { userProfile, permanentPeerId } = useAuth();

  const [friend, setFriend] = useState<DBUser | null>(null);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, loading, sending, sendMessage, markAllRead } = useChat({
    currentUserId: userProfile?.id ?? '',
    friendId: friendId ?? '',
  });

  const { initiateCall } = useCallSignaling({
    currentUserId: userProfile?.id ?? '',
    currentPeerId: permanentPeerId ?? '',
    onIncomingCall: () => { },
    onCallAccepted: () => { },
    onCallEnded: () => { },
  });

  useEffect(() => {
    if (!friendId) return;
    supabase.from('users').select('*').eq('id', friendId).single()
      .then(({ data }) => { if (data) setFriend(data as DBUser); });
  }, [friendId]);

  useEffect(() => { markAllRead(); }, [markAllRead]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  }, [input, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleCall = async (type: 'audio' | 'video') => {
    if (!friendId) return;
    await initiateCall(friendId, type);
  };

  const isMe = (msg: ChatMessage) => msg.sender_id === userProfile?.id;

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0F]">

      {/* Header */}
      <motion.div
        {...fadeUp(0)}
        className="flex items-center gap-3 px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)]"
        style={{
          background: 'rgba(10,10,18,0.90)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <button onClick={() => navigate(-1)}
          className="h-9 w-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="relative">
          <div className="h-9 w-9 rounded-full overflow-hidden bg-white/10">
            <img
              src={friend?.photo_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${friendId}`}
              alt={friend?.display_name} className="h-full w-full object-cover"
            />
          </div>
          {friend?.is_online && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#30D158] ring-2 ring-[#0A0A0F]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-white truncate">{friend?.display_name ?? '...'}</p>
          <p className="text-[11px] text-white/40">{friend?.is_online ? 'Online' : 'Offline'}</p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => handleCall('audio')}
            className="h-9 w-9 rounded-full flex items-center justify-center text-[#30D158] bg-[#30D158]/10 hover:bg-[#30D158]/20 transition-colors">
            <Phone className="h-4 w-4" />
          </button>
          <button onClick={() => handleCall('video')}
            className="h-9 w-9 rounded-full flex items-center justify-center text-[#0A84FF] bg-[#0A84FF]/10 hover:bg-[#0A84FF]/20 transition-colors">
            <Video className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{ WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <div className="flex justify-center pt-8">
            <Loader2 className="h-6 w-6 text-white/30 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <motion.div {...fadeUp(0.1)} className="flex flex-col items-center pt-16 space-y-3 text-center">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-white/5">
              <img src={friend?.photo_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${friendId}`} alt="" className="h-full w-full object-cover" />
            </div>
            <p className="text-[15px] font-semibold text-white">{friend?.display_name}</p>
            <p className="text-[13px] text-white/40">Start a conversation!</p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const mine = isMe(msg);
              const showDate = i === 0 ||
                new Date(messages[i - 1].created_at).toDateString() !== new Date(msg.created_at).toDateString();
              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="text-center my-3">
                      <span className="text-[10px] text-white/30 px-3 py-1 rounded-full bg-white/5">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${mine ? 'justify-end' : 'justify-start'} mb-1`}
                  >
                    <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[14px] leading-relaxed
                      ${mine ? 'bg-[#0A84FF] text-white rounded-br-md' : 'bg-white/10 text-white/90 rounded-bl-md'}`}>
                      <p>{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-0.5 ${mine ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[10px] opacity-55">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {mine && (msg.read_at
                          ? <CheckCheck className="h-3 w-3 opacity-80" />
                          : <Check className="h-3 w-3 opacity-45" />)}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <motion.div
        {...fadeUp(0.1)}
        className="px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]"
        style={{
          background: 'rgba(10,10,18,0.90)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${friend?.display_name?.split(' ')[0] ?? ''}...`}
            className="flex-1 text-white placeholder-white/30 text-[14px] px-4 py-3 rounded-2xl outline-none border border-white/10 focus:border-white/25 transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />
          <motion.button whileTap={{ scale: 0.88 }}
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="h-11 w-11 rounded-full flex items-center justify-center disabled:opacity-40 transition-opacity"
            style={{ background: input.trim() ? 'linear-gradient(135deg,#0A84FF,#7A38FF)' : 'rgba(255,255,255,0.08)' }}>
            {sending
              ? <Loader2 className="h-4 w-4 text-white animate-spin" />
              : <Send className="h-4 w-4 text-white" />}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatPage;
