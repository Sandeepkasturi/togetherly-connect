import { motion } from 'framer-motion';
import WebBrowser from '@/components/WebBrowser';
import { useOutletContext } from 'react-router-dom';
import { AppContextType } from '@/layouts/AppLayout';

const BrowserPage = () => {
  const context = useOutletContext<AppContextType>();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-6"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gradient-primary">Web Browser</h1>
        <p className="text-muted-foreground mt-2">Browse the web together with synchronized navigation and screen sharing</p>
      </div>

      <WebBrowser
        sendData={context.sendData}
        browserData={context.browserSyncData}
        isConnected={context.isConnected}
        isScreenSharing={context.isScreenSharing}
        onStartScreenShare={context.startScreenShare}
        onStopScreenShare={context.stopScreenShare}
        remoteScreenStream={context.remoteScreenStream}
      />
    </motion.div>
  );
};

export default BrowserPage;
