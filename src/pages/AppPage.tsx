import { useOutletContext, useNavigate } from 'react-router-dom';
import { AppContextType } from '@/layouts/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tv2,
  MessageCircle,
  MonitorUp,
  Zap,
  ArrowRight,
  ChevronRight,
  Shield,
  Star,
  UserCircle,
  Power,
  LogOut,
  Bell,
  Users as UsersIcon,
  Circle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PeerConnection from '@/components/PeerConnection';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import AppFooter from '@/components/AppFooter';
import { cn } from '@/lib/utils';
import { getUnreadCounts } from '@/hooks/useChat';

const QUICK_ACTIONS = [
  { icon: Tv2, color: '#0A84FF', label: 'Theater', sub: 'Immersive Viewing', to: '/watch' },
  { icon: MessageCircle, color: '#BF5AF2', label: 'Chat', sub: 'End-to-End encrypted', to: '/chat' },
  { icon: MonitorUp, color: '#30D158', label: 'Shots', sub: 'share content', to: '/share' },
  { icon: UserCircle, color: '#FF9F0A', label: 'Identity', sub: 'Check Profile', to: '/profile' },
];

const FEATURES = [
  { icon: Zap, color: '#FFD60A', label: 'Zero Latency', desc: 'Direct P2P — no relay servers' },
  { icon: Shield, color: '#30D158', label: 'End-to-End', desc: 'Encrypted WebRTC connection' },
  { icon: Star, color: '#FF9F0A', label: 'Free Forever', desc: 'No accounts, no subscriptions' },
];

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay: d, ease: [0.32, 0.72, 0, 1] },
});

const AppPage = () => {
  const context = useOutletContext<AppContextType>();
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const [showConnect, setShowConnect] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);

  const { isConnected, disconnectPeer, remoteNickname, myNickname } = context;
  const displayName = userProfile?.display_name || myNickname;

  useEffect(() => {
    if (userProfile?.id) {
      // 1. Unread counts
      getUnreadCounts(userProfile.id).then(counts => {
        const total = Object.values(counts).reduce((a, b) => a + (b as number), 0);
        setUnreadTotal(total);
      });

      // 2. Online friends
      supabase.from('follows')
        .select(`
          friend:users!follows_friend_id_fkey(is_online)
        `)
        .eq('user_id', userProfile.id)
        .eq('status', 'accepted')
        .then(({ data }) => {
          if (data) {
            const online = data.filter((f: any) => f.friend?.is_online).length;
            setOnlineCount(online);
          }
        });
    }
  }, [userProfile?.id]);

  return (
    <div className="flex flex-col px-4 pt-4 pb-12 gap-6">

      {/* ── Immersive Luxury Hero ── */}
      <motion.div {...fadeUp(0)} className="relative pt-8 pb-4">
        <div className="flex items-center gap-6">
          {/* Elite Avatar System */}
          <div className="relative shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/profile')}
              className="relative relative z-10 cursor-pointer"
            >
              {/* Outer Glow Ring */}
              <div className={cn(
                "absolute -inset-3 blur-[24px] rounded-full opacity-20 transition-all duration-1000",
                isConnected ? "bg-[#30D158]" : "bg-[#0A84FF]"
              )} />

              <div className="relative h-24 w-24 rounded-[36px] p-1 bg-gradient-to-tr from-white/20 to-white/5 border border-white/20 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center backdrop-blur-3xl">
                {userProfile?.photo_url ? (
                  <img src={userProfile.photo_url} alt="Profile" className="h-full w-full object-cover rounded-[30px]" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#0A84FF] to-[#BF5AF2] rounded-[30px]">
                    <UserCircle className="h-10 w-10 text-white/90" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Neural Status Indicator */}
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute -bottom-2 -right-2 z-20 h-9 w-9 rounded-full bg-[#0A0A0F] border-[3px] border-[#0A0A0F] flex items-center justify-center shadow-2xl"
            >
              <div className={cn("h-4 w-4 rounded-full", isConnected ? "bg-[#30D158] animate-pulse glow-green" : "bg-white/10")} />
            </motion.div>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-[32px] font-black text-white tracking-[-0.04em] leading-tight truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {displayName}
              </h1>
              <motion.span
                animate={{ rotate: [0, 15, 0, 15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                className="text-3xl shrink-0"
              >
                👋
              </motion.span>
            </div>

            {/* Status Topology */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/friends?filter=online')}
                className="ios-pill px-4 py-1.5 flex items-center gap-2 bg-white/5 border border-white/10 active:scale-95 transition-all hover:bg-white/10"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[#30D158] shadow-[0_0_8px_rgba(48,209,88,0.5)]" />
                <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
                  {onlineCount} Nodes Active
                </span>
              </button>
              {unreadTotal > 0 && (
                <button
                  onClick={() => navigate('/chat')}
                  className="ios-pill px-4 py-1.5 bg-[#FF375F]/10 border-[#FF375F]/20 flex items-center gap-2 active:scale-95 transition-all hover:bg-[#FF375F]/20"
                >
                  <Bell className="h-3 w-3 text-[#FF375F]" />
                  <span className="text-[10px] font-black text-[#FF375F] uppercase tracking-[0.2em]">
                    {unreadTotal} Priority
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Expandable connect panel ── */}
      <AnimatePresence>
        {showConnect && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="ios-card p-4">
              <PeerConnection
                peerId={context.peerId}
                connectToPeer={context.connectToPeer}
                isConnected={context.isConnected}
                myNickname={context.myNickname}
                remoteNickname={context.remoteNickname}
                sendData={context.sendData}
                startCall={context.startCall}
                isCallActive={context.isCallActive}
                connectionState={context.connectionState}
                onManualReconnect={context.onManualReconnect}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── High-Fidelity Interaction Matrix ── */}
      <motion.div {...fadeUp(0.08)}>
        <div className="flex items-center justify-between mb-5 px-2">
          <div className="flex items-center gap-3">
            <div className="h-5 w-1 rounded-full bg-[#0A84FF]" />
            <h2 className="text-[12px] font-black text-white uppercase tracking-[0.2em] opacity-40">Communicate</h2>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
            <div className="h-1.5 w-1.5 rounded-full bg-[#0A84FF] animate-pulse" />
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">System v2.5.0</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {QUICK_ACTIONS.map(({ icon: Icon, color, label, sub, to }, i) => (
            <motion.button
              key={label}
              whileHover={{ y: -8, scale: 1.02, backgroundColor: 'rgba(255,255,255,0.06)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(to)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12 + i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
              className="relative group h-[180px] rounded-[40px] overflow-hidden p-6 text-left flex flex-col justify-between border border-white/[0.05] shadow-[0_30px_60px_rgba(0,0,0,0.4)] backdrop-blur-3xl transition-all duration-500"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              {/* Luxury Ambient Noise & Orbs */}
              <div className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-40"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
              />

              <div
                className="absolute -top-12 -right-12 h-40 w-40 rounded-full blur-[50px] opacity-10 group-hover:opacity-30 transition-all duration-700"
                style={{ background: color }}
              />

              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl border border-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                style={{ background: `linear-gradient(135deg, ${color}33 0%, ${color}11 100%)` }}
              >
                <Icon className="h-7 w-7" style={{ color }} />
              </div>

              <div className="space-y-1 relative z-10">
                <p className="text-[20px] font-black text-white tracking-tight leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {label}
                </p>
                <p className="text-[11px] font-black text-white/20 uppercase tracking-widest leading-tight">
                  {sub}
                </p>
              </div>

              {/* Interaction Bloom */}
              <div
                className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0"
              >
                <ChevronRight className="h-4 w-4 text-white/40" />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Feature Highlights (Refined) ── */}
      <motion.div {...fadeUp(0.22)}>
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="h-4 w-1 rounded-full bg-white/20" />
          <h2 className="text-[14px] font-black text-white/40 uppercase tracking-[0.05em]">Everything Included</h2>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {FEATURES.map(({ icon: Icon, color, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 px-5 py-4 rounded-[24px] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
            >
              <div
                className="h-10 w-10 rounded-[18px] flex items-center justify-center shrink-0 shadow-lg"
                style={{ background: color + '15', border: `1px solid ${color}20` }}
              >
                <Icon className="h-5 w-5" style={{ color, opacity: 0.9 }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-white/80">{label}</p>
                <p className="text-[12px] text-white/40 leading-tight mt-0.5">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AppFooter />

    </div>
  );
};

export default AppPage;
