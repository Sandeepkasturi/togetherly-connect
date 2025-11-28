import { useOutletContext, useNavigate } from 'react-router-dom';
import { AppContextType } from '@/layouts/AppLayout';
import { motion } from 'framer-motion';
import EnhancedVideoPlayer from '@/components/EnhancedVideoPlayer';
import { ArrowLeft, Users, MessageCircle, Search, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import ChatNotification from '@/components/ChatNotification';
import YouTubeSearch from '@/components/YouTubeSearch';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Chat from "@/components/Chat";
import PeerConnection from '@/components/PeerConnection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const TheaterPage = () => {
  const context = useOutletContext<AppContextType>();
  const navigate = useNavigate();
  const [notificationMessage, setNotificationMessage] = useState<any>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [unreadCount, setUnreadCount] = useState(0);

  // Redirect back if no video is selected
  useEffect(() => {
    if (!context.selectedVideoId) {
      navigate('/watch');
    }
  }, [context.selectedVideoId, navigate]);

  // Show notification for new messages when video is playing
  useEffect(() => {
    const lastMessage = context.messages[context.messages.length - 1];
    if (lastMessage && lastMessage.sender === 'them') {
      if (activeTab !== 'chat') {
        setUnreadCount(prev => prev + 1);
        if (isVideoPlaying) {
          setNotificationMessage(lastMessage);
        }
      }
    }
  }, [context.messages, isVideoPlaying, activeTab]);

  // Reset unread count when switching to chat tab
  useEffect(() => {
    if (activeTab === 'chat') {
      setUnreadCount(0);
      setNotificationMessage(null);
    }
  }, [activeTab]);

  const handleOpenChat = () => {
    setActiveTab('chat');
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

  const handleBack = () => {
    navigate('/watch');
  };

  if (!context.selectedVideoId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Chat Notification (Global) */}
      <ChatNotification
        message={notificationMessage}
        onDismiss={handleDismissNotification}
        onOpenChat={handleOpenChat}
        onQuickReply={handleQuickReply}
      />

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-screen">
        {/* Sticky Video Player */}
        <div className="sticky top-0 z-50 bg-black w-full">
          <div className="relative aspect-video w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="absolute top-2 left-2 z-50 text-white bg-black/50 hover:bg-black/70 rounded-full h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <EnhancedVideoPlayer
              videoId={context.selectedVideoId}
              sendData={context.sendData}
              playerData={context.playerSyncData}
              isConnected={context.isConnected}
              onPlayingStateChange={handleVideoPlayingChange}
              playerId="youtube-player-mobile"
            />
          </div>
        </div>

        {/* Tabbed Content Area */}
        <div className="flex-1 bg-background overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-muted/20 p-1 rounded-none border-b border-white/10">
              <TabsTrigger value="chat" className="relative data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="discover" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Search className="h-4 w-4 mr-2" />
                Discover
              </TabsTrigger>
              <TabsTrigger value="connection" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <LinkIcon className="h-4 w-4 mr-2" />
                Connect
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 mt-0 h-full overflow-hidden">
              <Chat
                messages={context.messages}
                sendMessage={context.sendMessage}
                isConnected={context.isConnected}
                handleSendReaction={context.handleSendReaction}
                handleSendFile={context.handleSendFile}
                handleSendVoice={context.handleSendVoice}
                handleEditMessage={context.handleEditMessage}
                handleDeleteMessage={context.handleDeleteMessage}
                clearChat={context.clearChat}
              />
            </TabsContent>

            <TabsContent value="discover" className="flex-1 mt-0 overflow-y-auto p-4 pb-20">
              <YouTubeSearch
                onVideoSelect={context.handleVideoSelect}
                isConnected={context.isConnected}
              />
            </TabsContent>

            <TabsContent value="connection" className="flex-1 mt-0 overflow-y-auto p-4 pb-20">
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
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Desktop Layout (Preserved) */}
      <div className="hidden lg:flex flex-col min-h-screen">
        {/* Minimal Top Bar - Auto-hide on scroll */}
        <motion.div
          initial={{ y: 0 }}
          className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4 pointer-events-none"
        >
          <div className="flex items-center justify-between pointer-events-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              {context.isConnected && (
                <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 px-3 py-1.5 rounded-full">
                  <Users className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-300 font-medium">
                    {context.remoteNickname || 'Friend'}
                  </span>
                </div>
              )}

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 relative">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Chat
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 border-l border-white/10 bg-black/90 backdrop-blur-xl">
                  <div className="h-full pt-6">
                    <Chat
                      messages={context.messages}
                      sendMessage={context.sendMessage}
                      isConnected={context.isConnected}
                      handleSendReaction={context.handleSendReaction}
                      handleSendFile={context.handleSendFile}
                      handleSendVoice={context.handleSendVoice}
                      handleEditMessage={context.handleEditMessage}
                      handleDeleteMessage={context.handleDeleteMessage}
                      clearChat={context.clearChat}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </motion.div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-screen flex flex-col">
            {/* Video Player Section */}
            <div className="flex-none h-[50vh] md:h-[80vh] bg-black flex items-center justify-center relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full max-w-7xl mx-auto"
              >
                <EnhancedVideoPlayer
                  videoId={context.selectedVideoId}
                  sendData={context.sendData}
                  playerData={context.playerSyncData}
                  isConnected={context.isConnected}
                  onPlayingStateChange={handleVideoPlayingChange}
                  playerId="youtube-player-desktop"
                />
              </motion.div>
            </div>

            {/* Discovery Section */}
            <div className="flex-1 bg-background/95 backdrop-blur-xl p-6 md:p-8">
              <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <h2 className="text-2xl font-bold tracking-tight">Discover More</h2>
                </div>
                <YouTubeSearch
                  onVideoSelect={context.handleVideoSelect}
                  isConnected={context.isConnected}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheaterPage;
