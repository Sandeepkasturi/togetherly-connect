
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Clock } from "lucide-react";

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

interface VideoCarouselProps {
  title: string;
  videos: YouTubeVideo[];
  onVideoSelect: (videoId: string) => void;
  isLoading: boolean;
  isConnected: boolean;
}

const VideoCarousel = ({ title, videos, onVideoSelect, isLoading, isConnected }: VideoCarouselProps) => {
  if (!isConnected) return null;
  
  if (isLoading) {
    return (
        <div className="py-6">
            <h3 className="text-2xl font-bold mb-6 text-white">{title}</h3>
            <div className="flex space-x-4 overflow-x-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-3 shrink-0">
                        <Skeleton className="h-[160px] w-[280px] rounded-xl bg-white/10" />
                        <Skeleton className="h-4 w-[240px] bg-white/10" />
                        <Skeleton className="h-3 w-[180px] bg-white/10" />
                    </div>
                ))}
            </div>
        </div>
    )
  }
  
  if (videos.length === 0) return null;

  return (
    <div className="py-6">
      <h3 className="text-2xl font-bold mb-6 text-white">{title}</h3>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {videos.map((video) => (
            <CarouselItem key={video.id.videoId} className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6 pl-4">
              <div
                className="cursor-pointer group"
                onClick={() => onVideoSelect(video.id.videoId)}
              >
                <div className="relative overflow-hidden rounded-xl bg-black/20 border border-white/10 transition-all duration-300 group-hover:scale-105 group-hover:border-white/30">
                    <div className="relative aspect-video">
                      <img
                          src={video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium.url}
                          alt={video.snippet.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      {/* Duration badge */}
                      <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>HD</span>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <p className="text-white font-medium leading-tight h-12 line-clamp-2 group-hover:text-red-400 transition-colors duration-300 text-sm">
                        {video.snippet.title}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">Ready to watch</p>
                    </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex bg-black/60 border-white/20 text-white hover:bg-black/80" />
        <CarouselNext className="hidden sm:flex bg-black/60 border-white/20 text-white hover:bg-black/80" />
      </Carousel>
    </div>
  )
}

export default VideoCarousel;
