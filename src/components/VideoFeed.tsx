
import { useRef, useEffect } from 'react';

interface VideoFeedProps {
  stream: MediaStream | null;
  isMuted?: boolean;
  isMe?: boolean;
}

const VideoFeed = ({ stream, isMuted = false, isMe = false }: VideoFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video ref={videoRef} autoPlay playsInline muted={isMuted} className="w-full h-full object-cover" style={{ transform: isMe ? 'scaleX(-1)' : 'none' }}/>
    </div>
  );
};

export default VideoFeed;
