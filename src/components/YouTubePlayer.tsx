
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { DataType } from '@/hooks/usePeer';
import { Play } from 'lucide-react';

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
  const [isPlayerReady, setIsPlayerReady] = useState(false);

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

  const onPlayerReady = () => {
    setIsPlayerReady(true);
  };

  const onPlayerStateChange = (event: any) => {
    if (isUpdatingFromPeer.current || !isConnected) {
      return;
    }

    const player = event.target;
    if (typeof player.getCurrentTime !== 'function') {
      return;
    }
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

    setIsPlayerReady(false);

    const player = new window.YT.Player('youtube-player', {
      videoId,
      playerVars: {
        'playsinline': 1,
        'autoplay': 1,
        'controls': 1,
      },
      events: {
        'onReady': onPlayerReady,
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
    if (!playerRef.current || !isPlayerReady || !playerData || playerData.type !== 'player_state' || !isConnected) {
      return;
    }

    isUpdatingFromPeer.current = true;
    
    const { event, currentTime } = playerData.payload;
    const player = playerRef.current;
    
    // Defensive check for player methods
    if (typeof player.getCurrentTime !== 'function' || typeof player.getPlayerState !== 'function') {
      isUpdatingFromPeer.current = false;
      return;
    }
    
    if (event === 'play') {
      const clientTime = player.getCurrentTime();
      if (Math.abs(clientTime - currentTime) > 1.5) {
        player.seekTo(currentTime, true);
      }
      // seekTo might start playback, but playVideo() ensures it.
      if (player.getPlayerState() !== 1) { 
        player.playVideo();
      }
    } else if (event === 'pause') {
      // It's safer to pause first, then seek.
      if (player.getPlayerState() !== 2) {
        player.pauseVideo();
      }
      const clientTime = player.getCurrentTime();
      if (Math.abs(clientTime - currentTime) > 1.5) {
        player.seekTo(currentTime, true);
      }
    }

    // Increased timeout to allow player state to settle
    setTimeout(() => { isUpdatingFromPeer.current = false; }, 300);

  }, [playerData, isConnected, isPlayerReady]);

  if (!videoId) {
    return (
      <div className="aspect-video w-full bg-gradient-to-br from-secondary/30 via-secondary/20 to-secondary/30 rounded-xl border border-border/50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5"></div>
        <div className="text-center space-y-4 z-10">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <Play className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Watch Together?</h3>
            <p className="text-muted-foreground max-w-md">
              Search for a video below to start sharing your viewing experience with friends
            </p>
          </div>
        </div>
        <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-xl"></div>
      </div>
    );
  }

  return (
    <motion.div
      key={videoId}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="aspect-video w-full relative overflow-hidden rounded-xl"
    >
      <div id="youtube-player" className="w-full h-full rounded-xl" />
      
      {/* Connection status indicator */}
      {isConnected && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg"
        >
          🟢 Synced
        </motion.div>
      )}
    </motion.div>
  );
};

export default YouTubePlayer;
