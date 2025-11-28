
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Link as LinkIcon, User, Users, Edit, Check, X, Phone, Video, Share2, MessageCircle, Send, RefreshCw, QrCode } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { DataType } from '@/hooks/usePeer';
import QRScanner from './QRScanner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface PeerConnectionProps {
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

const PeerConnection = ({
  peerId,
  connectToPeer,
  isConnected,
  myNickname,
  remoteNickname,
  sendData,
  startCall,
  isCallActive,
  connectionState,
  onManualReconnect
}: PeerConnectionProps) => {
  const [remoteId, setRemoteId] = useState('');
  const { toast } = useToast();
  const { setNickname } = useUser();
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(myNickname);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const shareUrl = `https://togetherly-share.vercel.app/join?peerId=${peerId}`;

  useEffect(() => {
    if (peerId && isShareModalOpen) {
      // Dynamically import qrcode to avoid build issues
      import('qrcode').then((QRCode) => {
        QRCode.toDataURL(shareUrl, { width: 256, margin: 2 })
          .then(url => {
            setQrCodeDataUrl(url);
          })
          .catch(err => {
            console.error('Failed to generate QR code', err);
            toast({
              title: 'Error',
              description: 'Could not generate QR code.',
              variant: 'destructive'
            });
          });
      }).catch(() => {
        console.log('QR code generation not available');
      });
    }
  }, [peerId, shareUrl, isShareModalOpen, toast]);

  const handleCopyToClipboard = () => {
    if (!peerId) {
      toast({
        title: 'No Peer ID',
        description: 'Peer ID is still generating. Please wait.',
        variant: 'destructive'
      });
      return;
    }
    navigator.clipboard.writeText(peerId);
    toast({ title: 'Success', description: 'Your Peer ID has been copied to the clipboard.' });
  };

  const handleCopyShareLinkToClipboard = () => {
    if (!peerId) {
      toast({
        title: 'No Peer ID',
        description: 'Peer ID is still generating. Please wait.',
        variant: 'destructive'
      });
      return;
    }
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Success', description: 'Invitation link has been copied to the clipboard.' });
  };

  const handleShareLink = () => {
    if (!peerId) {
      toast({
        title: 'No Peer ID',
        description: 'Peer ID is still generating. Please wait.',
        variant: 'destructive'
      });
      return;
    }
    setIsShareModalOpen(true);
  };

  const handleNicknameChange = () => {
    const trimmedNickname = newNickname.trim();
    if (trimmedNickname.length < 3) {
      toast({
        title: 'Nickname too short',
        description: 'Please enter a nickname with at least 3 characters.',
        variant: 'destructive',
      });
      return;
    }
    setNickname(trimmedNickname);
    if (isConnected) {
      sendData({ type: 'nickname', payload: trimmedNickname });
    }
    setIsEditingNickname(false);
    toast({ title: 'Success', description: 'Your nickname has been updated.' });
  };

  const handleCancelEdit = () => {
    setNewNickname(myNickname);
    setIsEditingNickname(false);
  }

  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected': return `Connected to ${remoteNickname}`;
      case 'connecting': return 'Connecting...';
      case 'failed': return 'Connection failed - Click to retry';
      default: return 'Waiting for connection...';
    }
  };

  const shareText = "Let's watch videos together on Togetherly! Click the link to join my room.";

  const handleQRScan = (scannedPeerId: string) => {
    setRemoteId(scannedPeerId);
    setIsQRScannerOpen(false);
    toast({
      title: 'QR Code Scanned',
      description: 'Peer ID has been entered. Click Connect to proceed.',
    });
  };

  return (
    <>
      {isQRScannerOpen && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setIsQRScannerOpen(false)}
        />
      )}

      <div className="p-4 bg-card/50 rounded-xl border border-border/50 backdrop-blur-xl">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Connection Hub
            </h2>
          </div>

          <div className="p-4 rounded-lg bg-background/30 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                <User className="h-4 w-4 text-accent" />
              </div>
              {!isEditingNickname ? (
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Your nickname</p>
                    <p className="font-semibold text-foreground">{myNickname}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditingNickname(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <Input
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleNicknameChange()}
                    className="h-9 bg-background/50"
                    placeholder="New nickname"
                  />
                  <Button variant="premium" size="icon" className="h-9 w-9 flex-shrink-0" onClick={handleNicknameChange}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0" onClick={handleCancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <p className="text-xs font-medium text-primary">Your Connection ID</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={peerId || 'Generating...'}
                  readOnly
                  className="bg-background/30 border-primary/30 font-mono text-sm"
                  placeholder="Generating Peer ID..."
                />
                <Button variant="outline" size="icon" onClick={handleCopyToClipboard} disabled={!peerId} className="flex-shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="premium" size="icon" onClick={handleShareLink} disabled={!peerId} className="flex-shrink-0">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              {!peerId && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                  <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Generating your unique Peer ID...
                </p>
              )}
            </div>
          </div>

          {!isConnected && (
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <div className="flex items-center gap-2 mb-3">
                <LinkIcon className="h-4 w-4 text-accent" />
                <p className="text-sm font-medium text-accent">Connect to Friend</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter Peer ID"
                    value={remoteId}
                    onChange={(e) => setRemoteId(e.target.value)}
                    className="bg-background/30 border-accent/30 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsQRScannerOpen(true)}
                    className="flex-shrink-0 h-10 w-10"
                    title="Scan QR Code"
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="default"
                  onClick={() => connectToPeer(remoteId, { nickname: myNickname })}
                  disabled={!remoteId || !peerId}
                  className="w-full"
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </div>
            </div>
          )}

          {isConnected && !isCallActive && (
            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm font-medium text-green-400">Connected - Start a Call</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => startCall('audio')}
                  variant="glass"
                  className="w-full border-green-500/30 hover:bg-green-500/10"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Audio Call
                </Button>
                <Button
                  onClick={() => startCall('video')}
                  variant="premium"
                  className="w-full"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video Call
                </Button>
              </div>
            </div>
          )}

          <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${connectionState === 'connected' ? 'bg-green-500 animate-pulse' :
                    connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                      connectionState === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {getStatusText()}
                  </p>
                  {isConnected && (
                    <p className="text-xs text-muted-foreground">
                      Secure peer-to-peer connection
                    </p>
                  )}
                </div>
              </div>
              {connectionState === 'failed' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onManualReconnect}
                  className="h-8 px-3"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Invitation
            </DialogTitle>
            <DialogDescription>
              Share this link with your friend to connect. They can scan the QR code or use the link.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="QR Code for invitation link" className="rounded-lg border bg-white p-2" />
            ) : (
              <div className="h-[256px] w-[256px] animate-pulse rounded-lg bg-muted flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Generating QR code...</p>
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">Scan with your phone</p>
          </div>
          <div className="flex items-center space-x-2">
            <Input id="link" value={shareUrl} readOnly />
            <Button type="button" size="icon" onClick={handleCopyShareLinkToClipboard}>
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy</span>
            </Button>
          </div>
          <DialogFooter className="sm:justify-start pt-4">
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="w-full">
                <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">
                  <Send className="mr-2 h-4 w-4" />
                  Telegram
                </a>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PeerConnection;
