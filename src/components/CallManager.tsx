import { useState, useRef } from 'react';
import VideoFeed from './VideoFeed';
import { Button } from './ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CallManagerProps {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isCallActive: boolean;
    endCall: () => void;
    toggleMedia: (type: 'audio' | 'video') => void;
    remoteNickname: string;
}

const CallManager = ({ localStream, remoteStream, isCallActive, endCall, toggleMedia, remoteNickname }: CallManagerProps) => {
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const hasVideo = !!localStream?.getVideoTracks().length;
    const constraintsRef = useRef(null);

    if (!isCallActive) return null;

    const handleToggleMic = () => {
        toggleMedia('audio');
        setIsMicMuted(prev => !prev);
    };

    const handleToggleVideo = () => {
        if (hasVideo) {
            toggleMedia('video');
            setIsVideoOff(prev => !prev);
        }
    };

    const videoIsActuallyOff = !hasVideo || isVideoOff;

    return (
        <AnimatePresence>
            {isCallActive && (
                <motion.div
                    drag
                    dragMomentum={false}
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 50 }}
                    className={`fixed z-[100] shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-[#0A0A0F] 
                        ${expanded ? 'bottom-0 left-0 w-full h-[calc(100dvh-80px)] rounded-none border-0' : 'bottom-24 right-4 w-[160px] h-[220px]'}`}
                    style={{ touchAction: "none" }}
                >
                    {/* Remote Video (Main) */}
                    <div className="absolute inset-0 bg-black">
                        <VideoFeed stream={remoteStream} />
                    </div>

                    {/* Gradient Overlay for Text */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

                    {/* Header bar */}
                    <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10">
                        <span className="text-[11px] font-semibold text-white bg-black/40 px-2 py-1 rounded-full backdrop-blur-md truncate max-w-[100px]">
                            {remoteNickname || "Caller"}
                        </span>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="h-6 w-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white"
                        >
                            {expanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                        </button>
                    </div>

                    {/* Local Video (PiP inside PiP) */}
                    {!videoIsActuallyOff && (
                        <div className={`absolute border border-white/20 bg-black shadow-lg rounded-xl overflow-hidden z-10
                            ${expanded ? 'bottom-20 right-4 w-[120px] h-[160px]' : 'top-10 right-2 w-[45px] h-[60px] rounded-lg'}`}>
                            <VideoFeed stream={localStream} isMuted isMe />
                        </div>
                    )}

                    {/* Controls */}
                    <div className={`absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20 ${expanded ? 'scale-125 bottom-8' : 'scale-90'}`}>
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={handleToggleMic}
                            className={`h-10 w-10 rounded-full border-0 ${isMicMuted ? 'bg-[#FF453A]/90 text-white' : 'bg-white/20 text-white backdrop-blur-md'}`}
                        >
                            {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>

                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-[#FF453A] hover:bg-[#FF453A]/90 shadow-lg shadow-[#FF453A]/20"
                            onClick={endCall}
                        >
                            <Phone className="h-4 w-4 rotate-[135deg]" />
                        </Button>

                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={handleToggleVideo}
                            disabled={!hasVideo}
                            className={`h-10 w-10 rounded-full border-0 disabled:opacity-50 ${videoIsActuallyOff ? 'bg-[#FF453A]/90 text-white' : 'bg-white/20 text-white backdrop-blur-md'}`}
                        >
                            {videoIsActuallyOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CallManager;
