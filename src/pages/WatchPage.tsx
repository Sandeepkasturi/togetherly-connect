
import { useOutletContext } from 'react-router-dom';
import YouTubeSearch from '@/components/YouTubeSearch';
import { AppContextType } from '@/layouts/AppLayout';
import { motion } from 'framer-motion';
import ConnectionWizard from '@/components/ConnectionWizard';
import { Tv } from 'lucide-react';
import { useState } from 'react';
import EnhancedVideoPlayer from '@/components/EnhancedVideoPlayer';

const WatchPage = () => {
  const context = useOutletContext<AppContextType>();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleVideoPlayingChange = (playing: boolean) => {
    setIsVideoPlaying(playing);
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Mobile Simple Layout */}
      <div className="lg:hidden">
        <div className="space-y-4 pb-20">
          {/* Connection Wizard */}
          <section className="px-4 pt-4">
            <div className="bg-card/30 backdrop-blur-xl rounded-2xl border border-border/30 p-4">
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
          </section>

          {/* Video Player */}
          <section className="px-4">
            {context.selectedVideoId ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl overflow-hidden shadow-2xl"
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
              <div className="aspect-video w-full bg-muted/20 rounded-xl flex items-center justify-center border border-border/20">
                <div className="text-center p-4">
                  <Tv className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Select a video to start watching</p>
                </div>
              </div>
            )}
          </section>

          {/* Search */}
          <section className="px-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Discover</p>
                <h2 className="text-lg font-semibold text-foreground">Watch videos together</h2>
              </div>
              <YouTubeSearch
                onVideoSelect={context.handleVideoSelect}
                isConnected={context.isConnected}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />

          <div className="relative z-20 container mx-auto px-4 py-8 min-h-screen flex items-center">
            <div className="grid grid-cols-3 gap-8 w-full">
              <div className="col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="rounded-xl overflow-hidden border border-border/20 shadow-2xl">
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
                <div className="bg-card/30 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
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

        {/* Desktop YouTube Search */}
        <div className="relative z-10 bg-black pt-8">
          <div className="container mx-auto px-4">
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
