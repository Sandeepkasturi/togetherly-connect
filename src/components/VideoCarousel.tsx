
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
        <div className="py-4 lg:py-6">
            <h3 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-white px-4 lg:px-0">{title}</h3>
            <div className="flex space-x-3 lg:space-x-4 overflow-x-hidden px-4 lg:px-0">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2 lg:space-y-3 shrink-0">
                        <Skeleton className="h-[120px] w-[200px] lg:h-[160px] lg:w-[280px] rounded-xl bg-white/10" />
                        <Skeleton className="h-3 lg:h-4 w-[180px] lg:w-[240px] bg-white/10" />
                        <Skeleton className="h-2 lg:h-3 w-[140px] lg:w-[180px] bg-white/10" />
                    </div>
                ))}
            </div>
        </div>
    )
  }
  
  if (videos.length === 0) return null;

  return (
    <div className="py-4 lg:py-6">
      <h3 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-white px-4 lg:px-0">{title}</h3>
      <div className="px-4 lg:px-0">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 lg:-ml-4">
            {videos.map((video) => (
              <CarouselItem key={video.id.videoId} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6 pl-2 lg:pl-4">
                <div
                  className="cursor-pointer group"
                  onClick={() => onVideoSelect(video.id.videoId)}
                >
                  <div className="relative overflow-hidden rounded-lg lg:rounded-xl bg-black/20 border border-white/10 transition-all duration-300 group-hover:scale-105 group-hover:border-white/30">
                      <div className="relative aspect-video">
                        <img
                            src={video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium.url}
                            alt={video.snippet.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 lg:p-3 border border-white/30">
                            <Play className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                          </div>
                        </div>
                        
                        {/* Duration badge */}
                        <div className="absolute bottom-1 right-1 lg:bottom-2 lg:right-2 bg-black/80 backdrop-blur-sm px-1.5 lg:px-2 py-0.5 lg:py-1 rounded text-xs text-white flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                          <span className="text-xs">HD</span>
                        </div>
                      </div>
                      
                      <div className="p-2 lg:p-3">
                        <p className="text-white font-medium leading-tight h-8 lg:h-12 line-clamp-2 group-hover:text-red-400 transition-colors duration-300 text-xs lg:text-sm">
                          {video.snippet.title}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">Ready to watch</p>
                      </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex bg-black/60 border-white/20 text-white hover:bg-black/80 -left-2 lg:-left-4" />
          <CarouselNext className="hidden sm:flex bg-black/60 border-white/20 text-white hover:bg-black/80 -right-2 lg:-right-4" />
        </Carousel>
      </div>
    </div>
  )
}

export default VideoCarousel;
