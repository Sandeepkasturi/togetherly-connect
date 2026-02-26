import { useEffect, useRef, useState } from 'react';
import ShortsPlayer from '@/components/ShortsPlayer';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ShortsPage = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const [shorts, setShorts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const { toast } = useToast();

    const fetchShorts = async (pageToken?: string) => {
        const token = sessionStorage.getItem('yt_token');
        if (!token) {
            if (shorts.length === 0) {
                toast({
                    title: "Action Required",
                    description: "Please log out and log back in to grant YouTube access for real shorts.",
                    variant: "destructive"
                });
            }
            setIsLoading(false);
            return;
        }

        try {
            let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=%23shorts&type=video&videoDuration=short&maxResults=10`;
            if (pageToken) url += `&pageToken=${pageToken}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch from YouTube API');
            const data = await res.json();

            const newShorts = data.items.map((item: any) => ({
                id: `${item.id.videoId}_${Date.now()}_${Math.random()}`,
                videoId: item.id.videoId,
                author: item.snippet.channelTitle,
                description: item.snippet.title,
            }));

            setShorts(prev => [...prev, ...newShorts]);
            setNextPageToken(data.nextPageToken || null);
        } catch (error) {
            console.error('[ShortsPage] Error fetching shorts:', error);
            toast({
                title: "Error fetching shorts",
                description: "Failed to connect to YouTube. Please try again later.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchShorts();
    }, []);

    // Initialize Intersection Observer once
    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'));
                        if (!isNaN(index)) {
                            setActiveIndex(index);
                        }
                    }
                });
            },
            {
                root: containerRef.current,
                threshold: 0.6, // Trigger when 60% of the video is visible
            }
        );

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, []);

    // Observe all items whenever the shorts list changes
    useEffect(() => {
        if (!observerRef.current) return;
        const elements = document.querySelectorAll('.shorts-item');
        elements.forEach((el) => observerRef.current?.observe(el));
    }, [shorts]);

    // Endless scroll logic: append more items when reaching the end
    useEffect(() => {
        // Trigger fetch when user is 2 videos away from the end
        if (activeIndex >= shorts.length - 2 && !isLoading && !isFetchingMore) {
            setIsFetchingMore(true);
            fetchShorts(nextPageToken || undefined);
        }
    }, [activeIndex, shorts.length, isLoading, isFetchingMore, nextPageToken]);

    return (
        <div className="fixed inset-0 bg-[#0A0A0F] text-white overflow-hidden">
            {/* Top Navigation Bar Overlay */}
            <div className="absolute top-0 w-full z-50 p-4 md:p-6 flex items-center justify-between pointer-events-none">
                <button
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-white shadow-xl pointer-events-auto hover:bg-black/60 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="font-bold tracking-widest uppercase text-[15px] drop-shadow-md text-white/90">
                    For You
                </div>
                <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Snap Scrolling Container */}
            <div
                ref={containerRef}
                className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
                style={{ scrollBehavior: 'smooth' }}
            >
                {isLoading && shorts.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-black gap-4 text-white/50">
                        <Loader2 className="w-8 h-8 animate-spin text-[#30D158]" />
                        <p className="font-bold tracking-widest uppercase text-[12px]">Loading Feed...</p>
                    </div>
                ) : !isLoading && shorts.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0A0A0F] gap-4 text-white p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                            <span className="text-2xl">🎬</span>
                        </div>
                        <h2 className="text-xl font-bold">No Shorts Found</h2>
                        <p className="text-white/50 text-sm max-w-xs">
                            We couldn't load any YouTube Shorts. Please make sure you have granted YouTube access by logging out and logging back in.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 bg-[#30D158] text-black font-bold rounded-full text-sm hover:bg-[#30D158]/90 transition-colors"
                        >
                            Refresh Feed
                        </button>
                    </div>
                ) : (
                    shorts.map((short, index) => (
                        <div
                            key={short.id}
                            data-index={index}
                            className="shorts-item w-full h-full snap-start relative flex items-center justify-center bg-black"
                        >
                            {/* 
                  Performance Optimization: 
                  We only render the actual iframe for the active video and its immediate neighbors (+/- 1)
                  Otherwise, render a black placeholder to save memory.
                */}
                            {Math.abs(activeIndex - index) <= 1 ? (
                                <ShortsPlayer
                                    videoId={short.videoId}
                                    isActive={activeIndex === index}
                                    author={short.author}
                                    description={short.description}
                                />
                            ) : (
                                <div className="w-full h-full bg-[#0A0A0F] flex flex-col items-center justify-center">
                                    <div className="w-8 h-8 rounded-full border-t-2 border-[#30D158] animate-spin opacity-50 mb-2"></div>
                                    <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Buffering</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ShortsPage;
