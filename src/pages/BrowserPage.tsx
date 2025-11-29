import { useOutletContext } from 'react-router-dom';
import { AppContextType } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { MonitorUp, MonitorOff, Info, Wifi, WifiOff } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';

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
    <div className="min-h-screen bg-black text-white flex flex-col pb-20 lg:pb-0">
      {/* Header */}
      <div className="shrink-0 px-4 py-4 border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <MonitorUp className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Screen Share
              </h1>
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${context.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <p className="text-xs text-gray-400">
                  {context.isConnected ? "Connected" : "Disconnected"}
                </p>
              </div>
            </div>
          </div>

          {context.isConnected && (
            <div className="flex gap-2">
              {context.isScreenSharing ? (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={context.stopScreenShare}
                  className="gap-2 shadow-lg shadow-red-500/20"
                >
                  <MonitorOff className="h-4 w-4" />
                  <span className="hidden sm:inline">Stop Sharing</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={context.startScreenShare}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                >
                  <MonitorUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Share Screen</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto p-4 flex flex-col justify-center min-h-[60vh]">
        <AnimatePresence mode="wait">
          {context.remoteScreenStream ? (
            // Viewing peer's screen
            <motion.div
              key="viewing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full h-full flex-1 flex items-center justify-center bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onError={handleVideoError}
                className="max-h-[80vh] w-full object-contain"
              />
              <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold animate-pulse shadow-lg flex items-center gap-2">
                <span className="h-2 w-2 bg-white rounded-full" />
                LIVE VIEW
              </div>

              {streamError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                  <div className="text-center space-y-2">
                    <WifiOff className="h-10 w-10 text-red-500 mx-auto" />
                    <p className="text-white font-medium">Stream connection interrupted</p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : context.isScreenSharing ? (
            // Currently sharing own screen
            <motion.div
              key="sharing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center space-y-8 py-12"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 flex items-center justify-center">
                  <MonitorUp className="h-12 w-12 text-blue-400 animate-bounce" />
                </div>
                {/* Ripples */}
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 border border-blue-500/30 rounded-full animate-ping"
                    style={{ animationDelay: `${i * 0.5}s`, animationDuration: '2s' }}
                  />
                ))}
              </div>

              <div className="text-center space-y-2 max-w-md px-4">
                <h2 className="text-2xl font-bold text-white">You are sharing your screen</h2>
                <p className="text-gray-400">
                  Everything on your screen is visible to your peer.
                  <br />
                  Switch apps to show them content.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={context.stopScreenShare}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                Stop Sharing
              </Button>
            </motion.div>
          ) : (
            // Not sharing or viewing (Idle)
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center max-w-lg mx-auto w-full"
            >
              <Card className="w-full bg-white/5 border-white/10 backdrop-blur-xl p-8 space-y-8">
                <div className="text-center space-y-4">
                  <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <MonitorUp className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Screen Sharing</h2>
                    <p className="text-gray-400 mt-2">
                      Share your screen to watch content, browse websites, or collaborate in real-time.
                    </p>
                  </div>
                </div>

                {context.isConnected ? (
                  <div className="space-y-4">
                    <Alert className="bg-blue-500/10 border-blue-500/20">
                      <Info className="h-4 w-4 text-blue-400" />
                      <AlertDescription className="text-blue-300 text-xs sm:text-sm">
                        Works best on desktop. Mobile screen sharing may be limited by your device.
                      </AlertDescription>
                    </Alert>

                    <Button
                      size="lg"
                      onClick={context.startScreenShare}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 h-12 text-lg font-semibold"
                    >
                      <MonitorUp className="h-5 w-5 mr-2" />
                      Start Sharing
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                      Waiting for peer to share? Their screen will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                      <WifiOff className="h-5 w-5 text-red-400" />
                      <p className="text-sm text-red-300">
                        You need to be connected to a peer to share your screen.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-white/10 hover:bg-white/5 text-gray-300"
                      disabled
                    >
                      Connect in Watch Tab
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BrowserPage;
