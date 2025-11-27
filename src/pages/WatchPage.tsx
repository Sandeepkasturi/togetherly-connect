
import { useOutletContext } from 'react-router-dom';
import YouTubeSearch from '@/components/YouTubeSearch';
import { AppContextType } from '@/layouts/AppLayout';
import { motion } from 'framer-motion';
import PeerConnection from '@/components/PeerConnection';
import { Play, Info, Users, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import EnhancedVideoPlayer from '@/components/EnhancedVideoPlayer';
import ChatNotification from '@/components/ChatNotification';

const WatchPage = () => {
  const context = useOutletContext<AppContextType>();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<any>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Show notification for new messages when video is playing or chat is closed
  useEffect(() => {
    const lastMessage = context.messages[context.messages.length - 1];
    if (lastMessage && lastMessage.sender === 'them' && (isVideoPlaying || !isChatOpen)) {
      setNotificationMessage(lastMessage);
    }
  }, [context.messages, isVideoPlaying, isChatOpen]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
    setNotificationMessage(null);
  };

  const handleDismissNotification = () => {
    setNotificationMessage(null);
  };

  const handleQuickReply = (replyText: string) => {
    context.sendMessage(replyText);
    setNotificationMessage(null);
  };

  const handleVideoPlayingChange = (playing: boolean) => {
    setIsVideoPlaying(playing);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Chat Notification */}
      <ChatNotification
        message={notificationMessage}
        onDismiss={handleDismissNotification}
        onOpenChat={handleOpenChat}
        onQuickReply={handleQuickReply}
      />

      {/* Mobile Simple Layout */}
      <div className="lg:hidden">
        {/* Mobile Video Player - Full Theater Experience */}
        <div className="space-y-4">
          {context.selectedVideoId && (
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
              />
            </motion.div>
          )}

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border-white/10 p-4">
            <PeerConnection
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
          </Card>

          {/* Discover content section */}
          <div className="space-y-3 pb-20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Discover</p>
                <h2 className="text-lg font-semibold">Watch videos together</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white/80"
              >
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
            </div>
            <YouTubeSearch
              onVideoSelect={context.handleVideoSelect}
              isConnected={context.isConnected}
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="relative min-h-screen overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/80 z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-pink-900/30" />

          {/* Desktop Content */}
          <div className="relative z-20 container mx-auto px-4 py-8 min-h-screen flex items-center">
            <div className="grid grid-cols-3 gap-8 w-full">
              {/* Left side - Hero and Player */}
              <div className="col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Tv className="h-8 w-8 text-red-500" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                      TOGETHERLY
                    </span>
                  </div>

                  <h1 className="text-6xl font-bold leading-tight">
                    Watch Together,
                    <br />
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                      Share the Moment
                    </span>
                  </h1>

                  <p className="text-xl text-gray-300 max-w-2xl">
                    Connect with friends and enjoy synchronized viewing experiences.
                    From blockbuster movies to trending videos, watch everything together in real-time.
                  </p>

                  <div className="flex items-center gap-4 pt-4">
                    <Button
                      size="lg"
                      className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg font-semibold"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Start Watching
                    </Button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="rounded-xl overflow-hidden border border-white/20 shadow-2xl">
                    <EnhancedVideoPlayer
                      videoId={context.selectedVideoId}
                      sendData={context.sendData}
                      playerData={context.playerSyncData}
                      isConnected={context.isConnected}
                      onPlayingStateChange={handleVideoPlayingChange}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Right side - Connection and Chat */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-6"
              >
                <Card className="bg-black/40 backdrop-blur-xl border-white/20 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="h-6 w-6 text-purple-400" />
                    <h3 className="text-xl font-semibold">Connection</h3>
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
                    connectionState={context.connectionState}
                    onManualReconnect={context.onManualReconnect}
                  />
                </Card>

                <Card className="bg-black/40 backdrop-blur-xl border-white/20 h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-2 px-4">
                    <p className="text-sm text-gray-200 font-medium">Chat in a dedicated space</p>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto">
                      Open the <span className="font-semibold">Chat</span> tab from the bottom navigation to send messages,
                      share files, and react while you keep watching here.
                    </p>
                  </div>
                </Card>
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
