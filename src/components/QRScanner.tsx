import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (peerId: string) => void;
  onClose: () => void;
}

const QRScanner = ({ onScan, onClose }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    const onScanSuccess = (decodedText: string) => {
      // Extract peer ID from URL if it's a full URL
      let peerId = decodedText;
      try {
        const url = new URL(decodedText);
        const peerIdParam = url.searchParams.get('peerId');
        if (peerIdParam) {
          peerId = peerIdParam;
        }
      } catch {
        // Not a URL, use as-is
      }

      scanner.clear();
      onScan(peerId);
    };

    const onScanFailure = (error: string) => {
      // Ignore scanning failures (they happen continuously while scanning)
      console.log('Scan error:', error);
    };

    scanner.render(onScanSuccess, onScanFailure);
    setIsScanning(true);

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScan]);

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
          <div id="qr-reader" className="w-full"></div>
          
          <p className="text-xs text-[#8696a0] text-center mt-4">
            Position the QR code within the camera frame
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
