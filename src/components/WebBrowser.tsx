import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Home, Monitor, MonitorOff } from 'lucide-react';
import { DataType } from '@/hooks/usePeer';
import { toast } from 'sonner';

interface WebBrowserProps {
  sendData: (data: DataType) => void;
  browserData?: DataType | null;
  isConnected: boolean;
  isScreenSharing: boolean;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
  remoteScreenStream?: MediaStream | null;
}

const WebBrowser = ({ 
  sendData, 
  browserData, 
  isConnected,
  isScreenSharing,
  onStartScreenShare,
  onStopScreenShare,
  remoteScreenStream
}: WebBrowserProps) => {
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPromptedShare, setHasPromptedShare] = useState(false);

  // Auto-prompt screen sharing when connected
  useEffect(() => {
    if (isConnected && !isScreenSharing && !hasPromptedShare && !remoteScreenStream) {
      const timer = setTimeout(() => {
        toast.info('Start screen sharing to broadcast your browser to your peer', {
          action: {
            label: 'Share Screen',
            onClick: () => {
              onStartScreenShare();
              setHasPromptedShare(true);
            }
          },
          duration: 10000
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isScreenSharing, hasPromptedShare, remoteScreenStream, onStartScreenShare]);

  // Handle incoming browser sync data
  useEffect(() => {
    if (browserData?.type === 'browser_sync') {
      const { url: incomingUrl } = browserData.payload;
      
      if (incomingUrl && incomingUrl !== currentUrl) {
        setCurrentUrl(incomingUrl);
      }
    }
  }, [browserData, currentUrl]);

  // Display remote screen share
  useEffect(() => {
    if (videoRef.current && remoteScreenStream) {
      videoRef.current.srcObject = remoteScreenStream;
    }
  }, [remoteScreenStream]);

  const handleNavigate = (url: string) => {
    setCurrentUrl(url);
    
    // Send navigation to peer
    if (isConnected && isScreenSharing) {
      sendData({
        type: 'browser_sync',
        payload: {
          url: url,
          action: 'navigate'
        }
      });
    }
  };

  const handleRefresh = () => {
    handleNavigate(currentUrl);
  };

  const handleHome = () => {
    handleNavigate('https://www.google.com');
  };

  const handleScreenShare = () => {
    if (isScreenSharing) {
      onStopScreenShare();
      setHasPromptedShare(false);
    } else {
      onStartScreenShare();
      setHasPromptedShare(true);
    }
  };

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-3 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-white hover:bg-white/10"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHome}
            className="text-white hover:bg-white/10"
            title="Home"
          >
            <Home className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="gcse-search"></div>
          </div>
          {isConnected && (
            <Button
              onClick={handleScreenShare}
              className={isScreenSharing ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              {isScreenSharing ? (
                <>
                  <MonitorOff className="h-4 w-4 mr-2" />
                  Stop Sharing
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4 mr-2" />
                  Share Screen
                </>
              )}
            </Button>
          )}
        </div>
        {isConnected && isScreenSharing && (
          <p className="text-xs text-green-400">📡 Broadcasting your screen to peer - They see everything you do</p>
        )}
        {isConnected && remoteScreenStream && (
          <p className="text-xs text-blue-400">👀 Viewing peer's screen in real-time</p>
        )}
        {isConnected && !isScreenSharing && !remoteScreenStream && (
          <p className="text-xs text-yellow-400">💡 Start screen sharing to broadcast your browser activity</p>
        )}
      </div>

      <div className="relative" style={{ height: '600px' }}>
        {remoteScreenStream ? (
          <div className="absolute inset-0 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
              🔴 LIVE - Viewing Peer's Screen
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-black/20 flex items-center justify-center">
            <div className="gcse-search"></div>
          </div>
        )}
      </div>

      {isScreenSharing && (
        <div className="bg-green-600/20 border-t border-green-500/30 p-2 text-center animate-pulse">
          <p className="text-sm text-green-400">📡 YOUR SCREEN IS LIVE - Peer is watching</p>
        </div>
      )}
    </Card>
  );
};

export default WebBrowser;
