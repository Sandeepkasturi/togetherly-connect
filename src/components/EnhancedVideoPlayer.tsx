
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import YouTubePlayer from './YouTubePlayer';
import MediaControls from './MediaControls';
import { DataType } from '@/hooks/usePeer';

interface EnhancedVideoPlayerProps {
  videoId: string;
  sendData: (data: DataType) => void;
  playerData: DataType | null;
  isConnected: boolean;
  onPlayingStateChange?: (isPlaying: boolean) => void;
}

const EnhancedVideoPlayer = ({ videoId, sendData, playerData, isConnected, onPlayingStateChange }: EnhancedVideoPlayerProps) => {
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

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

  // Show controls on mouse movement/touch
  const showControls = () => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, 3000);
  };

  const hideControls = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setIsControlsVisible(false);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleRotate = () => {
    setIsRotated(!isRotated);
  };

  const handlePlayPause = () => {
    // This would integrate with YouTube player controls
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    onPlayingStateChange?.(newPlayingState);
  };

  // Notify parent when playing state changes from YouTube player
  useEffect(() => {
    onPlayingStateChange?.(isPlaying);
  }, [isPlaying, onPlayingStateChange]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

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
      onMouseMove={showControls}
      onMouseLeave={hideControls}
      onTouchStart={showControls}
      style={{
        cursor: isControlsVisible ? 'default' : 'none'
      }}
    >
      <YouTubePlayer 
        videoId={videoId} 
        sendData={sendData}
        playerData={playerData}
        isConnected={isConnected}
      />
      
      <MediaControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isMuted={isMuted}
        onMuteToggle={handleMuteToggle}
        onFullscreen={handleFullscreen}
        onRotate={handleRotate}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        isVisible={isControlsVisible}
      />

      {/* Gradient overlays for better control visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none" />
    </motion.div>
  );
};

export default EnhancedVideoPlayer;
