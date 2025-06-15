
import { useOutletContext } from 'react-router-dom';
import YouTubePlayer from '@/components/YouTubePlayer';
import YouTubeSearch from '@/components/YouTubeSearch';
import { AppContextType } from '@/layouts/AppLayout';
import { motion } from 'framer-motion';
import PeerConnection from '@/components/PeerConnection';
import Chat from '@/components/Chat';

const WatchPage = () => {
  const context = useOutletContext<AppContextType>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-blue-500 bg-clip-text text-transparent mb-3">
            Watch Together
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Share videos, connect with friends, and enjoy synchronized viewing experiences
          </p>
        </motion.div>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left Column: Player and Search */}
          <div className="w-full xl:w-2/3 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden">
                <YouTubePlayer 
                  videoId={context.selectedVideoId} 
                  sendData={context.sendData}
                  playerData={context.playerSyncData}
                  isConnected={context.isConnected}
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-xl blur opacity-10"></div>
              <div className="relative">
                <YouTubeSearch onVideoSelect={context.handleVideoSelect} isConnected={context.isConnected} />
              </div>
            </motion.div>
          </div>
          
          {/* Right Column: Connection and Chat */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="w-full xl:w-1/3 flex flex-col gap-8"
          >
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-xl blur opacity-10"></div>
              <div className="relative">
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
              </div>
            </div>
            
            <div className="flex-grow min-h-[500px] xl:min-h-0 relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-green-600 rounded-xl blur opacity-10"></div>
              <div className="relative h-full">
                <Chat 
                  messages={context.messages} 
                  sendMessage={context.sendMessage} 
                  isConnected={context.isConnected} 
                  handleSendReaction={context.handleSendReaction}
                  handleSendFile={context.handleSendFile}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Background Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
