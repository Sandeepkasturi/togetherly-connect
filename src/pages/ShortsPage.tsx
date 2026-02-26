import { useEffect, useRef, useState } from 'react';
import ShortsPlayer from '@/components/ShortsPlayer';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Hardcoded mock feed for demonstration purposes
const MOCK_SHORTS = [
    {
        id: '1',
        videoId: 'F0B7HDiY-10', // Example Short ID 
        author: 'TechTok',
        description: 'The future of AI is here and it is mindblowing! 🤯 #tech #ai #future'
    },
    {
        id: '2',
        videoId: 'd1YBv2mWll0', // Example Short ID
        author: 'DesignInspo',
        description: 'Minimalist workspace setup that will boost your productivity 10x 💻✨ #workspace #productivity'
    },
    {
        id: '3',
        videoId: '1La4QzGeaaQ', // Example Short ID
        author: 'CodeDaily',
        description: 'Stop using traditional CSS. Tailwind is the way. Here is why... 🚀 #coding #webdev #react'
    },
    {
        id: '4',
        videoId: 'kJQP7kiw5Fk', // Despacito but just used for testing vertical
        author: 'MusicVibes',
        description: 'This song never gets old 🔥 #music #vibes'
    }
];

const ShortsPage = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer to detect which video is currently visible on screen
    useEffect(() => {
        const observer = new IntersectionObserver(
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

        const elements = document.querySelectorAll('.shorts-item');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

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
                {MOCK_SHORTS.map((short, index) => (
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
                            <div className="w-full h-full bg-black flex items-center justify-center">
                                {/* Placeholder loader */}
                                <div className="w-8 h-8 rounded-full border-t-2 border-[#30D158] animate-spin opacity-50"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShortsPage;
