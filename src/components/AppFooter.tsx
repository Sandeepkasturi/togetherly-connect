import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    ExternalLink,
    Linkedin,
    Cpu,
    Lock,
    Globe2,
    Mail,
    Building2,
    FileText,
} from 'lucide-react';
import LegalModal, { LegalKey } from './LegalModal';

const AppFooter = () => {
    const currentYear = new Date().getFullYear();
    const [legalOpen, setLegalOpen] = useState(false);
    const [legalType, setLegalType] = useState<LegalKey | null>(null);

    const openLegal = (type: LegalKey) => {
        setLegalType(type);
        setLegalOpen(true);
    };

    return (
        <>
            <LegalModal open={legalOpen} type={legalType} onClose={() => setLegalOpen(false)} />

            <footer
                className="w-full pt-16 pb-14 px-6 space-y-12 mt-12 relative overflow-hidden"
            >
                {/* Immersive Background Glow */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#0A84FF]/10 blur-[120px] rounded-[100%] pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* ── Brand & Developer Column ── */}
                    <div className="space-y-6">
                        {/* Brand Box */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.05] shadow-2xl backdrop-blur-3xl space-y-4 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-[16px] bg-gradient-to-br from-[#0A84FF]/20 to-[#0A84FF]/5 border border-[#0A84FF]/20 flex items-center justify-center shadow-inner">
                                    <Building2 className="h-6 w-6 text-[#0A84FF]" />
                                </div>
                                <div>
                                    <h3 className="text-[20px] font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Togetherly</h3>
                                    <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]" style={{ fontFamily: "'Outfit', sans-serif" }}>Product by SKAV TECH</p>
                                </div>
                            </div>
                            <p className="text-[14px] text-white/50 leading-relaxed font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Connecting people through shared media experiences. Real-time, peer-to-peer, and secure.
                            </p>
                            <a
                                href="https://skavtechs.vercel.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[12px] font-black text-[#0A84FF] uppercase tracking-widest hover:text-white transition-colors mt-2"
                            >
                                Visit SKAV TECH <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        </motion.div>

                        {/* Developer Box */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.05] shadow-2xl backdrop-blur-3xl space-y-4 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-[16px] bg-gradient-to-br from-[#BF5AF2]/20 to-[#BF5AF2]/5 border border-[#BF5AF2]/20 flex items-center justify-center shadow-inner">
                                    <Linkedin className="h-6 w-6 text-[#BF5AF2]" />
                                </div>
                                <div>
                                    <h3 className="text-[20px] font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Sandeep Kasturi</h3>
                                    <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]" style={{ fontFamily: "'Outfit', sans-serif" }}>Lead Developer</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 pt-2">
                                <a
                                    href="https://linkedin.com/in/sandeepkasturi9"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 text-[14px] font-medium text-white/60 hover:text-[#BF5AF2] transition-colors"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    <Linkedin className="h-4.5 w-4.5" /> Connect on LinkedIn
                                </a>
                                <a
                                    href="mailto:skavtech.in@gmail.com"
                                    className="inline-flex items-center gap-3 text-[14px] font-medium text-white/60 hover:text-[#BF5AF2] transition-colors"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    <Mail className="h-4.5 w-4.5" /> skavtech.in@gmail.com
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Tech Stack & Security Column ── */}
                    <div className="space-y-6">
                        {/* Tech Stack */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="rounded-[32px] p-6 bg-white/[0.02] border border-white/[0.05] shadow-2xl backdrop-blur-3xl space-y-5 transition-all h-fit"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Cpu className="h-4 w-4 text-white/50" />
                                </div>
                                <h4 className="text-[12px] font-black text-white/50 uppercase tracking-[0.2em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Technology Stack
                                </h4>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {['React 18', 'Vite', 'Tailwind', 'Supabase', 'PeerJS', 'WebRTC', 'Framer Motion', 'TypeScript'].map((tech) => (
                                    <span
                                        key={tech}
                                        className="px-4 py-2 rounded-full text-[12px] text-white/70 font-bold tracking-tight shadow-sm hover:bg-white/10 transition-colors cursor-default"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Security tiles */}
                        <div className="grid grid-cols-2 gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -4, backgroundColor: 'rgba(48,209,88,0.05)' }}
                                whileTap={{ scale: 0.95 }}
                                className="text-left rounded-[28px] p-5 space-y-3 border border-white/[0.05] bg-white/[0.02] shadow-xl backdrop-blur-2xl transition-all"
                                onClick={() => openLegal('security')}
                            >
                                <div className="h-10 w-10 rounded-[12px] border border-[#30D158]/20 bg-[#30D158]/10 flex items-center justify-center shadow-inner">
                                    <Lock className="h-5 w-5 text-[#30D158]" />
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Encryption</h4>
                                    <p className="text-[11px] font-medium text-white/40 leading-relaxed mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        End-to-end secured WebRTC.
                                    </p>
                                </div>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -4, backgroundColor: 'rgba(255,159,10,0.05)' }}
                                whileTap={{ scale: 0.95 }}
                                className="text-left rounded-[28px] p-5 space-y-3 border border-white/[0.05] bg-white/[0.02] shadow-xl backdrop-blur-2xl transition-all"
                                onClick={() => openLegal('privacy')}
                            >
                                <div className="h-10 w-10 rounded-[12px] border border-[#FF9F0A]/20 bg-[#FF9F0A]/10 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="h-5 w-5 text-[#FF9F0A]" />
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Privacy Shield</h4>
                                    <p className="text-[11px] font-medium text-white/40 leading-relaxed mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        No tracking, no ads.
                                    </p>
                                </div>
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* ── Legal links & copyright ── */}
                <div className="relative z-10 flex flex-col items-center gap-6 pt-10 mt-6">
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent absolute top-0 left-0" />

                    <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[13px] font-bold text-white/40 uppercase tracking-widest" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        <button
                            onClick={() => openLegal('privacy')}
                            className="hover:text-white transition-colors border-b-2 border-transparent hover:border-white/40 pb-1"
                        >
                            Privacy
                        </button>
                        <button
                            onClick={() => openLegal('terms')}
                            className="hover:text-white transition-colors border-b-2 border-transparent hover:border-white/40 pb-1"
                        >
                            Terms
                        </button>
                        <button
                            onClick={() => openLegal('security')}
                            className="hover:text-white transition-colors border-b-2 border-transparent hover:border-white/40 pb-1"
                        >
                            Security
                        </button>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div
                            className="flex items-center gap-3 text-[12px] text-white/30 font-black tracking-[0.2em] uppercase"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            <span>© {currentYear} SKAV TECH</span>
                            <span className="h-1.5 w-1.5 rounded-full bg-[#30D158] shadow-[0_0_8px_rgba(48,209,88,0.8)]" />
                            <span>MADE IN INDIA 🇮🇳</span>
                        </div>
                        <div
                            className="flex items-center gap-2.5 px-4 py-2 rounded-full shadow-lg"
                            style={{ background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.15)' }}
                        >
                            <div className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0A84FF] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0A84FF]"></span>
                            </div>
                            <span
                                className="text-[10px] font-black text-[#0A84FF] tracking-[0.25em] uppercase"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Togetherly Live Engine
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default AppFooter;
