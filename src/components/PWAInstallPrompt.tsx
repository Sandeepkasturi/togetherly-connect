import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus } from 'lucide-react';

// Detect if user is on iOS
const isIOS = () =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window as any).MSStream;

const isInStandaloneMode = () =>
    ('standalone' in window.navigator && (window.navigator as any).standalone) ||
    window.matchMedia('(display-mode: standalone)').matches;

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    prompt(): Promise<void>;
}

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [showIOSGuide, setShowIOSGuide] = useState(false);
    const [installing, setInstalling] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Don't show if already installed
        if (isInStandaloneMode()) return;
        // Don't show if user already dismissed this session
        if (sessionStorage.getItem('pwa-dismissed')) return;

        const isNewUser = localStorage.getItem('tg_new_registration') === 'true';
        const delay = isNewUser ? 500 : 3500;

        if (isNewUser) {
            localStorage.removeItem('tg_new_registration');
        }

        if (isIOS()) {
            // On iOS: show the guide after a delay (no native prompt available)
            const timer = setTimeout(() => setShowIOSGuide(true), delay);
            return () => clearTimeout(timer);
        }

        // Android / Chrome / Edge: listen for native install prompt
        const handler = (e: Event) => {
            e.preventDefault();
            (window as any).deferredPWAInstallPrompt = e;
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setTimeout(() => setShowPrompt(true), delay);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        setInstalling(true);
        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'dismissed') handleDismiss();
            else setShowPrompt(false);
        } finally {
            setInstalling(false);
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        sessionStorage.setItem('pwa-dismissed', '1');
        setShowPrompt(false);
        setShowIOSGuide(false);
        setDismissed(true);
    };

    if (dismissed) return null;

    return (
        <AnimatePresence>
            {/* ── Android/Desktop install banner ── */}
            {showPrompt && (
                <motion.div
                    initial={{ y: 120, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 120, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="fixed bottom-20 left-3 right-3 z-[300] rounded-2xl overflow-hidden shadow-2xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(10,132,255,0.15) 0%, rgba(191,90,242,0.12) 100%)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(10,132,255,0.30)',
                    }}
                >
                    <div className="flex items-center gap-4 px-4 py-4">
                        {/* App icon */}
                        <div className="h-14 w-14 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                            <img src="/icons/icon-192x192.png" alt="Togetherly" className="h-full w-full object-cover" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-bold text-white leading-tight">Install Togetherly</p>
                            <p className="text-[12px] text-white/50 leading-tight mt-0.5">
                                Add to home screen for the best experience
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handleDismiss}
                                className="h-8 w-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleInstall}
                                disabled={installing}
                                className="px-4 h-9 rounded-xl text-[13px] font-bold text-white flex items-center gap-1.5"
                                style={{ background: 'linear-gradient(135deg, #0A84FF, #7A38FF)' }}
                            >
                                <Download className="h-3.5 w-3.5" />
                                Install
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── iOS Share Guide ── */}
            {showIOSGuide && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={handleDismiss}
                        className="fixed inset-0 z-[298] bg-black/50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ y: '100%', opacity: 0.6 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        className="fixed bottom-0 left-0 right-0 z-[299] rounded-t-[28px] px-6 pt-5 pb-10 space-y-5"
                        style={{
                            background: 'rgba(16,16,22,0.98)',
                            border: '1px solid rgba(255,255,255,0.10)',
                        }}
                    >
                        <div className="flex justify-center">
                            <div className="h-1 w-10 rounded-full bg-white/15" />
                        </div>

                        <div className="flex items-center gap-4">
                            <img src="/icons/icon-192x192.png" alt="Togetherly" className="h-14 w-14 rounded-2xl" />
                            <div>
                                <h3 className="text-[18px] font-bold text-white">Install Togetherly</h3>
                                <p className="text-[13px] text-white/40">Add to your iPhone home screen</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    step: 1,
                                    icon: Share,
                                    color: '#0A84FF',
                                    text: 'Tap the Share button',
                                    sub: 'Bottom center of Safari',
                                },
                                {
                                    step: 2,
                                    icon: Plus,
                                    color: '#30D158',
                                    text: 'Tap "Add to Home Screen"',
                                    sub: 'Scroll down in the share sheet',
                                },
                                {
                                    step: 3,
                                    icon: Download,
                                    color: '#BF5AF2',
                                    text: 'Tap "Add" to confirm',
                                    sub: 'Togetherly appears on your home screen',
                                },
                            ].map(({ step, icon: Icon, color, text, sub }) => (
                                <div key={step} className="flex items-center gap-4">
                                    <div
                                        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ background: color + '18', border: `1px solid ${color}30` }}
                                    >
                                        <Icon className="h-5 w-5" style={{ color }} />
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-semibold text-white leading-tight">{text}</p>
                                        <p className="text-[12px] text-white/40">{sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleDismiss}
                            className="w-full h-12 rounded-2xl bg-white/10 text-white font-semibold text-[15px]"
                        >
                            Maybe Later
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PWAInstallPrompt;
