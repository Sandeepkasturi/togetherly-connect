
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
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Player and Search */}
        <div className="w-full lg:w-2/3 flex flex-col gap-8">
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
        
        {/* Right Column: Connection and Chat */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full lg:w-1/3 flex flex-col gap-8"
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
          <div className="flex-grow min-h-[400px] lg:min-h-0">
            <Chat 
                messages={context.messages} 
                sendMessage={context.sendMessage} 
                isConnected={context.isConnected} 
                handleSendReaction={context.handleSendReaction}
                handleSendFile={context.handleSendFile}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WatchPage;
