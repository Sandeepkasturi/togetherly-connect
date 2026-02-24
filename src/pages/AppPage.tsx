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
  Power
} from 'lucide-react';
import PeerConnection from '@/components/PeerConnection';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppFooter from '@/components/AppFooter';
import { cn } from '@/lib/utils';

const QUICK_ACTIONS = [
  { icon: Tv2, color: '#0A84FF', label: 'Watch', sub: 'Start a session', to: '/watch' },
  { icon: MessageCircle, color: '#BF5AF2', label: 'Chat', sub: 'Message your peer', to: '/chat' },
  { icon: MonitorUp, color: '#30D158', label: 'Share', sub: 'Share your screen', to: '/browser' },
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
  const { userProfile } = useAuth();
  const [showConnect, setShowConnect] = useState(false);

  const { isConnected, disconnectPeer, remoteNickname, myNickname } = context;
  const displayName = userProfile?.display_name || myNickname;

  return (
    <div className="min-h-full px-4 pt-2 pb-[110px] space-y-6 overflow-y-auto">

      {/* ── Polished iOS Header ── */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between pt-2 gap-3">
        <div className="space-y-0.5 min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-white/40 tracking-tight">
            Good to see you,
          </p>
          <div className="flex items-center gap-2">
            <h1
              className="font-black text-white tracking-[-0.03em] leading-tight"
              style={{ fontSize: 'clamp(20px, 6.5vw, 32px)', wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            >
              {displayName}
            </h1>
            <motion.span
              animate={{ rotate: [0, 20, 0, 20, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              className="text-2xl shrink-0"
            >
              👋
            </motion.span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Connection Status Pill */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => isConnected ? disconnectPeer() : setShowConnect(!showConnect)}
            className={cn(
              "h-[38px] px-5 rounded-full flex items-center gap-2.5 transition-all duration-300",
              "border border-white/10 shadow-lg backdrop-blur-md",
              isConnected
                ? "bg-[#30D158]/10 text-[#30D158] border-[#30D158]/20"
                : "bg-white/5 text-[#0A84FF] border-[#0A84FF]/20"
            )}
          >
            <div className={cn(
              "h-2 w-2 rounded-full",
              isConnected ? "bg-[#30D158] animate-pulse" : "bg-[#0A84FF]"
            )} />
            <span className="text-[14px] font-bold tracking-tight max-w-[80px] truncate">
              {isConnected ? remoteNickname : 'Connect'}
            </span>
            {isConnected ? (
              <div
                onClick={(e) => { e.stopPropagation(); disconnectPeer(); }}
                className="ml-1 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <Power className="h-3 w-3" />
              </div>
            ) : (
              <ArrowRight className="h-3.5 w-3.5 opacity-50" />
            )}
          </motion.button>

          {/* User Profile Avatar */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile')}
            className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 overflow-hidden shadow-xl"
          >
            {userProfile?.photo_url ? (
              <img src={userProfile.photo_url} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#0A84FF] to-[#BF5AF2]">
                <UserCircle className="h-6 w-6 text-white" />
              </div>
            )}
          </motion.button>
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

      {/* ── Quick Actions ── */}
      <motion.div {...fadeUp(0.08)}>
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="h-1 w-4 rounded-full bg-[#0A84FF]" />
          <h2 className="text-[13px] font-bold text-white/50 uppercase tracking-widest">Jump In</h2>
        </div>

        <div className="ios-card overflow-hidden divide-y divide-white/[0.06]">
          {QUICK_ACTIONS.map(({ icon: Icon, color, label, sub, to }, i) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.98, backgroundColor: 'rgba(255,255,255,0.04)' }}
              onClick={() => navigate(to)}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.10 + i * 0.06, ease: [0.32, 0.72, 0, 1], duration: 0.35 }}
              className="flex items-center w-full gap-4 px-4 py-4 text-left hover:bg-white/[0.03] transition-colors group"
            >
              <div
                className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: color + '1A', border: `1.5px solid ${color}35` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-semibold text-white">{label}</p>
                <p className="text-[12px] text-white/40">{sub}</p>
              </div>

              <ChevronRight className="h-4 w-4 text-white/25 shrink-0" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Feature Highlights ── */}
      <motion.div {...fadeUp(0.22)}>
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="h-1 w-4 rounded-full bg-white/20" />
          <h2 className="text-[13px] font-bold text-white/30 uppercase tracking-widest">About Togetherly</h2>
        </div>

        <div className="space-y-2">
          {FEATURES.map(({ icon: Icon, color, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="h-7 w-7 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: color + '15' }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color, opacity: 0.8 }} />
              </div>
              <div className="min-w-0">
                <span className="text-[13px] font-semibold text-white/60">{label}</span>
                <span className="text-[12px] text-white/30 ml-2">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <AppFooter />

    </div>
  );
};

export default AppPage;
