import { useState, useEffect, useCallback } from 'react';
import { usePeer, Message, DataType, Reaction } from '@/hooks/usePeer';
import { useUser } from '@/contexts/UserContext';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import CallManager from '@/components/CallManager';
import AppHeader from '@/components/AppHeader';
import SplashScreen from '@/components/SplashScreen';
import BottomNav from '@/components/BottomNav';
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
import { usePlaylist } from '@/contexts/PlaylistContext';

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
  handleSendVoice: (voiceData: string, duration: number) => void;
  handleEditMessage: (id: string, newContent: string) => void;
  handleDeleteMessage: (id: string) => void;
  clearChat: () => void;
  selectedVideoId: string;
  handleVideoSelect: (videoId: string) => void;
  playerSyncData: DataType | null;
  browserSyncData: DataType | null;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'failed';
  onManualReconnect: () => void;
  isScreenSharing: boolean;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  remoteScreenStream: MediaStream | null;
}

const AppLayout = () => {
  const { nickname } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    peerId, connectToPeer, sendData, data, isConnected, conn,
    localStream, remoteStream, isCallActive, startCall, endCall, toggleMedia,
    screenStream, remoteScreenStream, isScreenSharing, startScreenShare, stopScreenShare,
    incomingConn, acceptConnection, rejectConnection
  } = usePeer();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [remoteNickname, setRemoteNickname] = useState('Friend');
  const [incomingPeerInfo, setIncomingPeerInfo] = useState<{ nickname: string, peerId: string } | null>(null);
  const { toast } = useToast();
  const { setSendDataRef, handleReceivedPlaylist } = usePlaylist();

  // Splash screen states
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!nickname) {
      navigate('/');
    }
  }, [nickname, navigate]);

  // Show splash screen for 5 seconds on app load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplashScreen(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const peerIdToConnect = localStorage.getItem('peerIdToConnect');
    if (peerIdToConnect && peerId && nickname && !isConnected && !conn) {
      setIsConnecting(true);
      connectToPeer(peerIdToConnect, { nickname });
      localStorage.removeItem('peerIdToConnect');

      // Show splash for 5 seconds while connecting
      setTimeout(() => {
        setIsConnecting(false);
      }, 5000);
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
    // Only send nickname after connection is fully established
    if (isConnected && conn && conn.open && nickname) {
      sendData({ type: 'nickname', payload: nickname });
    }
  }, [isConnected, conn?.open, nickname, sendData]);

  useEffect(() => {
    if (data) {
      if (data.type === 'chat') {
        const newMessage: Message = { ...data.payload, sender: 'them', messageType: 'text' };
        setMessages((prev) => [...prev, newMessage]);

        // Enhanced notification system: notify whenever user is away from Chat tab
        if (newMessage.nickname && location.pathname !== '/chat') {
          const isWatchingIntently = document.fullscreenElement || document.hidden === false;

          if (isWatchingIntently) {
            sonnerToast.message(`💬 ${newMessage.nickname}`, {
              description: newMessage.content,
              duration: 4000,
              action: {
                label: "Reply",
                onClick: () => {
                  const chatInput = document.querySelector('input[placeholder*="Message"]') as HTMLInputElement | null;
                  if (chatInput) {
                    chatInput.focus();
                  }
                }
              }
            });
          }

          // Try to trigger native notification if supported
          if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification(`New message from ${newMessage.nickname}`, {
                body: newMessage.content,
              });
            } else if (Notification.permission === 'default') {
              Notification.requestPermission();
            }
          }
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

        // File sharing notification
        if (data.payload.nickname) {
          sonnerToast.success(`📎 File from ${data.payload.nickname}`, {
            description: `Shared: ${data.payload.fileName}`,
            duration: 5000
          });
        }
      } else if (data.type === 'video') {
        setSelectedVideoId(data.payload);
        navigate('/theater');
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

          // Connection notification
          if (isFirstTime) {
            sonnerToast.success(`🎉 ${data.payload} joined!`, {
              description: "You can now watch videos together",
              duration: 4000
            });
          }
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
      } else if (data.type === 'screen_share_start') {
        const systemMessage: Message = {
          id: nanoid(),
          sender: 'system',
          content: `${data.payload.nickname} started sharing their screen`,
          timestamp: new Date().toLocaleTimeString(),
          messageType: 'system'
        };
        setMessages(prev => [...prev, systemMessage]);
        sonnerToast.info("📺 Screen Share Started", {
          description: `${data.payload.nickname} is sharing their screen`,
          duration: 3000
        });
      } else if (data.type === 'screen_share_stop') {
        const systemMessage: Message = {
          id: nanoid(),
          sender: 'system',
          content: `${data.payload.nickname} stopped sharing their screen`,
          timestamp: new Date().toLocaleTimeString(),
          messageType: 'system'
        };
        setMessages(prev => [...prev, systemMessage]);
      } else if (data.type === 'voice') {
        const voiceMessage: Message = {
          id: data.payload.id,
          sender: 'them',
          messageType: 'voice',
          content: 'Voice Message',
          timestamp: data.payload.timestamp,
          nickname: data.payload.nickname,
          voiceData: data.payload.voiceData,
          voiceDuration: data.payload.duration,
        };
        setMessages(prev => [...prev, voiceMessage]);
      } else if (data.type === 'edit_message') {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === data.payload.id ? { ...msg, content: data.payload.newContent, isEdited: true } : msg
          )
        );
      } else if (data.type === 'delete_message') {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === data.payload.id ? { ...msg, isDeleted: true, content: 'This message was deleted' } : msg
          )
        );
      } else if (data.type === 'clear_chat') {
        setMessages([]);
        sonnerToast.info("Chat cleared by peer");
      } else if (data.type === 'file_start') {
        setIncomingFiles(prev => ({
          ...prev,
          [data.payload.id]: {
            fileName: data.payload.fileName,
            fileType: data.payload.fileType,
            fileSize: data.payload.fileSize,
            totalChunks: data.payload.totalChunks,
            chunks: new Array(data.payload.totalChunks).fill(null),
            receivedChunks: 0,
            timestamp: data.payload.timestamp,
            nickname: data.payload.nickname,
            isVoice: data.payload.isVoice,
            duration: data.payload.duration,
          }
        }));
      } else if (data.type === 'file_chunk') {
        setIncomingFiles(prev => {
          const fileState = prev[data.payload.id];
          if (!fileState) return prev; // Should not happen if start received first

          const newChunks = [...fileState.chunks];
          newChunks[data.payload.chunkIndex] = data.payload.chunk;
          const newReceivedCount = fileState.receivedChunks + 1;

          if (newReceivedCount === fileState.totalChunks) {
            // File complete
            const fullData = newChunks.join('');
            const newMessage: Message = {
              id: data.payload.id,
              sender: 'them',
              messageType: fileState.isVoice ? 'voice' : 'file',
              content: fileState.isVoice ? 'Voice Message' : fileState.fileName,
              timestamp: fileState.timestamp,
              nickname: fileState.nickname,
              fileName: fileState.fileName,
              fileType: fileState.fileType,
              fileSize: fileState.fileSize,
              fileData: fileState.isVoice ? undefined : fullData,
              voiceData: fileState.isVoice ? fullData : undefined,
              voiceDuration: fileState.duration,
            };
            setMessages(prevMsgs => [...prevMsgs, newMessage]);

            // Clean up
            const { [data.payload.id]: _, ...rest } = prev;
            return rest;
          }

          return {
            ...prev,
            [data.payload.id]: {
              ...fileState,
              chunks: newChunks,
              receivedChunks: newReceivedCount,
            }
          };
        });
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

  // Custom connectToPeer wrapper that shows splash screen
  const handleConnectToPeer = useCallback((id: string, metadata: { nickname: string }) => {
    setIsConnecting(true);
    connectToPeer(id, metadata);

    // Show splash for 5 seconds while connecting
    setTimeout(() => {
      setIsConnecting(false);
    }, 5000);
  }, [connectToPeer]);

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

  // State for file chunk reassembly
  const [incomingFiles, setIncomingFiles] = useState<{
    [id: string]: {
      fileName: string;
      fileType: string;
      fileSize: number;
      totalChunks: number;
      chunks: string[];
      receivedChunks: number;
      timestamp: string;
      nickname?: string;
      isVoice?: boolean;
      duration?: number;
    }
  }>({});

  const sendFileChunks = async (
    id: string,
    data: string, // base64 string
    metadata: {
      fileName: string;
      fileType: string;
      fileSize: number;
      timestamp: string;
      nickname: string;
      isVoice?: boolean;
      duration?: number;
    }
  ) => {
    const CHUNK_SIZE = 16 * 1024; // 16KB chunks
    const totalChunks = Math.ceil(data.length / CHUNK_SIZE);

    // Send start message
    sendData({
      type: 'file_start',
      payload: {
        id,
        fileName: metadata.fileName,
        fileType: metadata.fileType,
        fileSize: metadata.fileSize,
        totalChunks,
        timestamp: metadata.timestamp,
        nickname: metadata.nickname,
        isVoice: metadata.isVoice,
        duration: metadata.duration,
      },
    });

    // Send chunks
    for (let i = 0; i < totalChunks; i++) {
      const chunk = data.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      sendData({
        type: 'file_chunk',
        payload: {
          id,
          chunkIndex: i,
          chunk,
        },
      });
      // Small delay to prevent flooding the channel
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  };

  const handleSendVoice = (voiceData: string, duration: number) => {
    if (!nickname) return;
    const messageId = Date.now().toString();
    const timestamp = new Date().toLocaleTimeString();

    sendFileChunks(messageId, voiceData, {
      fileName: 'Voice Message',
      fileType: 'audio/webm',
      fileSize: voiceData.length,
      timestamp,
      nickname,
      isVoice: true,
      duration,
    });

    const voiceMessage: Message = {
      id: messageId,
      sender: 'me',
      messageType: 'voice',
      content: 'Voice Message',
      timestamp,
      nickname,
      voiceData,
      voiceDuration: duration,
    };
    setMessages((prev) => [...prev, voiceMessage]);
  };

  const handleEditMessage = (id: string, newContent: string) => {
    const dataToSend: DataType = {
      type: 'edit_message',
      payload: { id, newContent },
    };
    sendData(dataToSend);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, content: newContent, isEdited: true } : msg
      )
    );
  };

  const handleDeleteMessage = (id: string) => {
    const dataToSend: DataType = {
      type: 'delete_message',
      payload: { id },
    };
    sendData(dataToSend);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, isDeleted: true, content: 'This message was deleted' } : msg
      )
    );
  };

  const clearChat = () => {
    setMessages([]);
    const dataToSend: DataType = { type: 'clear_chat', payload: null };
    sendData(dataToSend);
  };

  const handleSendFile = (file: File) => {
    if (!nickname) return;
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "File is too large",
        description: "Please select a file smaller than 50MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const fileData = reader.result as string;
      const messageId = Date.now().toString();

      sendFileChunks(messageId, fileData, {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        timestamp: new Date().toLocaleTimeString(),
        nickname,
      });

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
    navigate('/theater');
  };

  const handleSendReaction = (messageId: string, emoji: string) => {
    if (!nickname) return;

    const message = messages.find(m => m.id === messageId);
    const alreadyReacted = message?.reactions?.some(r => r.emoji === emoji && r.by === nickname);
    if (alreadyReacted) return;

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

  const playerSyncData = (data?.type === 'player_state' || data?.type === 'request_sync') ? data : null;
  const browserSyncData = data?.type === 'browser_sync' ? data : null;

  const context: AppContextType = {
    peerId,
    connectToPeer: handleConnectToPeer,
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
    handleSendVoice,
    handleEditMessage,
    handleDeleteMessage,
    clearChat,
    selectedVideoId,
    handleVideoSelect,
    playerSyncData,
    browserSyncData,
    connectionState: isConnected ? 'connected' : 'disconnected',
    onManualReconnect: () => connectToPeer('', { nickname }),
    isScreenSharing,
    startScreenShare,
    stopScreenShare,
    remoteScreenStream
  };

  return (
    <>
      <SplashScreen isVisible={showSplashScreen || isConnecting} />
      <div className="min-h-screen bg-transparent text-foreground flex flex-col relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-float" />
          <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <AppHeader />
        <main className="flex-grow relative z-10">
          <Outlet context={context} />
        </main>
        <BottomNav />
        <CallManager
          localStream={localStream}
          remoteStream={remoteStream}
          isCallActive={isCallActive}
          endCall={endCall}
          toggleMedia={toggleMedia}
          remoteNickname={remoteNickname}
        />
        <AlertDialog open={!!incomingConn}>
          <AlertDialogContent className="glass-panel">
            <AlertDialogHeader>
              <AlertDialogTitle>Incoming Connection Request</AlertDialogTitle>
              <AlertDialogDescription>
                <strong>{incomingPeerInfo?.nickname}</strong> wants to connect. Do you want to accept?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={rejectConnection} className="glass-panel hover:bg-white/10">Reject</AlertDialogCancel>
              <AlertDialogAction onClick={acceptConnection} className="bg-primary hover:bg-primary/90">Accept</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default AppLayout;
