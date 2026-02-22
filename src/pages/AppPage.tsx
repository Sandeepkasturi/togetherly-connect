import { useOutletContext, useNavigate } from 'react-router-dom';
import { AppContextType } from '@/layouts/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv2, MessageCircle, MonitorUp, Zap, Users, ArrowRight, ChevronRight, Shield, Star } from 'lucide-react';
import PeerConnection from '@/components/PeerConnection';
import { useState } from 'react';

// ── Visual separator between the two sections ─────────────────────

// Quick actions: these are NAVIGATION buttons — large, prominent, tappable
const QUICK_ACTIONS = [
  { icon: Tv2, color: '#0A84FF', label: 'Watch', sub: 'Start a session', to: '/watch' },
  { icon: MessageCircle, color: '#BF5AF2', label: 'Chat', sub: 'Message your peer', to: '/chat' },
  { icon: MonitorUp, color: '#30D158', label: 'Share', sub: 'Share your screen', to: '/browser' },
];

// Feature highlights: purely INFORMATIONAL — different visual style
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
  const [showConnect, setShowConnect] = useState(false);

  return (
    <div className="min-h-full px-4 pt-2 pb-6 space-y-6 overflow-y-auto">

      {/* ── Greeting Header ── */}
      <motion.div {...fadeUp(0)} className="pt-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-white/40 font-medium">Good to see you,</p>
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">
              {context.myNickname} 👋
            </h1>
          </div>
          {/* Connection badge — tap to toggle connect panel */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setShowConnect((v) => !v)}
            className={`ios-pill px-3 py-1.5 flex items-center gap-1.5 tap-effect ${context.isConnected ? 'border-[#30D158]/30' : 'border-[#0A84FF]/30'
              }`}
          >
            <span className={`h-2 w-2 rounded-full ${context.isConnected ? 'status-dot-online' : 'bg-[#0A84FF] animate-pulse'}`} />
            <span className={`text-[12px] font-semibold ${context.isConnected ? 'text-[#30D158]' : 'text-[#0A84FF]'}`}>
              {context.isConnected ? context.remoteNickname : 'Connect'}
            </span>
            {!context.isConnected && <ChevronRight className="h-3 w-3 text-[#0A84FF]" />}
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

      {/* ══════════════════════════════════════════════════════════
          SECTION 1: QUICK ACTIONS — clearly interactive navigation
          Large full-width rows with arrow indicators
      ══════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0.08)}>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1 w-4 rounded-full bg-[#0A84FF]" />
          <h2 className="text-[13px] font-bold text-white/50 uppercase tracking-widest">Jump In</h2>
        </div>

        {/* Full-width list rows — very clearly tappable */}
        <div className="ios-card overflow-hidden divide-y divide-white/[0.06]">
          {QUICK_ACTIONS.map(({ icon: Icon, color, label, sub, to }, i) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.98, backgroundColor: 'rgba(255,255,255,0.04)' }}
              onClick={() => navigate(to)}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.10 + i * 0.06, ease: [0.32, 0.72, 0, 1], duration: 0.35 }}
              className="flex items-center w-full gap-4 px-4 py-4 text-left hover:bg-white/[0.03] transition-colors"
            >
              {/* Icon badge */}
              <div
                className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: color + '1A', border: `1.5px solid ${color}35` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-semibold text-white">{label}</p>
                <p className="text-[12px] text-white/40">{sub}</p>
              </div>

              {/* Arrow — strong navigation affordance */}
              <ChevronRight className="h-4 w-4 text-white/25 shrink-0" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2: FEATURE HIGHLIGHTS — informational only
          Completely different visual: horizontal badge pills,
          NO arrow, NO tap ripple, greyed-out label "About"
      ══════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0.22)}>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1 w-4 rounded-full bg-white/20" />
          <h2 className="text-[13px] font-bold text-white/30 uppercase tracking-widest">About Togetherly</h2>
        </div>

        {/* Badge-pill list — clearly NOT tappable (no arrow, no bg change) */}
        <div className="space-y-2">
          {FEATURES.map(({ icon: Icon, color, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Tiny dot badge */}
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

      {/* ── Full-width CTA ── */}
      <motion.div {...fadeUp(0.35)}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/watch')}
          className="w-full h-14 rounded-2xl animated-gradient flex items-center justify-center gap-3 font-bold text-[17px] shadow-lg shadow-[#0A84FF]/20"
        >
          <Tv2 className="h-5 w-5" />
          Start Watching Together
          <ArrowRight className="h-4 w-4 ml-auto opacity-70" />
        </motion.button>
      </motion.div>

    </div>
  );
};

export default AppPage;
