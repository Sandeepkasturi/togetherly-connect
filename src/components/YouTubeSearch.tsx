import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Youtube, Sparkles, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VideoCarousel from './VideoCarousel';
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

  const [movies, setMovies] = useState<YouTubeVideo[]>([]);
  const [songs, setSongs] = useState<YouTubeVideo[]>([]);
  const [shorts, setShorts] = useState<YouTubeVideo[]>([]);
  
  const [isMoviesLoading, setIsMoviesLoading] = useState(false);
  const [isSongsLoading, setIsSongsLoading] = useState(false);
  const [isShortsLoading, setIsShortsLoading] = useState(false);

  const [teluguMovies, setTeluguMovies] = useState<YouTubeVideo[]>([]);
  const [teluguSongs, setTeluguSongs] = useState<YouTubeVideo[]>([]);
  const [teluguShorts, setTeluguShorts] = useState<YouTubeVideo[]>([]);
  
  const [isTeluguMoviesLoading, setIsTeluguMoviesLoading] = useState(false);
  const [isTeluguSongsLoading, setIsTeluguSongsLoading] = useState(false);
  const [isTeluguShortsLoading, setIsTeluguShortsLoading] = useState(false);

  const { toast } = useToast();

  // I've added your API key here to get it working.
  // IMPORTANT: For security, it's best to use a .env.local file for your API key instead of hardcoding it.
  const API_KEY = "AIzaSyAJD2GwErQRz09LtRN6EQ6DBCyeBGEfxMs";
  const API_KEY_ERROR_MESSAGE = 'The provided YouTube API key might be invalid or has exceeded its daily quota.';

  const handleSearch = async () => {
    if (!API_KEY) {
      toast({ title: 'Configuration Error', description: API_KEY_ERROR_MESSAGE, variant: 'destructive' });
      return;
    }
    if (!query.trim()) return;
    setIsSearchLoading(true);
    setResults([]);
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${API_KEY}&type=video&maxResults=5`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Failed to fetch videos');
      }
      const data = await response.json();
      setResults(data.items);
    } catch (error: any) {
      toast({ title: 'Search Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSearchLoading(false);
    }
  };

  const fetchCategoryVideos = useCallback(async (
    categoryQuery: string,
    setData: React.Dispatch<React.SetStateAction<YouTubeVideo[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    categoryName: string
  ) => {
    setLoading(true);
    try {
      if (!API_KEY) {
        throw new Error(API_KEY_ERROR_MESSAGE);
      }
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(categoryQuery)}&key=${API_KEY}&type=video&maxResults=10`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Failed to fetch videos');
      }
      const data = await response.json();
      setData(data.items);
    } catch (error: any) {
      toast({
        title: `Error fetching ${categoryName}`,
        description: error.message,
        variant: 'destructive',
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [toast, API_KEY]);

  useEffect(() => {
    if (isConnected && API_KEY) {
      if (movies.length === 0 && !isMoviesLoading) {
        fetchCategoryVideos('latest movie trailers', setMovies, setIsMoviesLoading, 'Movies');
      }
      if (songs.length === 0 && !isSongsLoading) {
        fetchCategoryVideos('trending music 2025', setSongs, setIsSongsLoading, 'Songs');
      }
      if (shorts.length === 0 && !isShortsLoading) {
        fetchCategoryVideos('popular #shorts', setShorts, setIsShortsLoading, 'Shorts');
      }
      if (teluguMovies.length === 0 && !isTeluguMoviesLoading) {
        fetchCategoryVideos('latest telugu movie trailers', setTeluguMovies, setIsTeluguMoviesLoading, 'Telugu Movies');
      }
      if (teluguSongs.length === 0 && !isTeluguSongsLoading) {
        fetchCategoryVideos('trending telugu songs 2025', setTeluguSongs, setIsTeluguSongsLoading, 'Telugu Songs');
      }
      if (teluguShorts.length === 0 && !isTeluguShortsLoading) {
        fetchCategoryVideos('telugu #shorts', setTeluguShorts, setIsTeluguShortsLoading, 'Telugu Shorts');
      }
    }
  }, [isConnected, API_KEY, fetchCategoryVideos, movies.length, songs.length, shorts.length, isMoviesLoading, isSongsLoading, isShortsLoading, teluguMovies.length, teluguSongs.length, teluguShorts.length, isTeluguMoviesLoading, isTeluguSongsLoading, isTeluguShortsLoading]);

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
      
      {/* Content Categories */}
      <div className="space-y-8">
        <VideoCarousel title="🎬 Latest Movies & Trailers" videos={movies} onVideoSelect={onVideoSelect} isLoading={isMoviesLoading} isConnected={isConnected}/>
        <VideoCarousel title="🎵 Trending Music" videos={songs} onVideoSelect={onVideoSelect} isLoading={isSongsLoading} isConnected={isConnected}/>
        <VideoCarousel title="⚡ Popular Shorts" videos={shorts} onVideoSelect={onVideoSelect} isLoading={isShortsLoading} isConnected={isConnected}/>
        <VideoCarousel title="🎭 Latest Telugu Movies" videos={teluguMovies} onVideoSelect={onVideoSelect} isLoading={isTeluguMoviesLoading} isConnected={isConnected}/>
        <VideoCarousel title="🎶 Trending Telugu Music" videos={teluguSongs} onVideoSelect={onVideoSelect} isLoading={isTeluguSongsLoading} isConnected={isConnected}/>
        <VideoCarousel title="⭐ Popular Telugu Shorts" videos={teluguShorts} onVideoSelect={onVideoSelect} isLoading={isTeluguShortsLoading} isConnected={isConnected}/>
      </div>
    </div>
  );
};

export default YouTubeSearch;
