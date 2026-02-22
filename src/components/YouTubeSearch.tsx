import { useState, useEffect } from 'react';
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

  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || 'AIzaSyCFU4OekJXflsSqf5eorVjQoZ6ZyruK5gE';
  const API_KEY_ERROR_MESSAGE = 'YouTube API key is invalid, restricted, or has exceeded its daily quota. Please check referrer settings.';

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
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos to watch together..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            disabled={!isConnected}
            className="pl-10 h-11 bg-white/5 border-white/10 rounded-full focus:border-primary/40 focus:ring-primary/20 placeholder:text-muted-foreground/60"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={!isConnected || isSearchLoading}
          size="icon"
          className="h-11 w-11 rounded-full shrink-0"
        >
          {isSearchLoading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Suggested Videos - Horizontal scroll */}
      {!query && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Trending</p>
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
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
              {suggestedVideos.map((video) => {
                if (!video?.id?.videoId || !video?.snippet) return null;
                return (
                  <div
                    key={video.id.videoId}
                    className="shrink-0 w-44 group cursor-pointer snap-start tap-effect"
                    onClick={() => onVideoSelect(video.id.videoId)}
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5 bg-black/20 mb-2">
                      <img
                        src={video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url || ''}
                        alt={video.snippet.title || 'Video thumbnail'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-foreground/80 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {video.snippet.title || 'Untitled'}
                    </p>
                  </div>
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
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-primary rounded-full" />
            Results
          </p>
          {results.map((video) => (
            <div
              key={video.id.videoId}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer group border border-white/5 tap-effect transition-colors"
              onClick={() => onVideoSelect(video.id.videoId)}
            >
              <div className="relative overflow-hidden rounded-lg shrink-0">
                <img
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  className="w-24 h-16 object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2 text-foreground/90 group-hover:text-foreground transition-colors">
                  {video.snippet.title}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">Tap to watch</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YouTubeSearch;
