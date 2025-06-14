
import { useOutletContext } from 'react-router-dom';
import YouTubePlayer from '@/components/YouTubePlayer';
import YouTubeSearch from '@/components/YouTubeSearch';
import ChatSheet from '@/components/ChatSheet';
import { AppContextType } from '@/layouts/AppLayout';
import { motion } from 'framer-motion';

const WatchPage = () => {
  const context = useOutletContext<AppContextType>();

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <YouTubePlayer 
            videoId={context.selectedVideoId} 
            sendData={context.sendData}
            playerData={context.playerSyncData}
            isConnected={context.isConnected}
          />
        </motion.div>
        
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <YouTubeSearch onVideoSelect={context.handleVideoSelect} isConnected={context.isConnected} />
        </motion.div>
      </div>
      <ChatSheet {...context} />
    </div>
  );
};

export default WatchPage;
