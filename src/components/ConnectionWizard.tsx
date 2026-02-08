import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { DataType } from '@/hooks/usePeer';
import {
  User, ArrowRight, QrCode, Link as LinkIcon, Copy, Share2, Check,
  Wifi, WifiOff, Loader2, Camera, ChevronLeft, Phone, Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRScanner from './QRScanner';

interface ConnectionWizardProps {
  peerId: string;
  connectToPeer: (id: string, metadata: { nickname: string }) => void;
  isConnected: boolean;
  myNickname: string;
  remoteNickname: string;
  sendData: (data: DataType) => void;
  startCall: (type: 'audio' | 'video') => void;
  isCallActive: boolean;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'failed' | 'reconnecting';
  onManualReconnect: () => void;
}

type WizardStep = 'nickname' | 'connect' | 'connected';

const ConnectionWizard = ({
  peerId,
  connectToPeer,
  isConnected,
  myNickname,
  remoteNickname,
  sendData,
  startCall,
  isCallActive,
  connectionState,
  onManualReconnect,
}: ConnectionWizardProps) => {
  const { nickname, setNickname } = useUser();
  const { toast } = useToast();
  const [step, setStep] = useState<WizardStep>('nickname');
  const [nicknameInput, setNicknameInput] = useState(nickname || '');
  const [remoteId, setRemoteId] = useState('');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Determine current step based on state
  useEffect(() => {
    if (isConnected) {
      setStep('connected');
    } else if (nickname && nickname.length >= 3) {
      setStep('connect');
    } else {
      setStep('nickname');
    }
  }, [isConnected, nickname]);

  // Auto-fill from share link
  useEffect(() => {
    const targetPeerId = localStorage.getItem('peerIdToConnect');
    if (targetPeerId && peerId && nickname) {
      setRemoteId(targetPeerId);
      localStorage.removeItem('peerIdToConnect');
    }
  }, [peerId, nickname]);

  const handleNicknameSubmit = () => {
    const trimmed = nicknameInput.trim();
    if (trimmed.length < 3) {
      toast({
        title: 'Too short',
        description: 'Nickname must be at least 3 characters.',
        variant: 'destructive',
      });
      return;
    }
    setNickname(trimmed);
    setStep('connect');
  };

  const handleConnect = () => {
    if (!remoteId.trim() || !peerId) return;
    connectToPeer(remoteId.trim(), { nickname: myNickname });
  };

  const handleQRScan = (scannedPeerId: string) => {
    setRemoteId(scannedPeerId);
    setIsQRScannerOpen(false);
    // Auto-connect after QR scan
    if (peerId && myNickname) {
      setTimeout(() => {
        connectToPeer(scannedPeerId, { nickname: myNickname });
      }, 300);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(peerId);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Your connection ID is copied.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = `https://togetherly-share.vercel.app/join?peerId=${peerId}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Togetherly',
          text: "Let's watch together!",
          url: shareUrl,
        });
        return;
      } catch { /* cancelled */ }
    }
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Link copied!', description: 'Share this link with your friend.' });
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <>
      {isQRScannerOpen && (
        <QRScanner onScan={handleQRScan} onClose={() => setIsQRScannerOpen(false)} />
      )}

      <div className="w-full max-w-md mx-auto">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(['nickname', 'connect', 'connected'] as WizardStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                step === s ? 'bg-primary scale-125 ring-2 ring-primary/30' :
                (['nickname', 'connect', 'connected'].indexOf(step) > i ? 'bg-primary/60' : 'bg-muted')
              }`} />
              {i < 2 && <div className={`w-8 h-0.5 transition-colors ${
                (['nickname', 'connect', 'connected'].indexOf(step) > i ? 'bg-primary/60' : 'bg-muted'
              )}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait" custom={1}>
          {/* Step 1: Nickname */}
          {step === 'nickname' && (
            <motion.div
              key="nickname"
              variants={slideVariants}
              custom={1}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">What should we call you?</h2>
                <p className="text-sm text-muted-foreground">Pick a nickname for your friends to see</p>
              </div>

              <div className="space-y-4">
                <Input
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNicknameSubmit()}
                  placeholder="Enter your nickname..."
                  className="h-12 text-center text-lg bg-background/50 border-border/50"
                  autoFocus
                  maxLength={20}
                />
                <Button
                  onClick={handleNicknameSubmit}
                  disabled={nicknameInput.trim().length < 3}
                  className="w-full h-12 text-base font-semibold"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Connect */}
          {step === 'connect' && (
            <motion.div
              key="connect"
              variants={slideVariants}
              custom={1}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-foreground">
                  Hey {myNickname}! 👋
                </h2>
                <p className="text-sm text-muted-foreground">Connect with a friend to start watching together</p>
              </div>

              {/* Your ID section */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-xs font-medium text-primary">Your Connection ID</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={peerId || 'Generating...'}
                    readOnly
                    className="bg-background/30 border-primary/20 font-mono text-xs h-10"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyId}
                    disabled={!peerId}
                    className="flex-shrink-0 h-10 w-10"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  disabled={!peerId}
                  className="w-full h-10"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Invite Link
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-3 text-muted-foreground">or join a friend</span>
                </div>
              </div>

              {/* Connect to friend */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Paste friend's Peer ID"
                    value={remoteId}
                    onChange={(e) => setRemoteId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                    className="bg-background/30 border-border/50 font-mono text-xs h-10"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsQRScannerOpen(true)}
                    className="flex-shrink-0 h-10 w-10"
                    title="Scan QR Code"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={handleConnect}
                  disabled={!remoteId.trim() || !peerId || connectionState === 'connecting'}
                  className="w-full h-12 text-base font-semibold"
                >
                  {connectionState === 'connecting' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>

                {connectionState === 'failed' && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                    <p className="text-xs text-destructive font-medium mb-2">Connection failed</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Try switching networks (Wi-Fi ↔ 4G) or ask your friend to share a new link.
                    </p>
                    <Button variant="outline" size="sm" onClick={onManualReconnect}>
                      Try Again
                    </Button>
                  </div>
                )}
              </div>

              {/* Edit nickname link */}
              <button
                onClick={() => { setStep('nickname'); setNicknameInput(myNickname); }}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-3 w-3 inline mr-1" />
                Change nickname
              </button>
            </motion.div>
          )}

          {/* Step 3: Connected */}
          {step === 'connected' && (
            <motion.div
              key="connected"
              variants={slideVariants}
              custom={1}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-2">
                  <Wifi className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Connected! 🎉</h2>
                <p className="text-sm text-muted-foreground">
                  You're watching with <span className="font-semibold text-foreground">{remoteNickname}</span>
                </p>
              </div>

              {/* Connection status */}
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Secure P2P Connection</p>
                      <p className="text-xs text-muted-foreground">End-to-end encrypted</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call buttons */}
              {!isCallActive && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => startCall('audio')}
                    variant="outline"
                    className="flex-1 h-12 border-green-500/30 hover:bg-green-500/10"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Voice Call
                  </Button>
                  <Button
                    onClick={() => startCall('video')}
                    className="flex-1 h-12"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Video Call
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ConnectionWizard;
