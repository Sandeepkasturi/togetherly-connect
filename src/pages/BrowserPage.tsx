import { useOutletContext, useNavigate } from 'react-router-dom';
import { AppContextType } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { MonitorUp, MonitorOff, WifiOff, Wifi } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const BrowserPage = () => {
  const context = useOutletContext<AppContextType>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamError, setStreamError] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  useEffect(() => {
    if (videoRef.current && context.remoteScreenStream) {
      videoRef.current.srcObject = context.remoteScreenStream;
      setStreamError(false);
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [context.remoteScreenStream]);

  // Auto-hide controls overlay after 3s during live view
  useEffect(() => {
    if (!context.remoteScreenStream) return;
    setControlsVisible(true);
    const timer = setTimeout(() => setControlsVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [context.remoteScreenStream]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-24 lg:pb-0">
      {/* Compact Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MonitorUp className="h-5 w-5 text-primary" />
            <h1 className="text-base font-semibold">Screen Share</h1>
            <span className={cn(
              "h-2 w-2 rounded-full",
              context.isConnected ? "bg-[hsl(var(--chat-online))]" : "bg-muted-foreground"
            )} />
          </div>

          {context.isConnected && (
            context.isScreenSharing ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={context.stopScreenShare}
                className="gap-2 h-8 rounded-full text-xs"
              >
                <MonitorOff className="h-3.5 w-3.5" />
                Stop
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={context.startScreenShare}
                className="gap-2 h-8 rounded-full text-xs"
              >
                <MonitorUp className="h-3.5 w-3.5" />
                Share
              </Button>
            )
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <AnimatePresence mode="wait">
          {context.remoteScreenStream ? (
            <motion.div
              key="viewing"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="relative w-full max-w-4xl rounded-2xl overflow-hidden border border-white/5 shadow-2xl shadow-black/40 bg-black"
              onPointerMove={() => setControlsVisible(true)}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onError={() => setStreamError(true)}
                className="max-h-[75vh] w-full object-contain"
              />
              {/* Controls overlay */}
              <motion.div
                initial={false}
                animate={{ opacity: controlsVisible ? 1 : 0 }}
                className="absolute top-3 left-3 bg-destructive/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 pointer-events-none"
              >
                <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                LIVE
              </motion.div>

              {streamError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                  <div className="text-center space-y-2">
                    <WifiOff className="h-8 w-8 text-destructive mx-auto" />
                    <p className="text-sm font-medium">Stream interrupted</p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : context.isScreenSharing ? (
            <motion.div
              key="sharing"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="flex flex-col items-center space-y-6 max-w-sm text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="relative h-24 w-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <MonitorUp className="h-10 w-10 text-primary animate-bounce" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold">Sharing your screen</h2>
                <p className="text-sm text-muted-foreground">
                  Your peer can see everything on your screen.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={context.stopScreenShare}
                className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-full"
              >
                Stop Sharing
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="flex flex-col items-center space-y-6 max-w-sm text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl" />
                <div className="relative h-24 w-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <MonitorUp className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold">Screen Sharing</h2>
                <p className="text-sm text-muted-foreground">
                  Share your screen to watch content or collaborate in real-time.
                </p>
              </div>

              {context.isConnected ? (
                <div className="space-y-3 w-full">
                  <Button
                    onClick={context.startScreenShare}
                    className="w-full h-12 rounded-full text-base font-semibold"
                  >
                    <MonitorUp className="h-5 w-5 mr-2" />
                    Start Sharing
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Your peer's screen will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 w-full">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                    <WifiOff className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-xs text-muted-foreground">Connect to a peer first</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/watch')}
                    className="w-full rounded-full"
                  >
                    <Wifi className="h-4 w-4 mr-2" />
                    Go to Watch to Connect
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BrowserPage;
