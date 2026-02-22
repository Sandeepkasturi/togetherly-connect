import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

interface SplashScreenProps {
  isVisible: boolean;
}

// ── Floating orb ─────────────────────────────────────────────
const Orb = ({
  x, y, size, color, delay,
}: { x: string; y: string; size: number; color: string; delay: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: x, top: y,
      width: size, height: size,
      background: color,
      filter: 'blur(80px)',
    }}
    animate={{
      scale: [1, 1.18, 1],
      opacity: [0.18, 0.35, 0.18],
    }}
    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

// ── Loading bar ───────────────────────────────────────────────
const LoadingBar = () => (
  <div className="relative w-40 h-[2px] rounded-full overflow-hidden bg-white/8">
    <motion.div
      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#0A84FF] to-[#BF5AF2]"
      initial={{ x: '-100%' }}
      animate={{ x: '100%' }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: '60%' }}
    />
  </div>
);

// ── Main splash ───────────────────────────────────────────────
const SplashScreen = ({ isVisible }: SplashScreenProps) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.04 }}
        transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: '#000000' }}
      >
        {/* ── Ambient orbs ── */}
        <Orb x="-10%" y="5%" size={420} color="rgba(10,132,255,1)" delay={0} />
        <Orb x="55%" y="55%" size={380} color="rgba(191,90,242,1)" delay={2} />
        <Orb x="20%" y="65%" size={280} color="rgba(48,209,88,0.7)" delay={4} />

        {/* ── Vignette ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%)' }}
        />

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col items-center gap-8 select-none">

          {/* Logo ring */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative"
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-[-14px] rounded-full"
              style={{ border: '1px solid rgba(10,132,255,0.25)', boxShadow: '0 0 40px rgba(10,132,255,0.15)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            />
            {/* Inner glass card */}
            <div
              className="w-28 h-28 rounded-[36px] flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 40px rgba(10,132,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <Logo className="w-16 h-16" animate />
            </div>
          </motion.div>

          {/* Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="text-center space-y-2"
          >
            <h1
              className="text-[36px] font-bold tracking-[-0.04em] leading-none"
              style={{
                fontFamily: "'Outfit', sans-serif",
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.55) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Togetherly
            </h1>
            <p
              className="text-[14px] font-medium tracking-[0.08em] uppercase"
              style={{ color: 'rgba(255,255,255,0.28)', fontFamily: "'Outfit', sans-serif" }}
            >
              Connect · Watch · Share
            </p>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            className="flex flex-col items-center gap-3"
          >
            <LoadingBar />
            <motion.p
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[12px] tracking-wider"
              style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Outfit', sans-serif" }}
            >
              Initialising…
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default SplashScreen;

