import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LEGAL_CONTENT, LegalKey } from '@/components/LegalModal';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

const LegalPage = ({ defaultType }: { defaultType?: LegalKey }) => {
    const { type: paramType } = useParams<{ type: string }>();
    const navigate = useNavigate();

    // Use param or default to privacy
    const type = (paramType as LegalKey) || defaultType || 'privacy';
    const content = LEGAL_CONTENT[type];

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [type]);

    if (!content) {
        return (
            <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center text-white">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold">Document Not Found</h2>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col relative overflow-hidden">
            {/* Immersive Background Layer */}
            <div className="fixed inset-0 opacity-40 mix-blend-overlay pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />
            {/* Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] blur-[120px] rounded-[100%] pointer-events-none opacity-[0.15]"
                style={{ background: content.iconColor }}
            />

            {/* Header */}
            <div className="relative z-10 p-6 flex flex-col items-center justify-center border-b border-white/[0.05] bg-[#0A0A0F]/60 backdrop-blur-xl sticky top-0">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute left-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
                >
                    <ArrowLeft className="h-5 w-5 opacity-70" />
                </button>
                <div className="flex items-center gap-4">
                    <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ background: content.iconColor + '15', border: `1px solid ${content.iconColor}30` }}
                    >
                        <content.icon className="h-5 w-5" style={{ color: content.iconColor }} />
                    </div>
                    <div>
                        <h1 className="text-[20px] md:text-[24px] font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {content.title}
                        </h1>
                        <p className="text-[11px] md:text-[12px] opacity-40 uppercase tracking-wider">
                            Last updated: {content.lastUpdated}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="relative z-10 max-w-3xl w-full mx-auto p-6 md:p-12 space-y-10 pb-24">
                {content.sections.map((section, idx) => (
                    <motion.section
                        key={section.heading}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                        className="space-y-3"
                    >
                        <h2
                            className="text-[14px] md:text-[15px] font-bold uppercase tracking-widest flex items-center gap-3"
                            style={{ color: content.iconColor, fontFamily: "'Outfit', sans-serif" }}
                        >
                            <span className="h-[2px] w-6 bg-current opacity-50 block rounded-full" />
                            {section.heading}
                        </h2>
                        <p className="text-[15px] md:text-[16px] text-white/70 leading-relaxed whitespace-pre-line pl-9" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {section.body}
                        </p>
                    </motion.section>
                ))}
            </div>
        </div>
    );
};

export default LegalPage;
