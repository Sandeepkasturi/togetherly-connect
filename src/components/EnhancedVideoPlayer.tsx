
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import YouTubePlayer from './YouTubePlayer';
import { DataType } from '@/hooks/usePeer';

interface EnhancedVideoPlayerProps {
  videoId: string;
  sendData: (data: DataType) => void;
  playerData: DataType | null;
  isConnected: boolean;
  onPlayingStateChange?: (isPlaying: boolean) => void;
  playerId?: string;
}

const EnhancedVideoPlayer = ({ videoId, sendData, playerData, isConnected, onPlayingStateChange, playerId }: EnhancedVideoPlayerProps) => {
  const [isRotated, setIsRotated] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-detect portrait orientation
  useEffect(() => {
    const handleOrientationChange = () => {
      if (window.screen && 'orientation' in window.screen) {
        const orientation = (window.screen.orientation as any)?.angle || 0;
        setIsRotated(orientation === 90 || orientation === 270);
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className={`
        relative overflow-hidden rounded-xl transition-all duration-500
        ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'aspect-video w-full'}
        ${isRotated ? 'rotate-90' : ''}
      `}
    >
      <YouTubePlayer
        videoId={videoId}
        sendData={sendData}
        playerData={playerData}
        isConnected={isConnected}
        playerId={playerId}
      />
    </motion.div>
  );
};

export default EnhancedVideoPlayer;
