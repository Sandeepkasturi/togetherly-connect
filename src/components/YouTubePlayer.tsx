
import { motion } from 'framer-motion';

interface YouTubePlayerProps {
  videoId: string;
}

const YouTubePlayer = ({ videoId }: YouTubePlayerProps) => {
  if (!videoId) {
    return (
        <div className="aspect-video w-full bg-secondary/30 rounded-lg border border-border flex items-center justify-center">
            <p className="text-muted-foreground">Search for a video to watch together</p>
        </div>
    );
  }

  return (
    <motion.div
      key={videoId}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="aspect-video w-full"
    >
      <iframe
        className="w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </motion.div>
  );
};

export default YouTubePlayer;
