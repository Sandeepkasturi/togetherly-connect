import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, Plus, Settings, ChevronLeft, Volume2, VolumeX, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface YouTubeVideo {
    id: { videoId: string };
    snippet: {
        title: string;
        channelTitle: string;
        channelId: string;
        thumbnails: {
            high: { url: string };
        };
    };
}

const SharePage = () => {
    const { userProfile, permanentPeerId } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeVideoIndex, setActiveVideoIndex] = useState(0);

    // Settings
    const [autoScroll, setAutoScroll] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Interaction State
    const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
    const [subscribedChannels, setSubscribedChannels] = useState<Set<string>>(new Set());
    const [viewedVideos, setViewedVideos] = useState<Set<string>>(new Set());

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);

    const [heartAnim, setHeartAnim] = useState<{ id: string, x: number, y: number } | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const touchStartY = useRef<number | null>(null);

    const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

    // ── Fetch YouTube Shorts ──
    const fetchShorts = useCallback(async (refresh = false) => {
        try {
            if (!refresh) setIsLoading(true);
            else setIsRefreshing(true);
            // Using #shorts and videoDuration=short to get shorts
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=%23shorts&type=video&videoDuration=short&key=${API_KEY}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.items) {
                // Shuffle items to feel like new content on refresh
                const shuffled = data.items.sort(() => 0.5 - Math.random());
                setVideos(shuffled);
                setActiveVideoIndex(0);
                if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
            } else {
                toast({ title: "Error", description: "Failed to load shorts." });
            }
        } catch (e) {
            console.error("YouTube API Error:", e);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [API_KEY, toast]);

    useEffect(() => {
        fetchShorts();
    }, [fetchShorts]);

    // ── Scroll Tracking ──
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, clientHeight } = container;
            const index = Math.round(scrollTop / clientHeight);
            if (index !== activeVideoIndex) {
                setActiveVideoIndex(index);
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [activeVideoIndex]);

    // ── Auto Scroll Logic ──
    useEffect(() => {
        if (autoScroll && videos.length > 0) {
            // Shorts are usually under 60 seconds. Let's scroll after 30 seconds for demo purposes.
            const timer = setTimeout(() => {
                if (activeVideoIndex < videos.length - 1) {
                    const container = scrollContainerRef.current;
                    if (container) {
                        container.scrollTo({
                            top: (activeVideoIndex + 1) * container.clientHeight,
                            behavior: 'smooth'
                        });
                    }
                }
            }, 30000); // 30 seconds
            return () => clearTimeout(timer);
        }
    }, [autoScroll, activeVideoIndex, videos.length]);

    // ── Record View ──
    useEffect(() => {
        const recordView = async () => {
            if (!userProfile || videos.length === 0) return;
            const video = videos[activeVideoIndex];
            if (!video) return;

            if (!viewedVideos.has(video.id.videoId)) {
                setViewedVideos(prev => new Set([...prev, video.id.videoId]));

                try {
                    await supabase.from('youtube_interactions').insert({
                        user_id: userProfile.id,
                        interaction_type: 'view',
                        channel_id: video.snippet.channelId,
                        channel_title: video.snippet.channelTitle,
                        video_id: video.id.videoId,
                        video_data: JSON.stringify({
                            title: video.snippet.title,
                            thumbnail: video.snippet.thumbnails.high.url
                        })
                    });
                } catch (e) {
                    console.error("View insert error:", e);
                    // Fails silently if table doesn't exist yet
                }
            }
        };

        recordView();
    }, [activeVideoIndex, videos, userProfile, viewedVideos]);

    // ── Load Initial Interactions ──
    useEffect(() => {
        const loadInteractions = async () => {
            if (!userProfile) return;
            try {
                const { data } = await supabase
                    .from('youtube_interactions')
                    .select('interaction_type, video_id, channel_id')
                    .eq('user_id', userProfile.id);

                if (data) {
                    const likes = new Set<string>();
                    const subs = new Set<string>();
                    data.forEach(item => {
                        if (item.interaction_type === 'like' && item.video_id) likes.add(item.video_id);
                        if (item.interaction_type === 'subscribe' && item.channel_id) subs.add(item.channel_id);
                    });
                    setLikedVideos(likes);
                    setSubscribedChannels(subs);
                }
            } catch (e) {
                console.error("Load interactions error:", e);
            }
        };
        loadInteractions();
    }, [userProfile]);

    // ── Actions ──
    const toggleLike = async (video: YouTubeVideo) => {
        if (!userProfile) return;
        const isLiked = likedVideos.has(video.id.videoId);

        setLikedVideos(prev => {
            const next = new Set(prev);
            if (isLiked) next.delete(video.id.videoId);
            else next.add(video.id.videoId);
            return next;
        });

        try {
            if (isLiked) {
                await supabase
                    .from('youtube_interactions')
                    .delete()
                    .match({ user_id: userProfile.id, interaction_type: 'like', video_id: video.id.videoId });
            } else {
                await supabase.from('youtube_interactions').insert({
                    user_id: userProfile.id,
                    interaction_type: 'like',
                    channel_id: video.snippet.channelId,
                    channel_title: video.snippet.channelTitle,
                    video_id: video.id.videoId,
                    video_data: JSON.stringify({
                        title: video.snippet.title,
                        thumbnail: video.snippet.thumbnails.high.url
                    })
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const toggleSubscribe = async (video: YouTubeVideo) => {
        if (!userProfile) return;
        const isSubscribed = subscribedChannels.has(video.snippet.channelId);

        setSubscribedChannels(prev => {
            const next = new Set(prev);
            if (isSubscribed) next.delete(video.snippet.channelId);
            else next.add(video.snippet.channelId);
            return next;
        });

        try {
            if (isSubscribed) {
                await supabase
                    .from('youtube_interactions')
                    .delete()
                    .match({ user_id: userProfile.id, interaction_type: 'subscribe', channel_id: video.snippet.channelId });
            } else {
                await supabase.from('youtube_interactions').insert({
                    user_id: userProfile.id,
                    interaction_type: 'subscribe',
                    channel_id: video.snippet.channelId,
                    channel_title: video.snippet.channelTitle
                });
                toast({ title: "Subscribed", description: `You have subscribed to ${video.snippet.channelTitle}` });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const shareWithFriends = (video: YouTubeVideo) => {
        // Save to local storage to persist the link intention, then go to friends
        const shareLink = `https://www.youtube.com/shorts/${video.id.videoId}`;
        localStorage.setItem('share_intent', shareLink);
        toast({ title: "Ready to Share", description: "Select friends to send this Shot.", duration: 2000 });
        navigate('/friends');
    };

    const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent, video: YouTubeVideo) => {
        let clientX = 'clientX' in e ? e.clientX : e.changedTouches[0].clientX;
        let clientY = 'clientY' in e ? e.clientY : e.changedTouches[0].clientY;

        setHeartAnim({ id: Date.now().toString(), x: clientX, y: clientY });
        setTimeout(() => setHeartAnim(null), 1000);

        if (!likedVideos.has(video.id.videoId)) {
            toggleLike(video);
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (scrollContainerRef.current?.scrollTop === 0) {
            touchStartY.current = e.touches[0].clientY;
        } else {
            touchStartY.current = null;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartY.current === null) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - touchStartY.current;
        if (diff > 80 && !isRefreshing) {
            fetchShorts(true);
            touchStartY.current = null;
        }
    };

    const handleTouchEnd = () => {
        touchStartY.current = null;
    };

    return (
        <div className="fixed inset-0 bg-black flex flex-col pt-safe overflow-hidden z-50">

            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 z-40 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pt-safe">
                <button onClick={() => navigate(-1)} className="h-10 w-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 active:scale-90 transition-transform">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <div />
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 active:scale-90 transition-transform"
                    >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </button>
                    <button
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`h-10 w-10 flex items-center justify-center rounded-full backdrop-blur-md border border-white/10 active:scale-90 transition-colors ${autoScroll ? 'bg-[#30D158] text-white' : 'bg-black/40 text-white/60'}`}
                    >
                        <Settings className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 text-[#FF0000] animate-spin mb-4" />
                    <p className="text-white/50 text-sm font-bold tracking-widest uppercase">Tuning Signal...</p>
                </div>
            )}

            {/* Loading / Refreshing Overlay */}
            <AnimatePresence>
                {isRefreshing && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-black/70 backdrop-blur-xl border border-white/10 rounded-full p-3 shadow-2xl"
                    >
                        <RefreshCw className="h-6 w-6 text-white animate-spin" />
                    </motion.div>
                )}
                {heartAnim && (
                    <motion.div
                        key={heartAnim.id}
                        initial={{ scale: 0, opacity: 0, x: heartAnim.x - 48, y: heartAnim.y - 48 }}
                        animate={{ scale: 1.5, opacity: 1, y: heartAnim.y - 100 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.8, type: 'spring' }}
                        className="fixed z-[100] pointer-events-none drop-shadow-[0_0_30px_rgba(255,55,95,0.8)]"
                    >
                        <Heart className="h-24 w-24 text-[#FF375F] fill-[#FF375F]" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feed Container */}
            <div
                ref={scrollContainerRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="flex-1 overflow-y-auto w-full h-full snap-y snap-mandatory hide-scrollbar relative"
                style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
            >
                {videos.map((video, idx) => {
                    const isLiked = likedVideos.has(video.id.videoId);
                    const isSubscribed = subscribedChannels.has(video.snippet.channelId);
                    const isActive = idx === activeVideoIndex;

                    return (
                        <div key={video.id.videoId} className="w-full h-full snap-start relative bg-[#0A0A0F] flex items-center justify-center">

                            {/* YouTube Player */}
                            <div
                                className="w-full h-full relative"
                                style={{ paddingBottom: 'env(safe-area-inset-bottom, 80px)' }}
                                onDoubleClick={(e) => handleDoubleTap(e, video)}
                            >
                                {isActive ? (
                                    <iframe
                                        ref={el => iframeRefs.current[idx] = el}
                                        src={`https://www.youtube.com/embed/${video.id.videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&loop=1&playlist=${video.id.videoId}&playsinline=1`}
                                        className="w-full h-full scale-[1.05]"
                                        title="YouTube short player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                ) : (
                                    <img src={video.snippet.thumbnails.high.url} alt="Thumbnail" className="w-full h-full object-cover opacity-50 blur-sm" />
                                )}

                                {/* Visual Gradient Guards */}
                                <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
                                <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
                            </div>

                            {/* Engagement Overlay */}
                            <div className="absolute right-4 bottom-[100px] flex flex-col gap-6 items-center z-20">
                                <button
                                    onClick={() => toggleLike(video)}
                                    className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                                >
                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl transition-colors ${isLiked ? 'bg-[#FF375F] border-transparent' : 'bg-black/20 border border-white/20'}`}>
                                        <Heart className={`h-6 w-6 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
                                    </div>
                                    <span className="text-[12px] font-black text-white drop-shadow-md">Like</span>
                                </button>

                                <button
                                    onClick={() => shareWithFriends(video)}
                                    className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                                >
                                    <div className="h-12 w-12 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl bg-black/20 border border-white/20 hover:bg-[#0A84FF] transition-colors">
                                        <Send className="h-5 w-5 text-white translate-x-px" />
                                    </div>
                                    <span className="text-[12px] font-black text-white drop-shadow-md">Share</span>
                                </button>
                            </div>

                            {/* Info Overlay */}
                            <div className="absolute left-4 bottom-[100px] right-20 z-20 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FF0000] to-[#BF5AF2] border-2 border-white/20 flex items-center justify-center overflow-hidden">
                                        <span className="text-white text-sm font-black">{video.snippet.channelTitle[0]}</span>
                                    </div>
                                    <h3 className="text-[16px] font-black text-white drop-shadow-lg leading-tight truncate">
                                        @{video.snippet.channelTitle}
                                    </h3>

                                    <button
                                        onClick={() => toggleSubscribe(video)}
                                        className={`ml-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${isSubscribed ? 'bg-white/10 text-white/50 border border-white/10' : 'bg-white text-black'}`}
                                    >
                                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                    </button>
                                </div>

                                <p className="text-[14px] text-white/90 font-medium drop-shadow-lg line-clamp-2 leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {video.snippet.title}
                                </p>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SharePage;
