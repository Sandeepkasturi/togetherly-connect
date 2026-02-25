import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { CallRecord } from '@/hooks/useCallSignaling';
import { DBUser } from '@/lib/supabase';

interface IncomingCallModalProps {
    call: CallRecord | null;
    caller: DBUser | null;
    onAccept: () => void;
    onDecline: () => void;
}

const IncomingCallModal = ({ call, caller, onAccept, onDecline }: IncomingCallModalProps) => (
    <AnimatePresence>
        {call && (
            <>
                {/* Ringtone */}
                <audio autoPlay loop src="/ringtone.mp3" className="hidden" />

                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-sm"
                />

                {/* Card */}
                <motion.div
                    initial={{ y: -60, opacity: 0, scale: 0.92 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -60, opacity: 0, scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="fixed top-4 left-4 right-4 z-[401] rounded-[28px] overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(30,30,46,0.98) 0%, rgba(10,10,22,0.98) 100%)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                    }}
                >
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 rounded-[28px] animate-pulse"
                        style={{
                            background: call.type === 'video'
                                ? 'radial-gradient(circle at 50% 0%, rgba(10,132,255,0.15) 0%, transparent 70%)'
                                : 'radial-gradient(circle at 50% 0%, rgba(48,209,88,0.12) 0%, transparent 70%)'
                        }}
                    />

                    <div className="relative px-6 py-6 flex flex-col items-center gap-5">
                        {/* Icon badge */}
                        <div className="absolute top-5 right-5 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{ background: call.type === 'video' ? 'rgba(10,132,255,0.18)' : 'rgba(48,209,88,0.15)' }}>
                            {call.type === 'video'
                                ? <Video className="h-3.5 w-3.5 text-[#0A84FF]" />
                                : <Phone className="h-3.5 w-3.5 text-[#30D158]" />}
                            <span className="text-[11px] font-semibold"
                                style={{ color: call.type === 'video' ? '#0A84FF' : '#30D158' }}>
                                {call.type === 'video' ? 'Video Call' : 'Audio Call'}
                            </span>
                        </div>

                        {/* Caller avatar */}
                        <div className="relative">
                            <motion.div
                                animate={{ boxShadow: ['0 0 0 0 rgba(48,209,88,0.4)', '0 0 0 16px rgba(48,209,88,0)'] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="h-20 w-20 rounded-full overflow-hidden bg-white/10"
                            >
                                <img
                                    src={caller?.photo_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${call.caller_id}`}
                                    alt={caller?.display_name}
                                    className="h-full w-full object-cover"
                                />
                            </motion.div>
                        </div>

                        <div className="text-center">
                            <p className="text-[20px] font-bold text-white">{caller?.display_name ?? 'Someone'}</p>
                            <p className="text-[13px] text-white/50 mt-0.5">Incoming {call.type} call…</p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-6 mt-1">
                            <div className="flex flex-col items-center gap-2">
                                <motion.button
                                    whileTap={{ scale: 0.88 }}
                                    onClick={onDecline}
                                    className="h-16 w-16 rounded-full bg-[#FF3B30] flex items-center justify-center shadow-lg"
                                >
                                    <PhoneOff className="h-7 w-7 text-white" />
                                </motion.button>
                                <span className="text-[12px] text-white/50">Decline</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <motion.button
                                    whileTap={{ scale: 0.88 }}
                                    onClick={onAccept}
                                    className="h-16 w-16 rounded-full bg-[#30D158] flex items-center justify-center shadow-lg"
                                >
                                    <Phone className="h-7 w-7 text-white" />
                                </motion.button>
                                <span className="text-[12px] text-white/50">Accept</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);

export default IncomingCallModal;
