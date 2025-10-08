import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RefreshCw, Home, Search, Monitor, MonitorOff } from 'lucide-react';
import { DataType } from '@/hooks/usePeer';

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
  const [url, setUrl] = useState('https://www.google.com');
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle incoming browser sync data
  useEffect(() => {
    if (browserData?.type === 'browser_sync') {
      const { url: incomingUrl, action, scrollPosition } = browserData.payload;
      
      if (action === 'navigate' && incomingUrl !== currentUrl) {
        setCurrentUrl(incomingUrl);
        setUrl(incomingUrl);
      }
    }
  }, [browserData, currentUrl]);

  // Display remote screen share
  useEffect(() => {
    if (videoRef.current && remoteScreenStream) {
      videoRef.current.srcObject = remoteScreenStream;
    }
  }, [remoteScreenStream]);

  const handleNavigate = () => {
    let finalUrl = url;
    
    // Add https:// if no protocol is specified
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // If it looks like a search query, use Google search
      if (url.includes(' ') || !url.includes('.')) {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      } else {
        finalUrl = `https://${url}`;
      }
    }
    
    setCurrentUrl(finalUrl);
    
    // Send navigation to peer
    if (isConnected) {
      sendData({
        type: 'browser_sync',
        payload: {
          url: finalUrl,
          action: 'navigate'
        }
      });
    }
  };

  const handleBack = () => {
    // Note: iframe history navigation is restricted for security reasons
    // This is a simplified implementation
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
  };

  const handleHome = () => {
    const homeUrl = 'https://www.google.com';
    setUrl(homeUrl);
    setCurrentUrl(homeUrl);
    if (isConnected) {
      sendData({
        type: 'browser_sync',
        payload: { url: homeUrl, action: 'navigate' }
      });
    }
  };

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-3 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHome}
            className="text-white hover:bg-white/10"
          >
            <Home className="h-4 w-4" />
          </Button>
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
              placeholder="Search or enter URL..."
              className="bg-black/30 border-white/20 text-white placeholder:text-gray-400"
            />
            <Button
              onClick={handleNavigate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare}
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
        </div>
        {isConnected && (
          <p className="text-xs text-green-400">🌐 Sync browsing enabled - Your navigation is shared with your friend</p>
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
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              🔴 Viewing Shared Screen
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={currentUrl}
            className="w-full h-full border-0"
            title="Web Browser"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}
      </div>

      {isScreenSharing && (
        <div className="bg-green-600/20 border-t border-green-500/30 p-2 text-center">
          <p className="text-sm text-green-400">📡 Your screen is being shared</p>
        </div>
      )}
    </Card>
  );
};

export default WebBrowser;
