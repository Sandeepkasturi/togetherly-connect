import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Lock, FileText } from 'lucide-react';

// ── Content definitions ───────────────────────────────────────

const LEGAL_CONTENT = {
    privacy: {
        title: 'Privacy Policy',
        icon: Lock,
        iconColor: '#30D158',
        lastUpdated: 'February 2026',
        sections: [
            {
                heading: 'Overview',
                body: `Togetherly ("we", "our", or "us") is a product by SKAV TECH. We are committed to protecting your privacy. This policy explains what data we collect, why we collect it, and how it is used.`,
            },
            {
                heading: 'Information We Collect',
                body: `When you sign in with Google, we receive your name, email address, and profile photo from Google OAuth 2.0. This information is stored in our Supabase-backed database to enable your persistent profile, permanent Peer ID, and friend connections.\n\nGuest users do not share any personal information — only a temporary session nickname is stored locally on your device.`,
            },
            {
                heading: 'How We Use Your Data',
                body: `• To generate and persist your unique Peer ID so friends can reliably find you.\n• To display your name and photo in friend requests and connection dialogs.\n• To track online presence (last seen / is_online) for friend visibility.\n• We never sell, rent, or share your data with third parties for advertising purposes.`,
            },
            {
                heading: 'Peer-to-Peer Communication',
                body: `All video, audio, screen share, and chat data travels directly between your device and your peer using WebRTC (DTLS/SRTP encryption). This data never passes through our servers and is never stored or logged.`,
            },
            {
                heading: 'Cookies & Local Storage',
                body: `We use browser localStorage to store your Togetherly nickname and Google profile cache for seamless session restoration. We do not use third-party tracking cookies.`,
            },
            {
                heading: 'Data Deletion',
                body: `You can delete your account at any time from the Profile page. This permanently removes your profile, email, photo, peer ID, and all friend connections from our database. Cached data in your browser is also cleared automatically.`,
            },
            {
                heading: 'Contact Us',
                body: `For privacy-related questions, contact us at skavtech.in@gmail.com.`,
            },
        ],
    },
    terms: {
        title: 'Terms of Service',
        icon: FileText,
        iconColor: '#0A84FF',
        lastUpdated: 'February 2026',
        sections: [
            {
                heading: 'Acceptance of Terms',
                body: `By using Togetherly, you agree to these Terms of Service. If you do not agree, please do not use the application. These terms may be updated from time to time and your continued use constitutes acceptance.`,
            },
            {
                heading: 'Use of Service',
                body: `Togetherly is provided for personal, non-commercial use to enable real-time connection between consenting peers. You must be at least 13 years of age to use this service.`,
            },
            {
                heading: 'Acceptable Use',
                body: `You agree NOT to use Togetherly to:\n• Share illegal, harmful, or offensive content.\n• Harass, threaten, or impersonate other users.\n• Transmit malware, viruses, or harmful code.\n• Circumvent any security or access controls.\n• Use the service for any commercial purpose without written consent from SKAV TECH.`,
            },
            {
                heading: 'Account Responsibility',
                body: `You are responsible for maintaining the security of your Google account used to sign in to Togetherly. You are liable for all activities that occur under your account.`,
            },
            {
                heading: 'Intellectual Property',
                body: `All trademarks, logos, and service names are the property of SKAV TECH. The application's source code and design are proprietary. You may not copy, modify, or redistribute any part of Togetherly without express permission.`,
            },
            {
                heading: 'Disclaimer of Warranties',
                body: `Togetherly is provided "as is" without warranties of any kind, either expressed or implied. We do not warrant that the service will be uninterrupted, error-free, or free of harmful components.`,
            },
            {
                heading: 'Limitation of Liability',
                body: `To the maximum extent permitted by law, SKAV TECH shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.`,
            },
            {
                heading: 'Contact',
                body: `Questions about these terms? Contact us at skavtech.in@gmail.com.`,
            },
        ],
    },
    security: {
        title: 'Security',
        icon: ShieldCheck,
        iconColor: '#BF5AF2',
        lastUpdated: 'February 2026',
        sections: [
            {
                heading: 'End-to-End Encryption',
                body: `All real-time communication in Togetherly — including video calls, audio, screen sharing, chat messages, and file transfers — is protected by WebRTC's built-in DTLS (Datagram Transport Layer Security) and SRTP (Secure Real-time Transport Protocol). This means your data is encrypted before it leaves your device and can only be decrypted by the intended recipient.`,
            },
            {
                heading: 'Zero Server Storage of Media',
                body: `We operate a true peer-to-peer architecture. No video frames, audio streams, screen captures, or chat messages ever touch our servers. Your private conversations remain private — we have no ability to access or record them even if compelled.`,
            },
            {
                heading: 'STUN/TURN for NAT Traversal',
                body: `To establish connections across firewalls and NAT, we use PeerJS with standard STUN/TURN servers for signaling only. Signaling data (peer IDs and connection intent) is ephemeral and not stored beyond the lifespan of the connection.`,
            },
            {
                heading: 'Permanent Peer IDs',
                body: `Your Peer ID is a deterministic hash derived from your Google account's unique subject identifier (sub). It is not guessable or brute-forceable. Only users you have explicitly accepted as friends can initiate connections to your Peer ID.`,
            },
            {
                heading: 'Authentication',
                body: `Authentication is handled entirely through Google OAuth 2.0. We never store your Google password. Session tokens are short-lived and cached locally for performance.`,
            },
            {
                heading: 'Responsible Disclosure',
                body: `If you discover a security vulnerability in Togetherly, please report it responsibly to skavtech.in@gmail.com before public disclosure. We are committed to investigating and addressing all valid security reports promptly.`,
            },
            {
                heading: 'Data at Rest',
                body: `User profile data stored in Supabase (name, email, photo URL, peer ID) is protected by Supabase's row-level security policies, ensuring that users can only access their own data and the publicly visible profiles of other registered users.`,
            },
        ],
    },
};

type LegalKey = keyof typeof LEGAL_CONTENT;

// ── Modal Component ───────────────────────────────────────────

interface LegalModalProps {
    open: boolean;
    type: LegalKey | null;
    onClose: () => void;
}

const LegalModal = ({ open, type, onClose }: LegalModalProps) => {
    const content = type ? LEGAL_CONTENT[type] : null;

    return (
        <AnimatePresence>
            {open && content && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%', opacity: 0.5 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }}
                        className="fixed bottom-0 left-0 right-0 z-[201] flex flex-col"
                        style={{
                            maxHeight: '88vh',
                            background: 'linear-gradient(180deg, rgba(18,18,26,0.98) 0%, rgba(10,10,16,0.99) 100%)',
                            borderTop: '1px solid rgba(255,255,255,0.10)',
                            borderRadius: '28px 28px 0 0',
                            boxShadow: '0 -24px 80px rgba(0,0,0,0.7)',
                            paddingBottom: 'env(safe-area-inset-bottom, 24px)',
                        }}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1 shrink-0">
                            <div className="h-1 w-10 rounded-full bg-white/15" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-white/[0.06]">
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-9 w-9 rounded-xl flex items-center justify-center"
                                    style={{ background: content.iconColor + '18', border: `1px solid ${content.iconColor}30` }}
                                >
                                    <content.icon className="h-4.5 w-4.5" style={{ color: content.iconColor }} />
                                </div>
                                <div>
                                    <h2 className="text-[17px] font-bold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {content.title}
                                    </h2>
                                    <p className="text-[11px] text-white/30">Last updated: {content.lastUpdated}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                                style={{ background: 'rgba(255,255,255,0.06)' }}
                            >
                                <X className="h-4 w-4 text-white/60" />
                            </button>
                        </div>

                        {/* Scrollable content */}
                        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">
                            {content.sections.map((section) => (
                                <div key={section.heading} className="space-y-2">
                                    <h3
                                        className="text-[13px] font-bold uppercase tracking-widest"
                                        style={{ color: content.iconColor, fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        {section.heading}
                                    </h3>
                                    <p className="text-[14px] text-white/60 leading-relaxed whitespace-pre-line" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {section.body}
                                    </p>
                                </div>
                            ))}

                            <div className="h-6" />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export { LegalModal, type LegalKey };
export default LegalModal;
