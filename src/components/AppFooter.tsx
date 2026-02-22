import { motion } from 'framer-motion';
import {
    ShieldCheck,
    ExternalLink,
    Linkedin,
    Cpu,
    Lock,
    Globe2,
    Mail,
    Building2
} from 'lucide-react';

const AppFooter = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full pt-8 pb-12 px-4 space-y-10 border-t border-white/[0.05] mt-8 bg-black/20">

            {/* ── Brand & Developer ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-[#0A84FF]" />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-bold text-white tracking-tight">Togetherly</h3>
                            <p className="text-[12px] text-white/40">Product by SKAV TECH</p>
                        </div>
                    </div>
                    <p className="text-[13px] text-white/30 leading-relaxed max-w-xs">
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

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                            <Linkedin className="h-5 w-5 text-[#0A84FF]" />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-bold text-white tracking-tight">Sandeep Kasturi</h3>
                            <p className="text-[12px] text-white/40">Lead Developer</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <a
                            href="https://linkedin.com/in/sandeepkasturi9"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[13px] font-medium text-white/60 hover:text-white transition-colors"
                        >
                            <Linkedin className="h-4 w-4" /> Connect on LinkedIn
                        </a>
                        <a
                            href="mailto:contact@skavtech.com"
                            className="inline-flex items-center gap-2 text-[13px] font-medium text-white/60 hover:text-white transition-colors"
                        >
                            <Mail className="h-4 w-4" /> contact@skavtech.com
                        </a>
                    </div>
                </div>
            </div>

            {/* ── Technical Stack ── */}
            <div className="ios-card p-5 space-y-4 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1">
                    <Cpu className="h-4 w-4 text-white/30" />
                    <h4 className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">Technology Stack</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                    {['React 18', 'Vite', 'Tailwind', 'Supabase', 'PeerJS', 'WebRTC', 'Framer Motion'].map((tech) => (
                        <span key={tech} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/50 font-medium">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Security & Privacy ── */}
            <div className="grid grid-cols-2 gap-4">
                <div className="ios-card p-4 space-y-2 bg-white/[0.01] border-white/[0.05]">
                    <Lock className="h-4 w-4 text-[#30D158]" />
                    <h4 className="text-[13px] font-bold text-white/80">Data Encryption</h4>
                    <p className="text-[11px] text-white/40 leading-relaxed">
                        End-to-end encrypted tunnels using WebRTC (DTLS/SRTP). No data passes through our servers.
                    </p>
                </div>
                <div className="ios-card p-4 space-y-2 bg-white/[0.01] border-white/[0.05]">
                    <ShieldCheck className="h-4 w-4 text-[#BF5AF2]" />
                    <h4 className="text-[13px] font-bold text-white/80">Privacy Shield</h4>
                    <p className="text-[11px] text-white/40 leading-relaxed">
                        Your viewing habits and messages are private to your session. No tracking or cookies.
                    </p>
                </div>
            </div>

            {/* ── Links & Copyright ── */}
            <div className="flex flex-col items-center gap-6 pt-6 border-t border-white/[0.03]">
                <div className="flex items-center gap-6 text-[12px] font-medium text-white/40">
                    <button className="hover:text-white transition-colors">Privacy Policy</button>
                    <button className="hover:text-white transition-colors">Terms of Service</button>
                    <button className="hover:text-white transition-colors">Security</button>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-[12px] text-white/20 font-medium tracking-wide">
                        <span>© {currentYear} SKAV TECH</span>
                        <span className="h-1 w-1 rounded-full bg-white/10" />
                        <span>MADE IN INDIA</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A84FF]/10 border border-[#0A84FF]/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#0A84FF] animate-pulse" />
                        <span className="text-[9px] font-black text-[#0A84FF] tracking-widest uppercase">Togetherly Live</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default AppFooter;
