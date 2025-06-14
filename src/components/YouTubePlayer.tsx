
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { DataType } from '@/hooks/usePeer';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  sendData: (data: DataType) => void;
  playerData: DataType | null;
  isConnected: boolean;
}

const YouTubePlayer = ({ videoId, sendData, playerData, isConnected }: YouTubePlayerProps) => {
  const playerRef = useRef<any>(null);
  const isUpdatingFromPeer = useRef(false);
  const [isApiReady, setIsApiReady] = useState(!!(window.YT && window.YT.Player));

  // Load YouTube IFrame API script
  useEffect(() => {
    if (isApiReady) return;

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      setIsApiReady(true);
    };

    return () => {
      if (window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady = undefined;
      }
    };
  }, [isApiReady]);

  const onPlayerStateChange = (event: any) => {
    if (isUpdatingFromPeer.current || !isConnected) {
      return;
    }

    const player = event.target;
    const time = player.getCurrentTime();

    // States: 1 (playing), 2 (paused)
    if (event.data === 1 || event.data === 2) {
      sendData({
        type: 'player_state',
        payload: {
          event: event.data === 1 ? 'play' : 'pause',
          currentTime: time,
        },
      });
    }
  };

  // Initialize player
  useEffect(() => {
    if (!isApiReady || !videoId) return;

    const player = new window.YT.Player('youtube-player', {
      videoId,
      playerVars: {
        'playsinline': 1,
        'autoplay': 1,
        'controls': 1,
      },
      events: {
        'onStateChange': onPlayerStateChange,
      },
    });
    playerRef.current = player;

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isApiReady, videoId]);

  // Handle incoming peer data to sync players
  useEffect(() => {
    if (!playerRef.current || !playerData || playerData.type !== 'player_state' || !isConnected) {
      return;
    }

    isUpdatingFromPeer.current = true;
    
    const { event, currentTime } = playerData.payload;
    const player = playerRef.current;
    const clientTime = player.getCurrentTime();
    const timeDiff = Math.abs(clientTime - currentTime);
    
    switch (event) {
      case 'play':
        if (player.getPlayerState() !== 1 || timeDiff > 1.5) {
          if (timeDiff > 1.5) player.seekTo(currentTime, true);
          player.playVideo();
        }
        break;
      case 'pause':
        if (player.getPlayerState() !== 2 || timeDiff > 1.5) {
          player.pauseVideo();
          if (timeDiff > 1.5) player.seekTo(currentTime, true);
        }
        break;
    }

    setTimeout(() => { isUpdatingFromPeer.current = false; }, 200);

  }, [playerData, isConnected]);

  if (!videoId) {
    return (
        <div className="aspect-video w-full bg-secondary/30 rounded-lg border border-border flex items-center justify-center">
            <p className="text-muted-foreground">Search for a video to watch together</p>
        </div>
    );
  }

  return (
    <motion.div
      key={videoId} // This is crucial for re-initialization on new video
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="aspect-video w-full"
    >
      <div id="youtube-player" className="w-full h-full rounded-lg" />
    </motion.div>
  );
};

export default YouTubePlayer;
