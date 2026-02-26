import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Share2, Play, Pause, MoreVertical, ThumbsDown } from 'lucide-react';
import { useShortsTelemetry } from '@/hooks/useShortsTelemetry';
import { useToast } from '@/hooks/use-toast';

declare global {
    interface Window {
        onYouTubeIframeAPIReady?: () => void;
        YT?: any;
    }
}

interface ShortsPlayerProps {
    videoId: string;
    isActive: boolean;
    author: string;
    description: string;
}

const ShortsPlayer = ({ videoId, isActive, author, description }: ShortsPlayerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const [{ isPlaying, isReady }, setPlayerState] = useState({ isPlaying: false, isReady: false });
    const [showPlayAnim, setShowPlayAnim] = useState(false);
    const [showPauseAnim, setShowPauseAnim] = useState(false);
    const [showLikeAnim, setShowLikeAnim] = useState(false);
    const [localLiked, setLocalLiked] = useState(false);
    const [localDisliked, setLocalDisliked] = useState(false);

    const lastTapRef = useRef<number>(0);
    const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const likeAnimPosRef = useRef({ x: 0, y: 0 });
    const { toast } = useToast();

    const { toggleLike } = useShortsTelemetry(isActive ? videoId : null);

    // Load YouTube IFrame API script
    useEffect(() => {
        if (window.YT && window.YT.Player) {
            if (!isReady) setPlayerState(prev => ({ ...prev, isReady: true }));
            return;
        }

        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
        }

        const prevFn = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            setPlayerState(prev => ({ ...prev, isReady: true }));
            if (prevFn) prevFn();
        };
    }, []);

    const onPlayerStateChange = (event: any) => {
        const state = event.data;
        if (state === 1) setPlayerState(prev => ({ ...prev, isPlaying: true }));
        else if (state === 2 || state === 0) setPlayerState(prev => ({ ...prev, isPlaying: false }));
    };

    // Initialize player when ready and active
    useEffect(() => {
        if (!isReady || !videoId || !containerRef.current) return;

        const wrapper = containerRef.current;
        wrapper.innerHTML = '';
        const targetDiv = document.createElement('div');
        targetDiv.className = "w-full h-full object-cover scale-[1.3] pointer-events-none"; // Scale heavily to hide edges and simulate portrait crop
        wrapper.appendChild(targetDiv);

        const player = new window.YT.Player(targetDiv, {
            videoId,
            playerVars: {
                'playsinline': 1,
                'autoplay': isActive ? 1 : 0,
                'controls': 0, // Hide controls
                'rel': 0,
                'disablekb': 1,
                'fs': 0,
                'iv_load_policy': 3,
                'modestbranding': 1,
            },
            events: {
                'onReady': (e: any) => {
                    if (isActive) {
                        // Must attempt to play (Browser might block auto-play without user interaction)
                        e.target.playVideo();
                    }
                },
                'onStateChange': onPlayerStateChange,
            },
        });
        playerRef.current = player;

        return () => {
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                playerRef.current.destroy();
            }
            playerRef.current = null;
        };
    }, [isReady, videoId]); // Note: DO NOT re-init purely on isActive change

    // Handle active state changes
    useEffect(() => {
        if (!playerRef.current) return;

        if (isActive) {
            playerRef.current.playVideo();
        } else {
            playerRef.current.pauseVideo();
            // Only seek to start if not playing, gives effect of starting over
            playerRef.current.seekTo(0);
        }
    }, [isActive]);

    const postYouTubeLike = async () => {
        const token = sessionStorage.getItem('yt_token');
        if (!token) return;

        try {
            const res = await fetch(`https://www.googleapis.com/youtube/v3/videos/rate?id=${videoId}&rating=like`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) console.warn('[ShortsPlayer] Failed to like on YouTube account');
        } catch (error) {
            console.error('[ShortsPlayer] YouTube API error:', error);
        }
    };

    const handleScreenClick = (e: React.MouseEvent) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
            // Double Tap detected
            if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
            lastTapRef.current = 0; // reset

            // Get click position for animation
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            likeAnimPosRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };

            handleDoubleTapLike();
        } else {
            // Single Tap started
            lastTapRef.current = now;
            tapTimeoutRef.current = setTimeout(() => {
                if (!playerRef.current) return;
                if (isPlaying) {
                    playerRef.current.pauseVideo();
                    setShowPauseAnim(true);
                    setTimeout(() => setShowPauseAnim(false), 500);
                } else {
                    playerRef.current.playVideo();
                    setShowPlayAnim(true);
                    setTimeout(() => setShowPlayAnim(false), 500);
                }
            }, DOUBLE_TAP_DELAY);
        }
    };

    const handleDoubleTapLike = () => {
        setShowLikeAnim(true);
        setTimeout(() => setShowLikeAnim(false), 800);

        if (!localLiked) {
            setLocalDisliked(false);
            setLocalLiked(true);
            toggleLike(); // telemetry
            postYouTubeLike(); // actual YouTube API
        }
    };

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation(); // Don't trigger play/pause
        setLocalDisliked(false);
        const isNowLiked = toggleLike(); // telemetry
        setLocalLiked(isNowLiked);
        if (isNowLiked) postYouTubeLike();
    };

    const handleDislike = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLocalLiked(false);
        setLocalDisliked(!localDisliked);
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Check out this Short by @${author}`,
                    text: description,
                    url: `https://youtube.com/shorts/${videoId}`,
                });
            } else {
                navigator.clipboard.writeText(`https://youtube.com/shorts/${videoId}`);
                toast({ title: 'Link copied to clipboard!' });
            }
        } catch (error) {
            console.log('Error sharing', error);
        }
    };

    const handleComment = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast({
            title: 'Comments',
            description: 'Comments feature is coming soon!',
        });
    };

    return (
        <div className="relative w-full h-full bg-[#0A0A0F] overflow-hidden select-none">
            {/* 
        This is the actual video. 
        Wrap it with pointer-events-none to prevent user from interacting with native YouTube element. 
        Our overlay will catch clicks.
      */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div ref={containerRef} className="w-full h-full" />
            </div>

            {/* Invisible Overlay to catch interactions */}
            <div
                className="absolute inset-0 z-10 flex cursor-pointer"
                onClick={handleScreenClick}
            >
                {/* Play/Pause center animations */}
                <AnimatePresence>
                    {showPlayAnim && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1.5 }}
                            exit={{ opacity: 0, scale: 2 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center p-2 text-white/90"
                        >
                            <Play className="h-10 w-10 ml-2" fill="currentColor" />
                        </motion.div>
                    )}
                    {showPauseAnim && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1.5 }}
                            exit={{ opacity: 0, scale: 2 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/90 pointer-events-none"
                        >
                            <Pause className="h-10 w-10" fill="currentColor" />
                        </motion.div>
                    )}
                    {showLikeAnim && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                            animate={{ opacity: 1, scale: 1.5, rotate: 0 }}
                            exit={{ opacity: 0, scale: 2, y: -50 }}
                            style={{
                                left: likeAnimPosRef.current.x,
                                top: likeAnimPosRef.current.y,
                                position: 'absolute',
                                transform: 'translate(-50%, -50%)'
                            }}
                            className="pointer-events-none"
                        >
                            <Heart className="h-24 w-24 text-[#FF375F] drop-shadow-2xl" fill="currentColor" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dynamic Gradient at bottom for text visibility */}
                <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                {/* Native Data Underlay (Left Side) */}
                <div className="absolute bottom-[calc(env(safe-area-inset-bottom,0px)+80px)] md:bottom-[90px] left-4 right-20 z-20 flex flex-col gap-2">
                    <h3 className="text-white font-bold text-[16px] drop-shadow-md pb-1 pointer-events-auto cursor-auto">
                        @{author}
                    </h3>
                    <p className="text-white/90 text-[14px] leading-snug drop-shadow-md line-clamp-2 md:line-clamp-3 pointer-events-auto cursor-auto">
                        {description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 pointer-events-auto">
                        <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[12px] font-medium text-white shadow-sm flex items-center gap-1.5 cursor-auto">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] shadow-[0_0_8px_rgba(48,209,88,0.5)] animate-pulse" />
                            For You
                        </div>
                    </div>
                </div>

                {/* Right Side Interactions Panel */}
                <div className="absolute bottom-[calc(env(safe-area-inset-bottom,0px)+80px)] md:bottom-[90px] right-4 z-20 flex flex-col items-center gap-6 pointer-events-auto">
                    {/* Like Button */}
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={handleLike}
                        className="flex flex-col items-center gap-1"
                    >
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-2xl transition-colors ${localLiked ? 'bg-[#FF375F] border-[#FF375F]/50' : 'bg-black/40 backdrop-blur-xl border border-white/20'}`}>
                            <Heart className="h-6 w-6" fill={localLiked ? 'white' : 'transparent'} color={localLiked ? 'white' : 'white'} />
                        </div>
                        <span className="text-[12px] font-bold text-white drop-shadow-md">
                            {localLiked ? 'Liked' : 'Like'}
                        </span>
                    </motion.button>

                    {/* Dislike Button */}
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={handleDislike}
                        className="flex flex-col items-center gap-1"
                    >
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-2xl transition-colors ${localDisliked ? 'bg-white/20 border-white/50' : 'bg-black/40 backdrop-blur-xl border border-white/20'}`}>
                            <ThumbsDown className="h-6 w-6" fill={localDisliked ? 'white' : 'transparent'} color="white" />
                        </div>
                        <span className="text-[12px] font-bold text-white drop-shadow-md">
                            Dislike
                        </span>
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleComment}
                        className="flex flex-col items-center gap-1"
                    >
                        <div className="h-12 w-12 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl">
                            <MessageCircle className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-[12px] font-bold text-white drop-shadow-md">1.2k</span>
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleShare}
                        className="flex flex-col items-center gap-1"
                    >
                        <div className="h-12 w-12 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl">
                            <Share2 className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-[12px] font-bold text-white drop-shadow-md">Share</span>
                    </motion.button>

                    <button className="h-8 w-8 rounded-full flex items-center justify-center mt-2 opacity-50">
                        <MoreVertical className="h-5 w-5 text-white drop-shadow-md" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShortsPlayer;
