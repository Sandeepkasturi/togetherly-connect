
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: { default: { url: string } };
  };
}

interface YouTubeSearchProps {
  onVideoSelect: (videoId: string) => void;
  isConnected: boolean;
}

const YouTubeSearch = ({ onVideoSelect, isConnected }: YouTubeSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!apiKey) {
      toast({
        title: 'Error',
        description: 'YouTube API key is not configured.',
        variant: 'destructive',
      });
      return;
    }
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${apiKey}&type=video&maxResults=5`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Failed to fetch videos');
      }
      const data = await response.json();
      setResults(data.items);
    } catch (error: any) {
      toast({
        title: 'Search Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-secondary/30 rounded-lg border border-border">
      <h2 className="text-lg font-semibold mb-2">Watch Together</h2>
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Search YouTube..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          disabled={!isConnected}
        />
        <Button onClick={handleSearch} disabled={!isConnected || isLoading}>
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
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
    </div>
  );
};

export default YouTubeSearch;
