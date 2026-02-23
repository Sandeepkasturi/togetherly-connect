import { useState, useEffect, useCallback, useRef } from 'react';
import { usePeer, Message, DataType, Reaction } from '@/hooks/usePeer';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { UserCircle, ShieldCheck } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import CallManager from '@/components/CallManager';
import SplashScreen from '@/components/SplashScreen';
import BottomNav from '@/components/BottomNav';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import IncomingCallModal from '@/components/IncomingCallModal';
import { useCallSignaling, CallRecord } from '@/hooks/useCallSignaling';
import { useRingtone } from '@/hooks/useRingtone';
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
  disconnectPeer: () => void;
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
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'failed' | 'reconnecting';
  onManualReconnect: () => void;
  isScreenSharing: boolean;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  remoteScreenStream: MediaStream | null;
}

const AppLayout = () => {
  const { nickname, setNickname } = useUser();
  const { permanentPeerId, userProfile, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    peerId, connectToPeer, sendData, data, isConnected, conn,
    localStream, remoteStream, isCallActive, startCall, startDirectCall, endCall, toggleMedia,
    screenStream, remoteScreenStream, isScreenSharing, startScreenShare, stopScreenShare,
    incomingConn, acceptConnection, rejectConnection,
    connectionState, onManualReconnect
  } = usePeer(permanentPeerId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [remoteNickname, setRemoteNickname] = useState('Friend');
  const [incomingPeerInfo, setIncomingPeerInfo] = useState<{ nickname: string; peerId: string; photo?: string | null; displayName?: string | null } | null>(null);
  const { toast } = useToast();
  const { setSendDataRef, handleReceivedPlaylist } = usePlaylist();

  // Show splash screen only when manually connecting to a peer
  const [isConnecting, setIsConnecting] = useState(false);

  // ── Global call signaling + ringtone ──────────────────────────────
  const [incomingSignalCall, setIncomingSignalCall] = useState<CallRecord | null>(null);
  const [incomingCaller, setIncomingCaller] = useState<any | null>(null);
  const { startRingtone, stopRingtone } = useRingtone();

  const { acceptCall, declineCall } = useCallSignaling({
    currentUserId: userProfile?.id ?? '',
    currentPeerId: permanentPeerId ?? '',
    onIncomingCall: async (call) => {
      setIncomingSignalCall(call);
      startRingtone(); // 🔔 play ringtone
      const { data: callerData } = await supabase
        .from('users').select('*').eq('id', call.caller_id).single();
      if (callerData) setIncomingCaller(callerData);
    },
    onCallAccepted: (call) => {
      // CALLER side: callee accepted → start media call to callee's peer ID
      stopRingtone();
      if (call.callee_peer_id) {
        startDirectCall(call.callee_peer_id, call.type);
      }
    },
    onCallEnded: () => {
      stopRingtone();
      setIncomingSignalCall(null);
      setIncomingCaller(null);
    },
  });

  const handleAcceptSignalCall = async () => {
    if (!incomingSignalCall) return;
    stopRingtone();
    const call = await acceptCall(incomingSignalCall.id);
    setIncomingSignalCall(null);
    setIncomingCaller(null);
    // CALLEE side: start media call back to caller's peer ID
    if (call?.caller_peer_id) {
      startDirectCall(call.caller_peer_id, call.type);
    }
  };

  const handleDeclineSignalCall = async () => {
    if (!incomingSignalCall) return;
    stopRingtone();
    await declineCall(incomingSignalCall.id);
    setIncomingSignalCall(null);
    setIncomingCaller(null);
  };

  // Synchronize nickname from user profile if missing
  useEffect(() => {
    if (userProfile?.displayName && !nickname) {
      console.log("[AppLayout] Syncing nickname from profile:", userProfile.displayName);
      setNickname(userProfile.displayName);
    }
  }, [userProfile, nickname, setNickname]);

  useEffect(() => {
    // Helper for safe storage access
    const safeGet = (key: string) => {
      try { return localStorage.getItem(key); } catch { return null; }
    };
    const safeRemove = (key: string) => {
      try { localStorage.removeItem(key); } catch { }
    };

    const peerIdToConnect = safeGet('peerIdToConnect');
    if (peerIdToConnect && peerId && nickname && !isConnected && !conn) {
      setIsConnecting(true);
      connectToPeer(peerIdToConnect, { nickname });
      safeRemove('peerIdToConnect');

      // Show splash for 5 seconds while connecting
      setTimeout(() => {
        setIsConnecting(false);
      }, 5000);
    }
  }, [peerId, nickname, isConnected, conn, connectToPeer]);

  useEffect(() => {
    if (incomingConn) {
      const nickname = incomingConn.metadata?.nickname || 'A friend';
      const peerId = incomingConn.peer;
      // Optimistically set with just the nickname
      setIncomingPeerInfo({ nickname, peerId });
      // Then try to enrich with Supabase profile
      supabase
        .from('users')
        .select('display_name, photo_url, peer_id')
        .eq('peer_id', peerId)
        .maybeSingle()
        .then(({ data }) => {
          setIncomingPeerInfo({
            nickname: data?.display_name ?? nickname,
            peerId,
            photo: data?.photo_url ?? null,
            displayName: data?.display_name ?? null,
          });
        });
    } else {
      setIncomingPeerInfo(null);
    }
  }, [incomingConn]);

  useEffect(() => {
    // Only send nickname after connection is fully established
    if (isConnected && conn && conn.open && nickname) {
      sendData({ type: 'nickname', payload: nickname });

      // Track recent connection if registered
      if (userProfile?.id) {
        import('@/lib/supabase').then(({ supabase }) => {
          supabase.from('recent_connections').upsert({
            user_id: userProfile.id,
            peer_id: conn.peer,
            nickname: remoteNickname === 'Friend' ? 'Peer' : remoteNickname,
            last_connected_at: new Date().toISOString()
          }, { onConflict: 'user_id,peer_id' }).then(({ error }) => {
            if (error) console.error('Failed to update connection history:', error);
          });
        });
      }
    }
  }, [isConnected, conn?.open, nickname, sendData, userProfile?.id, remoteNickname]);

  const lastProcessedData = useRef<DataType | null>(null);

  useEffect(() => {
    if (data && data !== lastProcessedData.current) {
      lastProcessedData.current = data;

      if (data.type === 'chat') {
        const newMessage: Message = { ...data.payload, sender: 'them', messageType: 'text' };
        setMessages((prev) => [...prev, newMessage]);

        // Enhanced notification system: notify whenever user is away from Chat tab
        if (newMessage.nickname && location.pathname !== '/chat' && location.pathname !== '/watch') {
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
              try {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(`New message from ${newMessage.nickname}`, {
                      body: newMessage.content,
                      icon: '/logo.png', // Optional: Add icon if available
                      badge: '/logo.png' // Optional: Add badge if available
                    });
                  });
                } else {
                  new Notification(`New message from ${newMessage.nickname}`, {
                    body: newMessage.content,
                  });
                }
              } catch (e) {
                console.error("Notification failed:", e);
              }
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
    // Reduced chunk size to 8KB to prevent "message too big" errors
    const CHUNK_SIZE = 8 * 1024;
    const totalChunks = Math.ceil(data.length / CHUNK_SIZE);

    try {
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

      // Send chunks with increased delay
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
        // Increased delay to 50ms to prevent buffer overflow and ensure stability
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error('Error sending file chunks:', error);
      toast({
        title: "Transfer Failed",
        description: "Failed to send file. Please try again.",
        variant: "destructive"
      });
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

  // If we are authenticated but have no nickname yet, show loading instead of null
  if (!nickname && userProfile) {
    return <SplashScreen isVisible={true} />;
  }

  // Final emergency fallback — only null if we truly have no identity
  if (!nickname && !isGuest) {
    return <SplashScreen isVisible={true} />;
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
    disconnectPeer: endCall, // Reusing endCall logic for connection cleanup
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
    connectionState,
    onManualReconnect,
    isScreenSharing,
    startScreenShare,
    stopScreenShare,
    remoteScreenStream
  };

  return (
    <>
      {isConnecting && <SplashScreen isVisible={true} />}


      <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
        {/* Global iOS orb decorations */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="orb w-[420px] h-[420px] bg-[#0A84FF] top-[-10%] left-[-15%]" style={{ opacity: 0.12 }} />
          <div className="orb w-[360px] h-[360px] bg-[#BF5AF2] top-[30%] right-[-10%]" style={{ opacity: 0.10, animationDelay: '2s' }} />
          <div className="orb w-[500px] h-[500px] bg-[#30D158] bottom-[-15%] left-[10%]" style={{ opacity: 0.06, animationDelay: '4s' }} />
        </div>

        {/* Animated page outlet */}
        <main className="flex-grow relative z-10 pb-[83px] pt-3 overflow-y-auto h-screen" style={{ WebkitOverflowScrolling: 'touch' }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.99 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="h-full"
            >
              <Outlet context={context} />
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomNav />

        {/* PWA install prompt — shows on Android & iOS */}
        <PWAInstallPrompt />

        {/* Global friend call modal — fires when anyone calls you via Supabase signaling */}
        <IncomingCallModal
          call={incomingSignalCall}
          caller={incomingCaller}
          onAccept={handleAcceptSignalCall}
          onDecline={handleDeclineSignalCall}
        />

        <CallManager
          localStream={localStream}
          remoteStream={remoteStream}
          isCallActive={isCallActive}
          endCall={endCall}
          toggleMedia={toggleMedia}
          remoteNickname={remoteNickname}
        />

        {/* Enriched connection request dialog */}
        <AlertDialog open={!!incomingConn}>
          <AlertDialogContent className="ios-card mx-4 border border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white text-[17px] font-bold">Incoming Connection</AlertDialogTitle>
            </AlertDialogHeader>

            {/* Requester card */}
            <div
              className="flex items-center gap-4 px-4 py-4 rounded-2xl my-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                {incomingPeerInfo?.photo ? (
                  <img
                    src={incomingPeerInfo.photo}
                    alt={incomingPeerInfo.nickname}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#BF5AF2] flex items-center justify-center">
                    <UserCircle className="h-8 w-8 text-white" />
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#30D158] border-2 border-black" />
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-bold text-white truncate">
                  {incomingPeerInfo?.nickname ?? 'A friend'}
                </p>
                <p className="text-[11px] font-mono text-white/35 truncate uppercase tracking-wide">
                  {incomingPeerInfo?.peerId}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ShieldCheck className="h-3 w-3 text-[#30D158]" />
                  <span className="text-[10px] text-[#30D158] font-semibold">Verified Peer ID</span>
                </div>
              </div>
            </div>

            <p className="text-[13px] text-white/50 text-center">
              <strong className="text-white/80">{incomingPeerInfo?.nickname}</strong> wants to connect with you.
            </p>

            <AlertDialogFooter className="gap-2 mt-2">
              <AlertDialogCancel
                onClick={rejectConnection}
                className="ios-card border-white/10 text-white/70 hover:bg-white/10 rounded-xl flex-1"
              >
                Decline
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={acceptConnection}
                className="bg-[#0A84FF] hover:bg-[#0A84FF]/90 rounded-xl text-white font-semibold flex-1"
              >
                Accept
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default AppLayout;

