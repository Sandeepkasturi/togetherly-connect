import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, MonitorOff, ExternalLink, Info } from 'lucide-react';
import { DataType } from '@/hooks/usePeer';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPromptedShare, setHasPromptedShare] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Auto-prompt screen sharing when connected
  useEffect(() => {
    if (isConnected && !isScreenSharing && !hasPromptedShare && !remoteScreenStream) {
      const timer = setTimeout(() => {
        toast.info('Share your screen to broadcast your browser', {
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

  // Display remote screen share
  useEffect(() => {
    if (videoRef.current && remoteScreenStream) {
      videoRef.current.srcObject = remoteScreenStream;
    }
  }, [remoteScreenStream]);

  // Load Google Custom Search after component mounts
  useEffect(() => {
    // Trigger Google CSE to render
    const windowWithGoogle = window as any;
    if (windowWithGoogle.google && windowWithGoogle.google.search) {
      windowWithGoogle.google.search.cse.element.render();
    }
  }, []);

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      onStopScreenShare();
      setHasPromptedShare(false);
      toast.success('Screen sharing stopped');
    } else {
      try {
        await onStartScreenShare();
        setHasPromptedShare(true);
        toast.success('Screen sharing started! Your peer can now see your browser.');
      } catch (error) {
        toast.error('Failed to start screen sharing. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Instructions Card */}
      {!remoteScreenStream && (
        <Alert className="bg-blue-500/10 border-blue-500/30">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-sm text-blue-300">
            <strong>How it works:</strong> Search using Google below. Results open in new tabs. 
            {isConnected ? ' Click "Share Screen" to broadcast your browser to your peer!' : ' Connect to a peer first to enable screen sharing.'}
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-black/40 backdrop-blur-xl border-white/20 overflow-hidden">
        {/* Header with controls */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 border-b border-white/10">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Shared Browser
            </h2>
            {isConnected && (
              <Button
                onClick={handleScreenShare}
                size="lg"
                className={isScreenSharing 
                  ? "bg-red-600 hover:bg-red-700 text-white font-semibold" 
                  : "bg-green-600 hover:bg-green-700 text-white font-semibold"
                }
              >
                {isScreenSharing ? (
                  <>
                    <MonitorOff className="h-5 w-5 mr-2" />
                    Stop Sharing Screen
                  </>
                ) : (
                  <>
                    <Monitor className="h-5 w-5 mr-2" />
                    Share Your Screen
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Status Messages */}
          {isConnected && isScreenSharing && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-2 animate-pulse">
              <p className="text-sm text-green-400 font-medium text-center">
                📡 BROADCASTING LIVE - Your peer is watching your screen
              </p>
            </div>
          )}
          {isConnected && remoteScreenStream && (
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-2">
              <p className="text-sm text-blue-400 font-medium text-center">
                👀 Viewing peer's screen in real-time
              </p>
            </div>
          )}
          {isConnected && !isScreenSharing && !remoteScreenStream && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-2">
              <p className="text-sm text-yellow-400 text-center">
                💡 Click "Share Your Screen" to start broadcasting
              </p>
            </div>
          )}
          {!isConnected && (
            <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-2">
              <p className="text-sm text-gray-400 text-center">
                🔌 Connect to a peer to enable screen sharing
              </p>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="relative" style={{ minHeight: '600px' }}>
          {remoteScreenStream ? (
            // Show remote peer's screen
            <div className="absolute inset-0 bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse shadow-lg">
                🔴 LIVE - Peer's Screen
              </div>
            </div>
          ) : (
            // Show Google Custom Search
            <div className="w-full h-full bg-gradient-to-br from-gray-900/50 to-black/50 flex flex-col items-center justify-center p-8">
              <div className="max-w-3xl w-full space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-white">Search the Web</h3>
                  <p className="text-gray-400">
                    Search results will open in new tabs. Share your screen to broadcast to your peer.
                  </p>
                </div>
                
                {/* Google Custom Search */}
                <div 
                  ref={searchContainerRef}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
                >
                  <div className="gcse-search"></div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: 'Google', url: 'https://google.com' },
                    { name: 'YouTube', url: 'https://youtube.com' },
                    { name: 'Wikipedia', url: 'https://wikipedia.org' },
                    { name: 'GitHub', url: 'https://github.com' }
                  ].map((site) => (
                    <a
                      key={site.name}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-white text-sm font-medium transition-all"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {site.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Status */}
        {isScreenSharing && !remoteScreenStream && (
          <div className="bg-green-600/30 border-t border-green-500/50 p-3 text-center">
            <p className="text-sm text-green-300 font-semibold animate-pulse">
              🎥 Your screen is being broadcast - Switch to your browser tab and share!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WebBrowser;
