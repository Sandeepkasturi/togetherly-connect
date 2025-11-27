import { useOutletContext, useNavigate } from 'react-router-dom';
import { AppContextType } from '@/layouts/AppLayout';
import { motion } from 'framer-motion';
import EnhancedVideoPlayer from '@/components/EnhancedVideoPlayer';
import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import ChatNotification from '@/components/ChatNotification';

const TheaterPage = () => {
  const context = useOutletContext<AppContextType>();
  const navigate = useNavigate();
  const [notificationMessage, setNotificationMessage] = useState<any>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Redirect back if no video is selected
  useEffect(() => {
    if (!context.selectedVideoId) {
      navigate('/watch');
    }
  }, [context.selectedVideoId, navigate]);

  // Show notification for new messages when video is playing
  useEffect(() => {
    const lastMessage = context.messages[context.messages.length - 1];
    if (lastMessage && lastMessage.sender === 'them' && isVideoPlaying) {
      setNotificationMessage(lastMessage);
    }
  }, [context.messages, isVideoPlaying]);

  const handleOpenChat = () => {
    navigate('/chat');
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
      {/* Chat Notification */}
      <ChatNotification
        message={notificationMessage}
        onDismiss={handleDismissNotification}
        onOpenChat={handleOpenChat}
        onQuickReply={handleQuickReply}
      />

      {/* Minimal Top Bar - Auto-hide on scroll */}
      <motion.div
        initial={{ y: 0 }}
        className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4"
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          
          {context.isConnected && (
            <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 px-3 py-1.5 rounded-full">
              <Users className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-300 font-medium">
                {context.remoteNickname || 'Friend'}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Full-Screen Video Player */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          <EnhancedVideoPlayer
            videoId={context.selectedVideoId}
            sendData={context.sendData}
            playerData={context.playerSyncData}
            isConnected={context.isConnected}
            onPlayingStateChange={handleVideoPlayingChange}
          />
        </motion.div>
      </div>

      {/* Bottom Gradient Overlay for better readability */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
    </div>
  );
};

export default TheaterPage;
