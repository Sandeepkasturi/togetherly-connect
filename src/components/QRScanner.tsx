import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  onScan: (peerId: string) => void;
  onClose: () => void;
}

const QRScanner = ({ onScan, onClose }: QRScannerProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const scanIntervalRef = useRef<number>();

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        startScanning();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);
      toast({
        title: 'Camera Access Denied',
        description: 'Please allow camera access to scan QR codes.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
  };

  const startScanning = () => {
    scanIntervalRef.current = window.setInterval(() => {
      detectQRCode();
    }, 500);
  };

  const detectQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple QR detection (you would use a library like jsQR for production)
    // For now, we'll just provide manual input as fallback
    // Install jsQR if you want actual QR scanning: npm install jsqr
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-[#1f2c34] rounded-xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#2a3942]">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-[#25d366]" />
            <h3 className="text-base font-semibold text-[#e9edef]">Scan QR Code</h3>
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={onClose}
            className="h-8 w-8 text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942]"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4">
          {hasPermission === null && (
            <div className="aspect-square bg-[#0b141a] rounded-lg flex items-center justify-center">
              <p className="text-[#8696a0]">Requesting camera access...</p>
            </div>
          )}
          
          {hasPermission === false && (
            <div className="aspect-square bg-[#0b141a] rounded-lg flex items-center justify-center flex-col gap-3 p-6 text-center">
              <Camera className="h-12 w-12 text-[#8696a0]" />
              <p className="text-[#8696a0] text-sm">Camera access is required to scan QR codes</p>
              <Button 
                onClick={startCamera}
                className="bg-[#25d366] hover:bg-[#20bd5a] text-white"
              >
                Grant Permission
              </Button>
            </div>
          )}
          
          {hasPermission && (
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-[#25d366] rounded-lg relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#25d366]"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#25d366]"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#25d366]"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#25d366]"></div>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-xs text-[#8696a0] text-center mt-4">
            Position the QR code within the frame to scan
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
