import { useState, useEffect, useCallback } from 'react';
import { usePeer, Message, DataType, Reaction } from '@/hooks/usePeer';
import { useUser } from '@/contexts/UserContext';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import CallManager from '@/components/CallManager';
import AppHeader from '@/components/AppHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast as sonnerToast } from "sonner";
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';
import { usePlaylist } from '@/hooks/usePlaylist';

export interface AppContextType {
  peerId: string;
  connectToPeer: (id: string, metadata: { nickname: string }) => void;
  isConnected: boolean;
  myNickname: string;
  remoteNickname: string;
  sendData: (data: DataType) => void;
  startCall: (type: "audio" | "video") => void;
  isCallActive: boolean;
  messages: Message[];
  sendMessage: (content: string) => void;
  handleSendReaction: (messageId: string, emoji: string) => void;
  handleSendFile: (file: File) => void;
  selectedVideoId: string;
  handleVideoSelect: (videoId: string) => void;
  playerSyncData: DataType | null;
}

const AppLayout = () => {
  const { nickname } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    peerId, connectToPeer, sendData, data, isConnected, conn,
    localStream, remoteStream, isCallActive, startCall, endCall, toggleMedia,
    incomingConn, acceptConnection, rejectConnection
  } = usePeer();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [remoteNickname, setRemoteNickname] = useState('Friend');
  const [incomingPeerInfo, setIncomingPeerInfo] = useState<{nickname: string, peerId: string} | null>(null);
  const { toast } = useToast();
  const { setSendDataRef, handleReceivedPlaylist } = usePlaylist();

  useEffect(() => {
    if (!nickname) {
      navigate('/');
    }
  }, [nickname, navigate]);

  useEffect(() => {
    const peerIdToConnect = localStorage.getItem('peerIdToConnect');
    if (peerIdToConnect && peerId && nickname && !isConnected && !conn) {
      connectToPeer(peerIdToConnect, { nickname });
      localStorage.removeItem('peerIdToConnect');
    }
  }, [peerId, nickname, isConnected, conn, connectToPeer]);

  useEffect(() => {
    if (incomingConn) {
      const nickname = incomingConn.metadata?.nickname || 'A friend';
      setIncomingPeerInfo({ nickname, peerId: incomingConn.peer });
    } else {
      setIncomingPeerInfo(null);
    }
  }, [incomingConn]);

  useEffect(() => {
    if (isConnected && conn && nickname) {
      sendData({ type: 'nickname', payload: nickname });
    }
  }, [isConnected, conn, nickname, sendData]);

  useEffect(() => {
    if (data) {
      if (data.type === 'chat') {
        const newMessage: Message = { ...data.payload, sender: 'them', messageType: 'text' };
        setMessages((prev) => [...prev, newMessage]);
        if (location.pathname.startsWith('/watch') && newMessage.nickname) {
            sonnerToast.message(`New message from ${newMessage.nickname}`, {
                description: newMessage.content,
            });
        }
      } else if (data.type === 'file') {
        const fileMessage: Message = {
          id: data.payload.id,
          sender: 'them',
          messageType: 'file',
          content: data.payload.fileName,
          timestamp: data.payload.timestamp,
          nickname: data.payload.nickname,
          fileName: data.payload.fileName,
          fileType: data.payload.fileType,
          fileSize: data.payload.fileSize,
          fileData: data.payload.fileData,
        };
        setMessages(prev => [...prev, fileMessage]);
      } else if (data.type === 'video') {
        setSelectedVideoId(data.payload);
      } else if (data.type === 'system') {
        const systemMessage: Message = { 
          id: Date.now().toString(), 
          content: data.payload, 
          sender: 'system', 
          timestamp: new Date().toLocaleTimeString(),
          messageType: 'system'
        };
        setMessages((prev) => [...prev, systemMessage]);
      } else if (data.type === 'nickname') {
        if (remoteNickname !== data.payload) {
          const isFirstTime = remoteNickname === 'Friend';
          const messageContent = isFirstTime
            ? `${data.payload} has joined the room.`
            : `${remoteNickname} changed their name to ${data.payload}.`;
          
          setRemoteNickname(data.payload);
          
          const systemMessage: Message = { 
            id: Date.now().toString(), 
            content: messageContent, 
            sender: 'system', 
            timestamp: new Date().toLocaleTimeString(),
            messageType: 'system'
          };
          setMessages((prev) => [...prev, systemMessage]);
        }
      } else if (data.type === 'reaction') {
        setMessages(prevMessages =>
          prevMessages.map(msg => {
            if (msg.id === data.payload.messageId) {
              const reaction = data.payload.reaction;
              const alreadyReacted = msg.reactions?.some(r => r.emoji === reaction.emoji && r.by === reaction.by);
              if (alreadyReacted) return msg;
              
              const newReactions = [...(msg.reactions || []), reaction];
              return { ...msg, reactions: newReactions };
            }
            return msg;
          })
        );
      }
    }
  }, [data, remoteNickname, location.pathname]);

  useEffect(() => {
    setSendDataRef(sendData);
  }, [sendData, setSendDataRef]);

  useEffect(() => {
    if (data?.type === 'playlist_share') {
      const { playlist, sharedBy } = data.payload;
      handleReceivedPlaylist(playlist, sharedBy);
      
      const systemMessage: Message = {
        id: nanoid(),
        sender: 'system',
        content: `${sharedBy} shared a playlist: "${playlist.name}"`,
        timestamp: new Date().toLocaleTimeString(),
        messageType: 'system'
      };
      setMessages(prev => [...prev, systemMessage]);
    }
  }, [data, handleReceivedPlaylist]);

  const handleSendMessage = (content: string) => {
    const message: Omit<Message, 'sender'> = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toLocaleTimeString(),
      nickname: nickname,
      messageType: 'text',
    };
    const dataToSend: DataType = { type: 'chat', payload: message };
    sendData(dataToSend);
    setMessages((prev) => [...prev, { ...message, sender: 'me' }]);
  };

  const handleSendFile = (file: File) => {
    if (!nickname) return;
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File is too large",
        description: "Please select a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const fileData = reader.result as string;
      const messageId = Date.now().toString();

      const dataToSend: DataType = {
        type: 'file',
        payload: {
          id: messageId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData,
          timestamp: new Date().toLocaleTimeString(),
          nickname,
        },
      };
      sendData(dataToSend);

      const fileMessage: Message = {
        id: messageId,
        sender: 'me',
        messageType: 'file',
        content: file.name,
        timestamp: new Date().toLocaleTimeString(),
        nickname,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData,
      };
      setMessages((prev) => [...prev, fileMessage]);
    };
  };

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideoId(videoId);
    const dataToSend: DataType = { type: 'video', payload: videoId };
    sendData(dataToSend);
  };
  
  const handleSendReaction = (messageId: string, emoji: string) => {
    if (!nickname) return;
    
    const message = messages.find(m => m.id === messageId);
    const alreadyReacted = message?.reactions?.some(r => r.emoji === emoji && r.by === nickname);
    if(alreadyReacted) return;

    const reaction: Reaction = { emoji, by: nickname };
    const dataToSend: DataType = { type: 'reaction', payload: { messageId, reaction } };
    sendData(dataToSend);

    setMessages(prevMessages =>
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          const newReactions = [...(msg.reactions || []), reaction];
          return { ...msg, reactions: newReactions };
        }
        return msg;
      })
    );
  };

  if (!nickname) {
    return null;
  }
  
  const playerSyncData = data?.type === 'player_state' ? data : null;

  const context: AppContextType = {
    peerId,
    connectToPeer,
    isConnected,
    myNickname: nickname,
    remoteNickname,
    sendData,
    startCall,
    isCallActive,
    messages,
    sendMessage: handleSendMessage,
    handleSendReaction,
    handleSendFile,
    selectedVideoId,
    handleVideoSelect,
    playerSyncData
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      <main className="flex-grow">
        <Outlet context={context} />
      </main>
      <CallManager
        localStream={localStream}
        remoteStream={remoteStream}
        isCallActive={isCallActive}
        endCall={endCall}
        toggleMedia={toggleMedia}
        remoteNickname={remoteNickname}
      />
       <AlertDialog open={!!incomingConn}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Incoming Connection Request</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{incomingPeerInfo?.nickname}</strong> wants to connect. Do you want to accept?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={rejectConnection}>Reject</AlertDialogCancel>
            <AlertDialogAction onClick={acceptConnection}>Accept</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AppLayout;
