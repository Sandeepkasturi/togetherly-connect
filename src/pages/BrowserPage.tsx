import { useOutletContext } from 'react-router-dom';
import { AppContextType } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { MonitorUp, MonitorOff, Info } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BrowserPage = () => {
  const context = useOutletContext<AppContextType>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamError, setStreamError] = useState(false);

  // Display remote screen share
  useEffect(() => {
    if (videoRef.current && context.remoteScreenStream) {
      videoRef.current.srcObject = context.remoteScreenStream;
      setStreamError(false);
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [context.remoteScreenStream]);

  const handleVideoError = () => {
    setStreamError(true);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background pb-16">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border/60 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Screen Share</h1>
            <p className="text-xs text-muted-foreground">
              {context.isConnected ? "Share or view screens" : "Connect first from Watch tab"}
            </p>
          </div>
          
          {context.isConnected && (
            <div className="flex gap-2">
              {context.isScreenSharing ? (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={context.stopScreenShare}
                  className="gap-2"
                >
                  <MonitorOff className="h-4 w-4" />
                  Stop Sharing
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={context.startScreenShare}
                  className="gap-2"
                >
                  <MonitorUp className="h-4 w-4" />
                  Share Screen
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {context.remoteScreenStream ? (
          // Viewing peer's screen
          <div className="relative h-full w-full bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onError={handleVideoError}
              className="h-full w-full object-contain"
            />
            <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse shadow-lg">
              🔴 LIVE - Viewing Peer's Screen
            </div>
            
            {streamError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <p className="text-white text-lg">Stream connection lost</p>
              </div>
            )}
          </div>
        ) : context.isScreenSharing ? (
          // Currently sharing own screen
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-green-500/10 to-blue-500/10">
            <div className="text-center space-y-4 p-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-600 text-white animate-pulse">
                <MonitorUp className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold">Sharing Your Screen</h2>
              <p className="text-muted-foreground max-w-md">
                Your screen is being broadcast to your peer. They can see everything you do.
              </p>
            </div>
          </div>
        ) : (
          // Not sharing or viewing
          <div className="h-full flex items-center justify-center p-6">
            <div className="max-w-md space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                <MonitorUp className="h-10 w-10 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Screen Sharing</h2>
                <p className="text-muted-foreground">
                  {context.isConnected 
                    ? "Share your screen with your peer or wait for them to share theirs."
                    : "Connect to a peer from the Watch tab to enable screen sharing."
                  }
                </p>
              </div>

              {context.isConnected && (
                <>
                  <Alert className="bg-blue-500/10 border-blue-500/30 text-left">
                    <Info className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-sm text-blue-300">
                      Click "Share Screen" to broadcast your screen. Your peer will see your entire screen in real-time, just like Google Meet.
                    </AlertDescription>
                  </Alert>

                  <Button
                    size="lg"
                    onClick={context.startScreenShare}
                    className="w-full gap-2"
                  >
                    <MonitorUp className="h-5 w-5" />
                    Start Screen Sharing
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowserPage;
