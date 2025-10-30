import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, MonitorOff, Wifi, WifiOff, Signal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ScreenShareControlsProps {
  isConnected: boolean;
  isScreenSharing: boolean;
  onStartScreenShare: () => Promise<void>;
  onStopScreenShare: () => void;
  remoteScreenStream?: MediaStream | null;
}

const ScreenShareControls = ({
  isConnected,
  isScreenSharing,
  onStartScreenShare,
  onStopScreenShare,
  remoteScreenStream
}: ScreenShareControlsProps) => {
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('disconnected');
  const [isStarting, setIsStarting] = useState(false);

  // Monitor connection quality
  useEffect(() => {
    if (!isConnected) {
      setConnectionQuality('disconnected');
      return;
    }

    if (isScreenSharing || remoteScreenStream) {
      setConnectionQuality('excellent');
      
      // Simple quality check based on stream status
      const interval = setInterval(() => {
        if (remoteScreenStream && remoteScreenStream.active) {
          const videoTracks = remoteScreenStream.getVideoTracks();
          if (videoTracks.length > 0 && videoTracks[0].readyState === 'live') {
            setConnectionQuality('excellent');
          } else {
            setConnectionQuality('poor');
          }
        }
      }, 2000);

      return () => clearInterval(interval);
    } else {
      setConnectionQuality('good');
    }
  }, [isConnected, isScreenSharing, remoteScreenStream]);

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      onStopScreenShare();
      toast.success('Screen sharing stopped');
    } else {
      setIsStarting(true);
      try {
        await onStartScreenShare();
        toast.success('Screen sharing started! Your peer can now see your browser.');
      } catch (error: any) {
        console.error('Screen share error:', error);
        if (error.name === 'NotAllowedError') {
          toast.error('Permission denied. Please allow screen sharing.');
        } else if (error.name === 'NotFoundError') {
          toast.error('No screen available to share.');
        } else {
          toast.error('Failed to start screen sharing. Please try again.');
        }
      } finally {
        setIsStarting(false);
      }
    }
  };

  const getQualityIndicator = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <Badge className="bg-green-600 text-white gap-1"><Signal className="h-3 w-3" /> Excellent</Badge>;
      case 'good':
        return <Badge className="bg-blue-600 text-white gap-1"><Wifi className="h-3 w-3" /> Good</Badge>;
      case 'poor':
        return <Badge variant="destructive" className="gap-1"><WifiOff className="h-3 w-3" /> Poor</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1"><WifiOff className="h-3 w-3" /> Not Connected</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Shared Browser
          </h2>
          {getQualityIndicator()}
        </div>
        
        {isConnected && (
          <Button
            onClick={handleScreenShare}
            size="lg"
            disabled={isStarting}
            className={isScreenSharing 
              ? "bg-red-600 hover:bg-red-700 text-white font-semibold" 
              : "bg-green-600 hover:bg-green-700 text-white font-semibold"
            }
          >
            {isStarting ? (
              <>
                <Monitor className="h-5 w-5 mr-2 animate-pulse" />
                Starting...
              </>
            ) : isScreenSharing ? (
              <>
                <MonitorOff className="h-5 w-5 mr-2" />
                Stop Sharing
              </>
            ) : (
              <>
                <Monitor className="h-5 w-5 mr-2" />
                Share Screen
              </>
            )}
          </Button>
        )}
      </div>

      {/* Status Messages */}
      {isConnected && isScreenSharing && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 animate-pulse">
          <p className="text-sm text-green-400 font-medium text-center">
            📡 BROADCASTING LIVE - Your peer is watching your screen
          </p>
        </div>
      )}
      {isConnected && remoteScreenStream && (
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
          <p className="text-sm text-blue-400 font-medium text-center">
            👀 Viewing peer's screen in real-time
          </p>
        </div>
      )}
      {isConnected && !isScreenSharing && !remoteScreenStream && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-sm text-yellow-400 text-center">
            💡 Click "Share Screen" to start broadcasting
          </p>
        </div>
      )}
      {!isConnected && (
        <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-3">
          <p className="text-sm text-gray-400 text-center">
            🔌 Connect to a peer to enable screen sharing
          </p>
        </div>
      )}
    </div>
  );
};

export default ScreenShareControls;
