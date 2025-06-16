
import { useOutletContext } from 'react-router-dom';
import YouTubePlayer from '@/components/YouTubePlayer';
import YouTubeSearch from '@/components/YouTubeSearch';
import { AppContextType } from '@/layouts/AppLayout';
import { motion } from 'framer-motion';
import PeerConnection from '@/components/PeerConnection';
import Chat from '@/components/Chat';
import { PlaylistSidebar } from '@/components/PlaylistSidebar';
import { Play, Info, Users, Tv, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

const WatchPage = () => {
  const context = useOutletContext<AppContextType>();
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section - Mobile Optimized */}
      <div className="relative min-h-screen lg:h-[70vh] overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/80 z-10" />
        
        {/* Hero background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-pink-900/30" />
        
        {/* Hero content - Mobile First Layout */}
        <div className="relative z-20 container mx-auto px-4 py-6 lg:py-0 min-h-screen lg:h-full flex items-center">
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8 w-full items-stretch lg:items-center">
            {/* Top section - Hero text and player (Mobile: stacked, Desktop: left side) */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-3 lg:space-y-4"
              >
                <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-4">
                  <Tv className="h-6 w-6 lg:h-8 lg:w-8 text-red-500" />
                  <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                    TOGETHERLY
                  </span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold leading-tight">
                  Watch Together,
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                    Share the Moment
                  </span>
                </h1>
                
                <p className="text-sm sm:text-base lg:text-xl text-gray-300 max-w-2xl">
                  Connect with friends and enjoy synchronized viewing experiences. 
                  From blockbuster movies to trending videos, watch everything together in real-time.
                </p>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4 pt-2 lg:pt-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-black hover:bg-gray-200 px-6 lg:px-8 py-2.5 lg:py-3 text-base lg:text-lg font-semibold w-full sm:w-auto"
                  >
                    <Play className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                    Start Watching
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white text-white hover:bg-white/10 px-6 lg:px-8 py-2.5 lg:py-3 text-base lg:text-lg w-full sm:w-auto"
                    onClick={() => setIsPlaylistOpen(true)}
                  >
                    <ListMusic className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                    My Playlists
                  </Button>
                </div>
              </motion.div>

              {/* Featured Player - Mobile Optimized */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative"
              >
                <div className="relative rounded-lg lg:rounded-xl overflow-hidden border border-white/20 shadow-2xl">
                  <YouTubePlayer 
                    videoId={context.selectedVideoId} 
                    sendData={context.sendData}
                    playerData={context.playerSyncData}
                    isConnected={context.isConnected}
                  />
                </div>
              </motion.div>
            </div>

            {/* Bottom/Right section - Connection and Chat (Mobile: bottom, Desktop: right side) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-4 lg:space-y-6 order-1 lg:order-2"
            >
              {/* Connection Status Card */}
              <Card className="bg-black/40 backdrop-blur-xl border-white/20 p-4 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                  <Users className="h-5 w-5 lg:h-6 lg:w-6 text-purple-400" />
                  <h3 className="text-lg lg:text-xl font-semibold">Connection</h3>
                </div>
                <PeerConnection 
                  peerId={context.peerId}
                  connectToPeer={context.connectToPeer}
                  isConnected={context.isConnected}
                  myNickname={context.myNickname}
                  remoteNickname={context.remoteNickname}
                  sendData={context.sendData}
                  startCall={context.startCall}
                  isCallActive={context.isCallActive}
                />
              </Card>

              {/* Chat Card - Mobile Optimized Height */}
              <Card className="bg-black/40 backdrop-blur-xl border-white/20 h-[300px] lg:h-[400px]">
                <Chat 
                  messages={context.messages} 
                  sendMessage={context.sendMessage} 
                  isConnected={context.isConnected} 
                  handleSendReaction={context.handleSendReaction}
                  handleSendFile={context.handleSendFile}
                />
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Rows Section */}
      <div className="relative z-10 bg-black pt-4 lg:pt-8">
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

      {/* Playlist Sidebar */}
      <PlaylistSidebar
        isOpen={isPlaylistOpen}
        onOpenChange={setIsPlaylistOpen}
        onVideoSelect={context.handleVideoSelect}
        currentVideoId={context.selectedVideoId}
      />

      {/* Ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 lg:w-96 lg:h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 lg:w-96 lg:h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 left-1/2 w-32 h-32 lg:w-64 lg:h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
    </div>
  );
};

export default WatchPage;
