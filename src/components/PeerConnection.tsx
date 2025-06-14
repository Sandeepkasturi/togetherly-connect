
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Link as LinkIcon } from 'lucide-react';

interface PeerConnectionProps {
  peerId: string;
  connectToPeer: (id: string) => void;
  isConnected: boolean;
}

const PeerConnection = ({ peerId, connectToPeer, isConnected }: PeerConnectionProps) => {
  const [remoteId, setRemoteId] = useState('');
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(peerId);
    toast({ title: 'Success', description: 'Your Peer ID has been copied to the clipboard.' });
  };

  return (
    <div className="p-4 bg-secondary/30 rounded-lg border border-border">
      <h2 className="text-lg font-semibold mb-2">Connection</h2>
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
      <p className={`mt-2 text-sm ${isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
        Status: {isConnected ? 'Connected' : 'Waiting for connection...'}
      </p>
      {isConnected && (
        <p className="mt-1 text-xs text-muted-foreground">
          Your connection is secure and peer-to-peer.
        </p>
      )}
    </div>
  );
};

export default PeerConnection;
