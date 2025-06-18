
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Link as LinkIcon, User, Users, Edit, Check, X, Phone, Video, Share2, MessageCircle, Send } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { DataType } from '@/hooks/usePeer';
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
}

const PeerConnection = ({ peerId, connectToPeer, isConnected, myNickname, remoteNickname, sendData, startCall, isCallActive }: PeerConnectionProps) => {
  const [remoteId, setRemoteId] = useState('');
  const { toast } = useToast();
  const { setNickname } = useUser();
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(myNickname);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
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

  const handleCopyToClipboard = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(peerId);
        toast({ title: 'Success', description: 'Your Peer ID has been copied to the clipboard.' });
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = peerId;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          toast({ title: 'Success', description: 'Your Peer ID has been copied to the clipboard.' });
        } catch (err) {
          console.error('Failed to copy:', err);
          toast({ 
            title: 'Copy Failed', 
            description: 'Please manually copy the Peer ID.',
            variant: 'destructive' 
          });
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Copy failed:', err);
      toast({ 
        title: 'Copy Failed', 
        description: 'Please manually copy the Peer ID.',
        variant: 'destructive' 
      });
    }
  };

  const handleCopyShareLinkToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: 'Success', description: 'Invitation link has been copied to the clipboard.' });
      } else {
        // Fallback for mobile browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          toast({ title: 'Success', description: 'Invitation link has been copied to the clipboard.' });
        } catch (err) {
          toast({ 
            title: 'Copy Failed', 
            description: 'Please manually copy the link.',
            variant: 'destructive' 
          });
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      toast({ 
        title: 'Copy Failed', 
        description: 'Please manually copy the link.',
        variant: 'destructive' 
      });
    }
  };

  const handleShareLink = () => {
    if (!peerId) return;
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

  const shareText = "Let's watch videos together on Togetherly! Click the link to join my room.";

  return (
    <>
      <div className="p-4 bg-secondary/30 rounded-lg border border-border">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Connection</h2>
          
          <div className="flex items-center gap-2">
            <User className="text-muted-foreground" />
            {!isEditingNickname ? (
              <div className="flex items-center gap-1">
                <p className="text-sm">You: <span className="font-semibold text-primary">{myNickname}</span></p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditingNickname(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <Input 
                  value={newNickname} 
                  onChange={(e) => setNewNickname(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && handleNicknameChange()}
                  className="h-8"
                  placeholder="New nickname"
                />
                <Button size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleNicknameChange}><Check className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleCancelEdit}><X className="h-4 w-4" /></Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Input value={peerId} readOnly className="bg-background/50" />
            <Button size="icon" onClick={handleCopyToClipboard} disabled={!peerId}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" onClick={handleShareLink} disabled={!peerId}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          
          {!isConnected && (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Friend's Peer ID"
                value={remoteId}
                onChange={(e) => setRemoteId(e.target.value)}
              />
              <Button onClick={() => connectToPeer(remoteId, { nickname: myNickname })} disabled={!remoteId}>
                <LinkIcon className="h-4 w-4 mr-2" /> Connect
              </Button>
            </div>
          )}
          
          {isConnected && !isCallActive && (
            <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={() => startCall('audio')} className="w-full bg-green-500 hover:bg-green-600">
                    <Phone className="h-4 w-4 mr-2" />
                    Audio Call
                </Button>
                <Button onClick={() => startCall('video')} className="w-full">
                    <Video className="h-4 w-4 mr-2" />
                    Video Call
                </Button>
            </div>
          )}
          
          <div>
            <div className="text-sm flex items-center gap-2">
              <Users className={isConnected ? 'text-green-400' : 'text-yellow-400'} />
              <p className={isConnected ? 'text-green-400' : 'text-yellow-400'}>
                Status: {isConnected ? `Connected to ${remoteNickname}` : 'Waiting for connection...'}
              </p>
            </div>
            {isConnected && (
              <p className="mt-1 text-xs text-muted-foreground pl-8">
                Your connection is secure and peer-to-peer.
              </p>
            )}
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
