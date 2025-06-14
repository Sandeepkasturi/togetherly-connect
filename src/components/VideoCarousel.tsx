
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton";

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
        <div className="py-4">
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <div className="flex space-x-4 overflow-x-hidden">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2 shrink-0">
                        <Skeleton className="h-[90px] w-[160px] rounded-lg" />
                        <Skeleton className="h-4 w-[140px]" />
                    </div>
                ))}
            </div>
        </div>
    )
  }
  
  if (videos.length === 0) return null;

  return (
    <div className="py-4">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {videos.map((video) => (
            <CarouselItem key={video.id.videoId} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 pl-2">
              <div
                className="p-1 cursor-pointer group"
                onClick={() => onVideoSelect(video.id.videoId)}
              >
                <div className="overflow-hidden rounded-lg">
                    <img
                        src={video.snippet.thumbnails.medium.url}
                        alt={video.snippet.title}
                        className="w-full h-auto object-cover aspect-video transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <p className="text-sm mt-2 font-medium leading-tight h-10 group-hover:text-primary">{video.snippet.title}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  )
}

export default VideoCarousel;
