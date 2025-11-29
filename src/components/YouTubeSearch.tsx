import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Youtube, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Interface matching the structure expected by VideoCarousel
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
  // Search State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  // Suggested Content State
  const [suggestedVideos, setSuggestedVideos] = useState<YouTubeVideo[]>([]);
  const [isSuggestedLoading, setIsSuggestedLoading] = useState(true);

  const { toast } = useToast();

  // YouTube Data API key
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || 'AIzaSyCFU4OekJXflsSqf5eorVjQoZ6ZyruK5gE';
  const API_KEY_ERROR_MESSAGE = 'YouTube API key is invalid, restricted, or has exceeded its daily quota. Please check referrer settings.';

  // Cache helper functions
  const getCachedData = (key: string) => {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    try {
      const { data, timestamp } = JSON.parse(cached);
      // Cache expires after 24 hours
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
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  };

  useEffect(() => {
    fetchSuggestedVideos();
  }, []);

  const fetchSuggestedVideos = async () => {
    const CACHE_KEY = 'youtube_suggested_videos_telugu';

    // Try to get from cache first
    const cachedVideos = getCachedData(CACHE_KEY);
    if (cachedVideos) {
      setSuggestedVideos(cachedVideos);
      setIsSuggestedLoading(false);
      return;
    }

    if (!API_KEY) return;
    setIsSuggestedLoading(true);
    try {
      // Fetch more results to pick random ones
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=Latest+Telugu+movie+trailers+songs&key=${API_KEY}&type=video&order=date&maxResults=5&videoEmbeddable=true`
      );
      if (!response.ok) throw new Error('Failed to fetch suggested videos');
      const data = await response.json();

      // Pick 8 random videos
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

    // Try to get from cache first
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
    <div className="space-y-8">
      {/* Search Section */}
      <div className="bg-card/50 backdrop-blur-xl rounded-xl border border-border/50 p-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Youtube className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Discover Content</h2>
                <p className="text-sm text-muted-foreground">Search videos</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                disabled={!isConnected}
                className="pl-10 h-10 bg-background/50 border-border/50"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!isConnected || isSearchLoading}
              size="sm"
              variant="default"
              className="h-10 px-4"
            >
              {isSearchLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Suggested Videos Section (Telugu Trailers & Songs) */}
          {!query && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-[#FF0000] rounded-full" />
                Latest Telugu Trailers & Songs
              </h3>

              {isSuggestedLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="aspect-video rounded-lg bg-muted/30" />
                      <Skeleton className="h-3 w-3/4 bg-muted/30" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {suggestedVideos.map((video) => {
                    // Strict safety check to prevent crashes
                    if (!video || !video.id || !video.id.videoId || !video.snippet) return null;

                    return (
                      <div
                        key={video.id.videoId}
                        className="group cursor-pointer space-y-2"
                        onClick={() => onVideoSelect(video.id.videoId)}
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black/20">
                          <img
                            src={video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url || ''}
                            alt={video.snippet.title || 'Video thumbnail'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              // Fallback for broken images
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300">
                              <Play className="w-5 h-5 text-white fill-white" />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-foreground/90 line-clamp-2 leading-relaxed group-hover:text-primary transition-colors">
                          {video.snippet.title || 'Untitled Video'}
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
            <div className="space-y-2 mb-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Search Results</h3>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Skeleton className="w-24 h-16 rounded bg-muted" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4 bg-muted" />
                    <Skeleton className="h-3 w-1/2 bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3 mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Search Results
              </h3>
              <div className="space-y-2">
                {results.map((video) => (
                  <div
                    key={video.id.videoId}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer group border border-border/30 bg-card/30"
                    onClick={() => onVideoSelect(video.id.videoId)}
                  >
                    <div className="relative overflow-hidden rounded">
                      <img
                        src={video.snippet.thumbnails.medium.url}
                        alt={video.snippet.title}
                        className="w-24 h-16 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium line-clamp-2 text-sm">
                        {video.snippet.title}
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">Tap to watch</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubeSearch;
