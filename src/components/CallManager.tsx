
import { useState } from 'react';
import VideoFeed from './VideoFeed';
import { Button } from './ui/button';
import { Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

interface CallManagerProps {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isCallActive: boolean;
    endCall: () => void;
    toggleMedia: (type: 'audio' | 'video') => void;
    remoteNickname: string;
}

const CallManager = ({ localStream, remoteStream, isCallActive, endCall, toggleMedia, remoteNickname }: CallManagerProps) => {
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const hasVideo = !!localStream?.getVideoTracks().length;

    const handleToggleMic = () => {
        toggleMedia('audio');
        setIsMicMuted(prev => !prev);
    };

    const handleToggleVideo = () => {
        if (hasVideo) {
            toggleMedia('video');
            setIsVideoOff(prev => !prev);
        }
    };

    const onDialogChange = (open: boolean) => {
      if (!open && isCallActive) {
        endCall();
      }
    }
    
    const videoIsActuallyOff = !hasVideo || isVideoOff;

    return (
        <Dialog open={isCallActive} onOpenChange={onDialogChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 data-[state=open]:slide-in-from-bottom-1/2">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>Call with {remoteNickname}</DialogTitle>
                </DialogHeader>
                <div className="flex-grow p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/40 overflow-y-auto">
                    <div className="relative">
                        <VideoFeed stream={remoteStream} />
                        <p className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded">{remoteNickname}</p>
                    </div>
                    <div className="relative">
                        <VideoFeed stream={localStream} isMuted isMe />
                        <p className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded">You</p>
                    </div>
                </div>
                <DialogFooter className="p-4 border-t bg-background flex-row justify-center gap-4">
                    <Button variant={isMicMuted ? 'destructive' : 'outline'} size="icon" onClick={handleToggleMic} className="rounded-full">
                        {isMicMuted ? <MicOff /> : <Mic />}
                    </Button>
                    <Button variant="destructive" size="icon" className="w-16 h-10 rounded-full" onClick={endCall}>
                        <Phone />
                    </Button>
                    <Button 
                        variant={videoIsActuallyOff ? 'destructive' : 'outline'} 
                        size="icon" 
                        onClick={handleToggleVideo} 
                        className="rounded-full"
                        disabled={!hasVideo}
                    >
                        {videoIsActuallyOff ? <VideoOff /> : <Video />}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CallManager;
