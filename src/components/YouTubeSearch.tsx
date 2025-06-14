import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Youtube } from 'lucide-react';
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

  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  const API_KEY_ERROR_MESSAGE = 'YouTube API key is not configured. Please create a .env.local file with: VITE_YOUTUBE_API_KEY="your_key"';

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
    <div className="p-4 bg-secondary/30 rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <Youtube className="h-6 w-6 text-red-500" />
        <h2 className="text-lg font-semibold">Watch Together</h2>
      </div>
      <div className="flex items-center gap-2 my-4">
        <Input
          placeholder="Or search YouTube..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          disabled={!isConnected}
        />
        <Button onClick={handleSearch} disabled={!isConnected || isSearchLoading}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {isSearchLoading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 p-2">
              <Skeleton className="w-16 h-12 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2 mb-6">
          <h3 className="text-xl font-bold">Search Results</h3>
          {results.map((video) => (
            <div
              key={video.id.videoId}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onVideoSelect(video.id.videoId)}
            >
              <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} className="w-16 h-12 object-cover rounded" />
              <p className="text-sm">{video.snippet.title}</p>
            </div>
          ))}
        </div>
      )}
      
      <div className="space-y-4">
        <VideoCarousel title="Latest Movies & Trailers" videos={movies} onVideoSelect={onVideoSelect} isLoading={isMoviesLoading} isConnected={isConnected}/>
        <VideoCarousel title="Trending Music" videos={songs} onVideoSelect={onVideoSelect} isLoading={isSongsLoading} isConnected={isConnected}/>
        <VideoCarousel title="Popular Shorts" videos={shorts} onVideoSelect={onVideoSelect} isLoading={isShortsLoading} isConnected={isConnected}/>
        <VideoCarousel title="Latest Telugu Movies & Trailers" videos={teluguMovies} onVideoSelect={onVideoSelect} isLoading={isTeluguMoviesLoading} isConnected={isConnected}/>
        <VideoCarousel title="Trending Telugu Music" videos={teluguSongs} onVideoSelect={onVideoSelect} isLoading={isTeluguSongsLoading} isConnected={isConnected}/>
        <VideoCarousel title="Popular Telugu Shorts" videos={teluguShorts} onVideoSelect={onVideoSelect} isLoading={isTeluguShortsLoading} isConnected={isConnected}/>
      </div>
    </div>
  );
};

export default YouTubeSearch;
