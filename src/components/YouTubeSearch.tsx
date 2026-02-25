import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
}

interface YouTubeSearchProps {
  onVideoSelect: (videoId: string) => void;
  isConnected: boolean;
}

const YouTubeSearch = ({ onVideoSelect, isConnected }: YouTubeSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [suggestedVideos, setSuggestedVideos] = useState<YouTubeVideo[]>([]);
  const [isSuggestedLoading, setIsSuggestedLoading] = useState(true);

  const { toast } = useToast();

  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  const API_KEY_ERROR_MESSAGE = 'YouTube API key is missing or invalid. Please configure VITE_YOUTUBE_API_KEY in your environment.';

  const getCachedData = (key: string) => {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(key);
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  };

  const setCachedData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  };

  useEffect(() => {
    fetchSuggestedVideos();
  }, []);

  const fetchSuggestedVideos = async () => {
    const CACHE_KEY = 'youtube_suggested_videos_telugu';
    const cachedVideos = getCachedData(CACHE_KEY);
    if (cachedVideos) {
      setSuggestedVideos(cachedVideos);
      setIsSuggestedLoading(false);
      return;
    }
    if (!API_KEY) return;
    setIsSuggestedLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=Latest+Telugu+movie+trailers+songs&key=${API_KEY}&type=video&order=date&maxResults=5&videoEmbeddable=true`
      );
      if (!response.ok) throw new Error('Failed to fetch suggested videos');
      const data = await response.json();
      const shuffled = data.items ? data.items.sort(() => 0.5 - Math.random()) : [];
      const selected = shuffled.slice(0, 3);
      setSuggestedVideos(selected);
      setCachedData(CACHE_KEY, selected);
    } catch (error) {
      console.error('Error fetching suggested videos:', error);
    } finally {
      setIsSuggestedLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!API_KEY) {
      toast({ title: 'Configuration Error', description: API_KEY_ERROR_MESSAGE, variant: 'destructive' });
      return;
    }
    if (!query.trim()) return;
    const CACHE_KEY = `youtube_search_${query.trim().toLowerCase()}`;
    setIsSearchLoading(true);
    setResults([]);
    const cachedResults = getCachedData(CACHE_KEY);
    if (cachedResults) {
      setResults(cachedResults);
      setIsSearchLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${API_KEY}&type=video&maxResults=4`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Failed to fetch videos');
      }
      const data = await response.json();
      setResults(data.items);
      setCachedData(CACHE_KEY, data.items);
    } catch (error: any) {
      toast({ title: 'Search Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSearchLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Luxury Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-[#0A84FF] transition-colors" />
          <input
            placeholder="Search for videos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            disabled={!isConnected}
            className="w-full rounded-[24px] pl-11 pr-5 py-3.5 text-[15px] text-white outline-none bg-white/[0.03] border border-white/[0.05] focus:border-[#0A84FF]/30 transition-all placeholder:text-white/20 font-semibold shadow-inner"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSearch}
          disabled={!isConnected || isSearchLoading}
          className="h-12 w-12 rounded-[22px] bg-[#0A84FF] text-white flex items-center justify-center shadow-[0_0_20px_rgba(10,132,255,0.3)] disabled:opacity-50 disabled:grayscale transition-all"
        >
          {isSearchLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </motion.button>
      </div>

      {/* Suggested Videos - Horizontal scroll */}
      {!query && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[12px] font-black text-white/30 uppercase tracking-[0.15em]">Trending Now</h3>
            <div className="h-1 w-8 rounded-full bg-white/5" />
          </div>
          {isSuggestedLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="shrink-0 w-44 space-y-2">
                  <Skeleton className="aspect-video rounded-xl bg-white/5" />
                  <Skeleton className="h-3 w-3/4 bg-white/5" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 snap-x snap-mandatory no-scrollbar">
              {suggestedVideos.map((video) => {
                if (!video?.id?.videoId || !video?.snippet) return null;
                return (
                  <motion.div
                    key={video.id.videoId}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="shrink-0 w-64 group cursor-pointer snap-start"
                    onClick={() => onVideoSelect(video.id.videoId)}
                  >
                    <div className="relative aspect-video rounded-[24px] overflow-hidden border border-white/5 bg-black/40 mb-3 shadow-2xl">
                      <img
                        src={video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url || ''}
                        alt={video.snippet.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <motion.div
                          initial={false}
                          whileHover={{ scale: 1.1 }}
                          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 border border-white/30"
                        >
                          <Play className="w-5 h-5 text-white fill-white" />
                        </motion.div>
                      </div>
                    </div>
                    <p className="text-[14px] font-bold text-white/80 line-clamp-2 leading-tight group-hover:text-white transition-colors px-1">
                      {video.snippet.title}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {isSearchLoading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5">
              <Skeleton className="w-24 h-16 rounded-lg bg-white/5" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3.5 w-3/4 bg-white/5" />
                <Skeleton className="h-3 w-1/2 bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="h-5 w-1 rounded-full bg-[#0A84FF]" />
            <h3 className="text-[14px] font-black text-white/50 uppercase tracking-[0.1em]">Search Results</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {results.map((video, i) => (
              <motion.div
                key={video.id.videoId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-3 rounded-[28px] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] cursor-pointer group transition-all"
                onClick={() => onVideoSelect(video.id.videoId)}
              >
                <div className="relative overflow-hidden rounded-[20px] shrink-0 shadow-lg aspect-video h-20">
                  <img
                    src={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                    <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center border border-white/50 shadow-xl">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-[15px] font-bold line-clamp-2 text-white/90 group-hover:text-white transition-colors leading-snug">
                    {video.snippet.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black text-[#0A84FF] bg-[#0A84FF]/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Select</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeSearch;
