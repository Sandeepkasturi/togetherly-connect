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

const SplashScreen = ({ isVisible }: SplashScreenProps) => {
  const [shouldRender, setShouldRender] = React.useState(isVisible);

  React.useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      // Small delay to allow exit animation
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#000000' }}
        >
          {/* ── Ambient orbs ── */}
          <Orb x="-10%" y="5%" size={300} color="rgba(10,132,255,0.6)" delay={0} />
          <Orb x="55%" y="55%" size={280} color="rgba(191,90,242,0.6)" delay={2} />

          {/* ── Content ── */}
          <div className="relative z-10 flex flex-col items-center gap-8 select-none">
            {/* Logo ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <div
                className="w-24 h-24 rounded-[30px] flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                <Logo className="w-14 h-14" animate />
              </div>
            </motion.div>

            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-center space-y-1"
            >
              <h1
                className="text-[32px] font-bold tracking-tight"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: '#ffffff'
                }}
              >
                Togetherly
              </h1>
              <p
                className="text-[12px] font-medium tracking-widest uppercase opacity-40"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Connect · Watch · Share
              </p>
            </motion.div>

            {/* Loading bar */}
            <div className="flex flex-col items-center gap-3">
              <LoadingBar />
              <p className="text-[10px] tracking-widest uppercase opacity-30">
                Initialising…
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;

