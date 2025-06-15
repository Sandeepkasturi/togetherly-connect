
import { useOutletContext } from 'react-router-dom';
import PeerConnection from '@/components/PeerConnection';
import Chat from '@/components/Chat';
import YouTubePlayer from '@/components/YouTubePlayer';
import YouTubeSearch from '@/components/YouTubeSearch';
import { motion } from 'framer-motion';
import { AppContextType } from '@/layouts/AppLayout';

const AppPage = () => {
  const context = useOutletContext<AppContextType>();

  if (!context) {
    // This can happen briefly while the context is loading.
    // You might want to show a loader here.
    return null; 
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 xl:gap-8">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col gap-4 lg:gap-6"
      >
        <YouTubePlayer 
          videoId={context.selectedVideoId} 
          sendData={context.sendData}
          playerData={context.playerSyncData}
          isConnected={context.isConnected}
        />
        <YouTubeSearch onVideoSelect={context.handleVideoSelect} isConnected={context.isConnected} />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col gap-4 lg:gap-6"
      >
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
        <Chat 
          messages={context.messages} 
          sendMessage={context.sendMessage} 
          isConnected={context.isConnected} 
          handleSendReaction={context.handleSendReaction}
          handleSendFile={context.handleSendFile}
        />
      </motion.div>
    </div>
  );
};

export default AppPage;
