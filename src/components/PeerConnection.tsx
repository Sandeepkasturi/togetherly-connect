
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Link as LinkIcon, User, Users, Edit, Check, X, PhoneCall } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { DataType } from '@/hooks/usePeer';

interface PeerConnectionProps {
  peerId: string;
  connectToPeer: (id: string) => void;
  isConnected: boolean;
  myNickname: string;
  remoteNickname: string;
  sendData: (data: DataType) => void;
  startCall: () => void;
  isCallActive: boolean;
}

const PeerConnection = ({ peerId, connectToPeer, isConnected, myNickname, remoteNickname, sendData, startCall, isCallActive }: PeerConnectionProps) => {
  const [remoteId, setRemoteId] = useState('');
  const { toast } = useToast();
  const { setNickname } = useUser();
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(myNickname);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(peerId);
    toast({ title: 'Success', description: 'Your Peer ID has been copied to the clipboard.' });
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

  return (
    <div className="p-4 bg-secondary/30 rounded-lg border border-border">
      <h2 className="text-lg font-semibold mb-2">Connection</h2>
      <div className="flex items-center gap-2 mb-2">
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
      <div className="flex items-center gap-2 mb-4">
        <Input value={peerId} readOnly className="bg-background/50" />
        <Button size="icon" onClick={handleCopyToClipboard} disabled={!peerId}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      {!isConnected && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Friend's Peer ID"
            value={remoteId}
            onChange={(e) => setRemoteId(e.target.value)}
          />
          <Button onClick={() => connectToPeer(remoteId)} disabled={!remoteId}>
            <LinkIcon className="h-4 w-4 mr-2" /> Connect
          </Button>
        </div>
      )}
      {isConnected && !isCallActive && (
        <div className="mt-4">
          <Button onClick={startCall} className="w-full bg-green-500 hover:bg-green-600">
            <PhoneCall className="h-4 w-4 mr-2" />
            Call {remoteNickname}
          </Button>
        </div>
      )}
      <div className="mt-2 text-sm flex items-center gap-2">
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
  );
};

export default PeerConnection;
