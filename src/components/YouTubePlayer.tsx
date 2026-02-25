import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { DataType } from '@/hooks/usePeer';
import { Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  playerId?: string;
}

const YouTubePlayer = ({ videoId, sendData, playerData, isConnected, playerId = 'youtube-player' }: YouTubePlayerProps) => {
  const { toast } = useToast();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track the last received remote command to prevent echoing it back
  const lastReceived = useRef<{ event: string, time: number, timestamp: number } | null>(null);

  // Refs to avoid stale closures in YouTube event handlers
  const isConnectedRef = useRef(isConnected);
  const sendDataRef = useRef(sendData);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    sendDataRef.current = sendData;
  }, [sendData]);

  const [isApiReady, setIsApiReady] = useState(!!(window.YT && window.YT.Player));
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // Load YouTube IFrame API script
  useEffect(() => {
    if (isApiReady) return;

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

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
    if (!isConnectedRef.current) return;

    const player = event.target;
    if (typeof player.getCurrentTime !== 'function') return;

    const time = player.getCurrentTime();
    const eventStr = event.data === 1 ? 'play' : event.data === 2 ? 'pause' : null;

    if (!eventStr) return; // Ignore buffering, unstarted, ended etc.

    // Echo cancellation: If this state change matches what the remote peer just ordered
    // us to do within the last 2 seconds, do NOT broadcast it back.
    if (lastReceived.current) {
      const timeSinceReceive = Date.now() - lastReceived.current.timestamp;
      const sameState = lastReceived.current.event === eventStr;

      const timeDiff = Math.abs(time - lastReceived.current.time);

      if (timeSinceReceive < 2500 && sameState) {
        if ((eventStr === 'pause' && timeDiff < 2.0) || (eventStr === 'play' && timeDiff < 4.0)) {
          return;
        }
      }
    }

    sendDataRef.current({
      type: 'player_state',
      payload: {
        event: eventStr,
        currentTime: time,
      },
    });
  };

  // Initialize player
  useEffect(() => {
    if (!isApiReady || !videoId || !containerRef.current) return;

    setIsPlayerReady(false);

    // React 18 Strict Mode resilient setup:
    // Create a pristine div for the YT API to replace with an iframe.
    // If it gets destroyed, the wrapper container is still managed by React!
    const wrapper = containerRef.current;
    wrapper.innerHTML = '';
    const targetDiv = document.createElement('div');
    targetDiv.className = "w-full h-full rounded-xl";
    wrapper.appendChild(targetDiv);

    const player = new window.YT.Player(targetDiv, {
      videoId,
      playerVars: {
        'playsinline': 1,
        'autoplay': 0,
        'controls': 1,
        'rel': 0,
        'modestbranding': 1,
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange,
      },
    });
    playerRef.current = player;

    return () => {
      if (playerRef.current) {
        if (typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
        playerRef.current = null;
      }
    };
  }, [isApiReady, videoId]);
  useEffect(() => {
    if (!playerRef.current || !isPlayerReady || !playerData || !isConnected) return;

    // Handle Sync Request from Peer (Late Joiner)
    if (playerData.type === 'request_sync') {
      const player = playerRef.current;
      if (typeof player.getCurrentTime === 'function' && typeof player.getPlayerState === 'function') {
        const currentTime = player.getCurrentTime();
        const state = player.getPlayerState();
        // Only broadcast if explicitly playing or paused
        if (state === 1 || state === 2) {
          sendData({
            type: 'player_state',
            payload: {
              event: state === 1 ? 'play' : 'pause',
              currentTime: currentTime,
            },
          });
        }
      }
      return;
    }

    // Handle Player State Update from Peer
    if (playerData.type === 'player_state') {
      const { event, currentTime } = playerData.payload;
      const player = playerRef.current;

      if (typeof player.getCurrentTime !== 'function' || typeof player.getPlayerState !== 'function') return;

      const clientTime = player.getCurrentTime();
      const clientState = player.getPlayerState();

      // Update our echo cancellation record
      lastReceived.current = { event, time: currentTime, timestamp: Date.now() };

      if (event === 'play') {
        if (Math.abs(clientTime - currentTime) > 1.5) {
          player.seekTo(currentTime, true);
        }
        if (clientState !== 1) {
          player.playVideo();
          toast({
            title: '▶️ Playing',
            description: 'Peer resumed the video',
            duration: 2000,
          });
        }
      } else if (event === 'pause') {
        if (clientState !== 2) {
          player.pauseVideo();
          toast({
            title: '⏸️ Paused',
            description: 'Peer paused the video',
            duration: 2000,
          });
        }
        if (Math.abs(clientTime - currentTime) > 1.5) {
          player.seekTo(currentTime, true);
        }
      }
    }
  }, [playerData, isConnected, isPlayerReady, sendData]);

  // Request sync when player becomes ready and connected
  useEffect(() => {
    if (isConnected && isPlayerReady) {
      // Small delay to ensure everything is stable
      const timer = setTimeout(() => {
        sendData({ type: 'request_sync', payload: null });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isPlayerReady, sendData]);

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
      {/* 
        This div is managed by React. We never let YouTube API touch it.
        We dynamically create a child div inside it for YouTube to consume.
      */}
      <div ref={containerRef} className="w-full h-full rounded-xl" />

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
