import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

// ── Animated orb ─────────────────────────────────────────────
const Orb = ({ x, y, size, color, delay }: {
    x: string; y: string; size: number; color: string; delay: number;
}) => (
    <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ left: x, top: y, width: size, height: size, background: color, filter: 'blur(90px)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay }}
    />
);

// ── Glass card ────────────────────────────────────────────────
const GlassCard = ({
    children, onClick, className = '',
}: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <motion.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`w-full text-left rounded-3xl p-5 select-none cursor-pointer ${className}`}
        style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 32px rgba(0,0,0,0.3)',
        }}
    >
        {children}
    </motion.button>
);

// ── Auth Page ─────────────────────────────────────────────────
const AuthPage = () => {
    const { isAuthenticated, isLoading, loginWithGoogle, loginAsGuest } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && isAuthenticated) navigate('/app', { replace: true });
    }, [isAuthenticated, isLoading, navigate]);

    return (
        <div
            className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
            style={{ background: '#000' }}
        >
            {/* Ambient orbs */}
            <Orb x="-8%" y="2%" size={400} color="rgba(10,132,255,1)" delay={0} />
            <Orb x="55%" y="50%" size={360} color="rgba(191,90,242,1)" delay={2} />
            <Orb x="20%" y="70%" size={260} color="rgba(48,209,88,0.8)" delay={4} />

            {/* Vignette */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.8) 100%)' }}
            />

            <div className="relative z-10 w-full max-w-sm px-5 flex flex-col gap-8">

                {/* Logo + wordmark */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                    className="text-center space-y-2"
                >
                    <div
                        className="mx-auto mb-4 w-20 h-20 rounded-[28px] flex items-center justify-center text-4xl"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 32px rgba(10,132,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                        }}
                    >
                        🔗
                    </div>
                    <h1
                        className="text-4xl font-bold tracking-tight"
                        style={{
                            fontFamily: "'Outfit', sans-serif",
                            background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.03em',
                        }}
                    >
                        Togetherly
                    </h1>
                    <p className="text-[14px] text-white/35" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Watch together. Share the moment.
                    </p>
                </motion.div>

                {/* Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
                    className="flex flex-col gap-3"
                >
                    {/* Google sign-in */}
                    <GlassCard onClick={() => loginWithGoogle()}>
                        <div className="flex items-center gap-4">
                            {/* Google logo */}
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                                style={{ background: 'rgba(255,255,255,0.08)' }}
                            >
                                <svg viewBox="0 0 24 24" className="w-6 h-6">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-[16px] font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Continue with Google
                                </p>
                                <p className="text-[12px] text-white/40 mt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Permanent ID · Friends · Online status
                                </p>
                            </div>
                            <span className="text-white/25 text-lg">›</span>
                        </div>
                    </GlassCard>

                    {/* Guest */}
                    <GlassCard onClick={loginAsGuest}>
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
                                style={{ background: 'rgba(255,255,255,0.06)' }}
                            >
                                👤
                            </div>
                            <div className="flex-1">
                                <p className="text-[16px] font-semibold text-white/80" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Continue as Guest
                                </p>
                                <p className="text-[12px] text-white/35 mt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    No account needed · Session only
                                </p>
                            </div>
                            <span className="text-white/25 text-lg">›</span>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-[11px] text-white/20"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                    By continuing you agree to our Terms & Privacy Policy
                </motion.p>
            </div>
        </div>
    );
};

export default AuthPage;
