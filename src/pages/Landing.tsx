import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Sparkles, Tv2, MessageCircle, MonitorUp, Zap, Shield, Users } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.32, 0.72, 0, 1] },
});

const FEATURES = [
  { icon: Tv2, color: '#0A84FF', label: 'Watch Together', desc: 'YouTube sync across devices in real-time.' },
  { icon: MessageCircle, color: '#BF5AF2', label: 'Live Chat', desc: 'iMessage-style chat with reactions & voice.' },
  { icon: MonitorUp, color: '#30D158', label: 'Screen Share', desc: 'Share your screen instantly, no installs.' },
  { icon: Shield, color: '#FF9F0A', label: 'P2P Encrypted', desc: 'Direct peer-to-peer, zero servers in the middle.' },
];

const Landing = () => {
  const { setNickname } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [shake, setShake] = useState(false);

  const launch = () => {
    if (!name.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast({ title: 'Enter your name first', variant: 'destructive' });
      return;
    }
    setNickname(name.trim());
    navigate('/app');
  };

  return (
    <div className="min-h-screen flex flex-col px-4 pt-4 pb-6 overflow-y-auto">

      {/* ── Hero ── */}
      <div className="flex-none text-center pt-6 pb-8 space-y-4">
        {/* Badge */}
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 ios-pill px-4 py-2 mx-auto">
          <Zap className="h-3.5 w-3.5 text-[#FFD60A]" />
          <span className="text-[12px] font-semibold text-white/80">100% Peer-to-Peer · No Servers</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 {...fadeUp(0.08)} className="text-[40px] sm:text-[52px] font-bold leading-[1.1] tracking-tight">
          <span className="text-white">Watch.</span>{' '}
          <span className="text-gradient-ios">Together.</span>
        </motion.h1>

        <motion.p {...fadeUp(0.14)} className="text-[16px] text-white/50 leading-relaxed max-w-xs mx-auto">
          Sync YouTube, chat live, and share your screen — with anyone, anywhere.
        </motion.p>
      </div>

      {/* ── Name Card ── */}
      <motion.div {...fadeUp(0.22)} className="flex-none max-w-sm mx-auto w-full">
        <AnimatePresence>
          <motion.div
            animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="ios-card-strong p-5 space-y-4"
          >
            <div className="space-y-1">
              <label className="text-[13px] font-semibold text-white/60 uppercase tracking-widest">Your Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && launch()}
                placeholder="e.g. Alex"
                maxLength={24}
                className="ios-input h-12 text-[17px] bg-white/5 border-white/10 focus-visible:ring-[#0A84FF]/40 placeholder:text-white/25"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={launch}
              className="w-full h-12 rounded-xl ios-btn-primary flex items-center justify-center gap-2 text-[17px] font-semibold shadow-lg shadow-[#0A84FF]/20"
            >
              <Sparkles className="h-5 w-5" />
              Get Started
            </motion.button>

            <p className="text-center text-[12px] text-white/30">Free forever · No account needed</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Feature Cards ── */}
      <motion.div {...fadeUp(0.3)} className="flex-none mt-8 max-w-sm mx-auto w-full space-y-3">
        <p className="text-[12px] font-semibold text-white/40 uppercase tracking-widest text-center mb-4">What's inside</p>
        {FEATURES.map(({ icon: Icon, color, label, desc }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.32 + i * 0.07, ease: [0.32, 0.72, 0, 1], duration: 0.4 }}
            className="ios-card flex items-center gap-4 px-4 py-4 hover-lift"
            style={{ '--card-glow': color + '20' } as React.CSSProperties}
          >
            <div
              className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: color + '20', border: `1px solid ${color}40` }}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-white">{label}</p>
              <p className="text-[13px] text-white/45 leading-snug">{desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Footer ── */}
      <motion.p {...fadeUp(0.6)} className="flex-none text-center text-[11px] text-white/20 mt-8">
        © {new Date().getFullYear()} Togetherly · Made with ♥
      </motion.p>

    </div>
  );
};

export default Landing;
