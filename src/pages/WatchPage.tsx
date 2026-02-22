import { useOutletContext } from 'react-router-dom';
import YouTubeSearch from '@/components/YouTubeSearch';
import { AppContextType } from '@/layouts/AppLayout';
import { motion } from 'framer-motion';
import ConnectionWizard from '@/components/ConnectionWizard';
import { Tv, Search, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import EnhancedVideoPlayer from '@/components/EnhancedVideoPlayer';
import { cn } from '@/lib/utils';

const WatchPage = () => {
  const context = useOutletContext<AppContextType>();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const handleVideoPlayingChange = (playing: boolean) => {
    setIsVideoPlaying(playing);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="space-y-0 pb-24">
          {/* Compact Connection Status Bar */}
          <button
            onClick={() => setShowWizard(!showWizard)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 transition-colors",
            context.isConnected
                ? "bg-[hsl(var(--chat-online)/0.05)] border-b border-[hsl(var(--chat-online)/0.1)]"
                : "bg-primary/5 border-b border-primary/10"
            )}
          >
            <div className="flex items-center gap-2.5">
              {context.isConnected ? (
                <Wifi className="h-4 w-4 text-[hsl(var(--chat-online))]" />
              ) : (
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                {context.isConnected
                  ? `Connected with ${context.remoteNickname || 'peer'}`
                  : 'Tap to connect with a friend'}
              </span>
            </div>
            {showWizard ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {/* Expandable Connection Wizard */}
          {showWizard && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-border/30 bg-card/30 backdrop-blur-xl px-4 py-4"
            >
              <ConnectionWizard
                peerId={context.peerId}
                connectToPeer={context.connectToPeer}
                isConnected={context.isConnected}
                myNickname={context.myNickname}
                remoteNickname={context.remoteNickname}
                sendData={context.sendData}
                startCall={context.startCall}
                isCallActive={context.isCallActive}
                connectionState={context.connectionState}
                onManualReconnect={context.onManualReconnect}
              />
            </motion.div>
          )}

          {/* Video Player */}
          <section className="px-4 pt-4">
            {context.selectedVideoId ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/5"
              >
                <EnhancedVideoPlayer
                  videoId={context.selectedVideoId}
                  sendData={context.sendData}
                  playerData={context.playerSyncData}
                  isConnected={context.isConnected}
                  onPlayingStateChange={handleVideoPlayingChange}
                  playerId="youtube-player-watch-mobile"
                />
              </motion.div>
            ) : (
              <div className="aspect-video w-full rounded-2xl overflow-hidden relative border border-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <Tv className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">No video selected</p>
                  <p className="text-xs text-muted-foreground text-center">Search below to find something to watch together</p>
                </div>
              </div>
            )}
          </section>

          {/* Search */}
          <section className="px-4 pt-5">
            <YouTubeSearch
              onVideoSelect={context.handleVideoSelect}
              isConnected={context.isConnected}
            />
          </section>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

          <div className="relative z-20 container mx-auto px-6 py-8 min-h-screen flex items-center">
            <div className="grid grid-cols-3 gap-8 w-full">
              <div className="col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="rounded-2xl overflow-hidden border border-white/5 shadow-2xl shadow-black/40">
                    <EnhancedVideoPlayer
                      videoId={context.selectedVideoId}
                      sendData={context.sendData}
                      playerData={context.playerSyncData}
                      isConnected={context.isConnected}
                      onPlayingStateChange={handleVideoPlayingChange}
                      playerId="youtube-player-watch-desktop"
                    />
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-6"
              >
                <div className="glass-panel p-6">
                  <ConnectionWizard
                    peerId={context.peerId}
                    connectToPeer={context.connectToPeer}
                    isConnected={context.isConnected}
                    myNickname={context.myNickname}
                    remoteNickname={context.remoteNickname}
                    sendData={context.sendData}
                    startCall={context.startCall}
                    isCallActive={context.isCallActive}
                    connectionState={context.connectionState}
                    onManualReconnect={context.onManualReconnect}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="relative z-10 bg-background pt-8 pb-8">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <YouTubeSearch
                onVideoSelect={context.handleVideoSelect}
                isConnected={context.isConnected}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
