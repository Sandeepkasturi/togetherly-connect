import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Wifi, Music, User2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type IslandState = 'idle' | 'connected' | 'calling' | 'nowPlaying';

interface DynamicIslandProps {
    isConnected: boolean;
    remoteNickname?: string;
    isCallActive?: boolean;
    selectedVideoId?: string;
}

const spring = { type: 'spring' as const, stiffness: 400, damping: 30, mass: 0.8 };
const expandSpring = { type: 'spring' as const, stiffness: 300, damping: 28 };

export const DynamicIsland = ({
    isConnected,
    remoteNickname,
    isCallActive,
    selectedVideoId,
}: DynamicIslandProps) => {
    const [expanded, setExpanded] = useState(false);

    const state: IslandState =
        isCallActive ? 'calling' :
            selectedVideoId ? 'nowPlaying' :
                isConnected ? 'connected' : 'idle';

    const toggle = () => {
        if (state !== 'idle') setExpanded((v) => !v);
    };

    return (
        <div className="fixed top-3 left-0 right-0 z-[100] flex justify-center pointer-events-none">
            <motion.div
                layout
                transition={expandSpring}
                onClick={toggle}
                className={cn(
                    'dynamic-island relative overflow-hidden cursor-pointer pointer-events-auto',
                    state === 'idle' ? 'cursor-default' : 'cursor-pointer'
                )}
                style={{ borderRadius: 999 }}
                animate={{
                    width:
                        expanded && state !== 'idle' ? 260 :
                            state === 'connected' ? 160 :
                                state === 'calling' ? 180 :
                                    state === 'nowPlaying' ? 160 : 120,
                    height:
                        expanded && state !== 'idle' ? 80 :
                            state === 'idle' ? 34 : 36,
                }}
                initial={{ width: 120, height: 34 }}
            >
                {/* Inner content */}
                <AnimatePresence mode="wait">
                    {state === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={spring}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="flex gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                            </div>
                        </motion.div>
                    )}

                    {state === 'connected' && !expanded && (
                        <motion.div
                            key="connected-compact"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={spring}
                            className="absolute inset-0 flex items-center justify-center gap-2 px-4"
                        >
                            <span className="h-2 w-2 rounded-full bg-[--ios-green] shadow-[0_0_6px_2px_rgba(48,209,88,0.6)] shrink-0" />
                            <Wifi className="h-3 w-3 text-[#30D158] shrink-0" />
                            <span className="text-[11px] font-semibold text-white truncate">
                                {remoteNickname || 'Connected'}
                            </span>
                        </motion.div>
                    )}

                    {state === 'connected' && expanded && (
                        <motion.div
                            key="connected-expanded"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={spring}
                            className="absolute inset-0 flex items-center gap-3 px-4"
                        >
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                                <User2 className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[11px] text-white/50 font-medium">Connected with</span>
                                <span className="text-[14px] font-bold text-white truncate">{remoteNickname}</span>
                            </div>
                            <span className="ml-auto h-2.5 w-2.5 rounded-full bg-[#30D158] shadow-[0_0_6px_2px_rgba(48,209,88,0.6)] shrink-0" />
                        </motion.div>
                    )}

                    {state === 'calling' && !expanded && (
                        <motion.div
                            key="calling-compact"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={spring}
                            className="absolute inset-0 flex items-center justify-center gap-2 px-4"
                        >
                            <span className="h-2 w-2 rounded-full bg-[#30D158] animate-pulse shrink-0" />
                            <span className="text-[11px] font-semibold text-[#30D158]">Call Active</span>
                            <WaveformDots />
                        </motion.div>
                    )}

                    {state === 'calling' && expanded && (
                        <motion.div
                            key="calling-expanded"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={spring}
                            className="absolute inset-0 flex items-center justify-between px-4"
                        >
                            <div className="flex flex-col">
                                <span className="text-[11px] text-white/50">Call with</span>
                                <span className="text-[14px] font-bold text-white">{remoteNickname}</span>
                            </div>
                            <WaveformDots large />
                        </motion.div>
                    )}

                    {state === 'nowPlaying' && !expanded && (
                        <motion.div
                            key="np-compact"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={spring}
                            className="absolute inset-0 flex items-center justify-center gap-2 px-4"
                        >
                            <Music className="h-3 w-3 text-[#BF5AF2]" />
                            <span className="text-[11px] font-semibold text-white">Now Watching</span>
                            <WaveformDots />
                        </motion.div>
                    )}

                    {state === 'nowPlaying' && expanded && (
                        <motion.div
                            key="np-expanded"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={spring}
                            className="absolute inset-0 flex items-center gap-3 px-4"
                        >
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shrink-0">
                                <Music className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[11px] text-white/50">Watching Together</span>
                                <span className="text-[13px] font-bold text-white">YouTube Video</span>
                            </div>
                            <WaveformDots large className="ml-auto" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

/** Animated equalizer bars */
const WaveformDots = ({ large = false, className = '' }: { large?: boolean; className?: string }) => (
    <div className={cn('flex items-end gap-[2px]', className)}>
        {[3, 5, 4, 6, 3].map((h, i) => (
            <motion.span
                key={i}
                className={cn('rounded-full bg-[#BF5AF2]', large ? 'w-[3px]' : 'w-[2px]')}
                animate={{ height: [h, h + 4, h, h + 6, h] }}
                transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }}
                style={{ height: large ? h + 4 : h }}
            />
        ))}
    </div>
);

export default DynamicIsland;
