import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight } from 'lucide-react';
import Logo from '@/components/Logo';

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

// ── Luxury Glass Card ──────────────────────────────────────────
const GlassCard = ({
    children, onClick, className = '',
}: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <motion.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.98, y: 1 }}
        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`w-full text-left rounded-[32px] p-6 select-none cursor-pointer transition-all duration-300 ${className}`}
        style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            boxShadow: `
                inset 0 1px 1px rgba(255,255,255,0.1),
                0 10px 40px rgba(0,0,0,0.4),
                0 0 0 1px rgba(255,255,255,0.02)
            `,
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
            className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0F]"
        >
            {/* Immersive Background Layer */}
            <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* Ambient Energy Orbs */}
            <Orb x="-10%" y="-10%" size={600} color="radial-gradient(circle, rgba(10,132,255,0.3) 0%, transparent 70%)" delay={0} />
            <Orb x="60%" y="40%" size={500} color="radial-gradient(circle, rgba(191,90,242,0.2) 0%, transparent 70%)" delay={2} />
            <Orb x="10%" y="60%" size={450} color="radial-gradient(circle, rgba(48,209,88,0.15) 0%, transparent 70%)" delay={4} />

            {/* Dynamic Vignette */}
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    background: 'radial-gradient(circle at center, transparent 0%, rgba(10,10,15,0.4) 40%, #0A0A0F 100%)'
                }}
            />

            <div className="relative z-10 w-full max-w-sm px-6 flex flex-col gap-10">

                {/* ── Brand Evolution Section ── */}
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center space-y-4"
                >
                    <div className="relative mx-auto w-24 h-24 mb-6">
                        {/* Recursive Glow */}
                        <div className="absolute -inset-4 bg-[#0A84FF]/20 blur-[32px] rounded-full animate-pulse" />

                        <div
                            className="relative w-full h-full rounded-[32px] flex items-center justify-center overflow-hidden backdrop-blur-3xl shadow-2xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 12px 40px rgba(0,0,0,0.4)',
                            }}
                        >
                            <Logo className="h-12 w-12" animate />
                        </div>
                    </div>

                    <h1
                        className="text-[44px] font-black tracking-[-0.04em] leading-tight"
                        style={{
                            fontFamily: "'Outfit', sans-serif",
                            background: 'linear-gradient(to bottom, #FFFFFF 0%, rgba(255,255,255,0.6) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Togetherly
                    </h1>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse glow-green" />
                        <p className="text-[12px] font-black text-white/40 uppercase tracking-[0.2em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Watch the world together
                        </p>
                    </div>
                </motion.div>

                {/* ── Action Matrix ── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-4"
                >
                    {/* Google Protocol */}
                    <GlassCard onClick={() => loginWithGoogle()} className="group">
                        <div className="flex items-center gap-5">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform duration-500 group-hover:scale-110"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                <svg viewBox="0 0 24 24" className="w-7 h-7">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-[18px] font-black text-white tracking-tight leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Google
                                </p>
                                <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.15em] mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Account Login
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <ChevronRight className="h-5 w-5 text-white/40" />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Guest Protocol */}
                    <GlassCard onClick={loginAsGuest} className="group py-5 px-6">
                        <div className="flex items-center gap-5">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-3xl shadow-2xl transition-transform duration-500 group-hover:scale-110"
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}
                            >
                                <span className="opacity-40 group-hover:opacity-100 transition-opacity">👤</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-[17px] font-bold text-white/60 tracking-tight leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Guest
                                </p>
                                <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.15em] mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Incognito Mode
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <ChevronRight className="h-5 w-5 text-white/20" />
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* ── System Transparency Footer ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center space-y-4"
                >
                    <p className="text-[11px] font-black text-white/10 uppercase tracking-[0.3em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Encrypted Connection • Version 2.0.4
                    </p>
                    <p className="text-[10px] text-white/30 font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        By engaging, you synchronize with our <span className="text-white/50 underline underline-offset-4 cursor-pointer hover:text-white transition-colors">Terms of Togetherly</span> & <span className="text-white/50 underline underline-offset-4 cursor-pointer hover:text-white transition-colors">Privacy Protocol</span>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPage;
