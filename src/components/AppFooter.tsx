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
                className="w-full pt-10 pb-14 px-4 space-y-8 mt-8"
                style={{
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.25) 100%)',
                }}
            >
                {/* ── Brand & Developer ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-[#0A84FF]" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-bold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Togetherly</h3>
                                <p className="text-[12px] text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>Product by SKAV TECH</p>
                            </div>
                        </div>
                        <p className="text-[13px] text-white/30 leading-relaxed max-w-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Connecting people through shared media experiences. Real-time, peer-to-peer, and secure.
                        </p>
                        <a
                            href="https://skavtechs.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[13px] font-medium text-[#0A84FF] hover:opacity-70 transition-opacity"
                        >
                            Visit SKAV TECH <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>

                    {/* Developer */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Linkedin className="h-5 w-5 text-[#0A84FF]" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-bold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Sandeep Kasturi</h3>
                                <p className="text-[12px] text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>Lead Developer</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2.5">
                            <a
                                href="https://linkedin.com/in/sandeepkasturi9"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[13px] font-medium text-white/60 hover:text-white transition-colors"
                            >
                                <Linkedin className="h-4 w-4" /> Connect on LinkedIn
                            </a>
                            <a
                                href="mailto:skavtech.in@gmail.com"
                                className="inline-flex items-center gap-2 text-[13px] font-medium text-white/60 hover:text-white transition-colors"
                            >
                                <Mail className="h-4 w-4" /> skavtech.in@gmail.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── Tech Stack ── */}
                <div
                    className="rounded-2xl p-5 space-y-4"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-white/30" />
                        <h4 className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Technology Stack
                        </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['React 18', 'Vite', 'Tailwind', 'Supabase', 'PeerJS', 'WebRTC', 'Framer Motion', 'TypeScript'].map((tech) => (
                            <span
                                key={tech}
                                className="px-3 py-1 rounded-full text-[11px] text-white/50 font-medium"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'Outfit', sans-serif" }}
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── Security tiles ── */}
                <div className="grid grid-cols-2 gap-3">
                    <div
                        className="rounded-2xl p-4 space-y-2 cursor-pointer hover:border-[#30D158]/30 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}
                        onClick={() => openLegal('security')}
                    >
                        <Lock className="h-4 w-4 text-[#30D158]" />
                        <h4 className="text-[13px] font-bold text-white/80" style={{ fontFamily: "'Outfit', sans-serif" }}>Data Encryption</h4>
                        <p className="text-[11px] text-white/40 leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            End-to-end encrypted WebRTC (DTLS/SRTP). No data touches our servers.
                        </p>
                    </div>
                    <div
                        className="rounded-2xl p-4 space-y-2 cursor-pointer hover:border-[#BF5AF2]/30 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}
                        onClick={() => openLegal('privacy')}
                    >
                        <ShieldCheck className="h-4 w-4 text-[#BF5AF2]" />
                        <h4 className="text-[13px] font-bold text-white/80" style={{ fontFamily: "'Outfit', sans-serif" }}>Privacy Shield</h4>
                        <p className="text-[11px] text-white/40 leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Your data stays private. No tracking, no cookies, no ads.
                        </p>
                    </div>
                </div>

                {/* ── Legal links & copyright ── */}
                <div className="flex flex-col items-center gap-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-6 text-[12px] font-medium text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        <button
                            onClick={() => openLegal('privacy')}
                            className="hover:text-white transition-colors hover:underline underline-offset-2"
                        >
                            Privacy Policy
                        </button>
                        <button
                            onClick={() => openLegal('terms')}
                            className="hover:text-white transition-colors hover:underline underline-offset-2"
                        >
                            Terms of Service
                        </button>
                        <button
                            onClick={() => openLegal('security')}
                            className="hover:text-white transition-colors hover:underline underline-offset-2"
                        >
                            Security
                        </button>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div
                            className="flex items-center gap-2 text-[12px] text-white/20 font-medium tracking-wide"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            <span>© {currentYear} SKAV TECH</span>
                            <span className="h-1 w-1 rounded-full bg-white/10" />
                            <span>MADE IN INDIA 🇮🇳</span>
                        </div>
                        <div
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                            style={{ background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.2)' }}
                        >
                            <div className="h-1.5 w-1.5 rounded-full bg-[#0A84FF] animate-pulse" />
                            <span
                                className="text-[9px] font-black text-[#0A84FF] tracking-widest uppercase"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Togetherly Live
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default AppFooter;
