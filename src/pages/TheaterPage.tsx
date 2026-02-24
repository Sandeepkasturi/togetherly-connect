import { useOutletContext, useNavigate } from 'react-router-dom';
import { AppContextType } from '@/layouts/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedVideoPlayer from '@/components/EnhancedVideoPlayer';
import { ArrowLeft, MessageCircle, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import YouTubeSearch from '@/components/YouTubeSearch';
import PeerConnection from '@/components/PeerConnection';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const spring = { type: 'spring' as const, stiffness: 420, damping: 32 };

const TheaterPage = () => {
  const context = useOutletContext<AppContextType>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!context.selectedVideoId) navigate('/watch');
  }, [context.selectedVideoId, navigate]);

  useEffect(() => {
    const lastMsg = context.messages[context.messages.length - 1];
    if (lastMsg?.sender === 'them' && activeTab !== 'chat') {
      setUnreadCount((n) => n + 1);
    }
  }, [context.messages, activeTab]);

  useEffect(() => {
    if (activeTab === 'discover') setUnreadCount(0);
  }, [activeTab]);

  if (!context.selectedVideoId) return null;

  return (
    <div className="fixed inset-0 flex flex-col bg-black z-[60]" style={{ top: 0, bottom: 0 }}>

      {/* ── Video player (sticky top) ── */}
      <div className="shrink-0 relative bg-black w-full">
        {/* Back button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/watch')}
          className="absolute top-14 left-3 z-50 h-8 w-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </motion.button>

        {/* Connected badge */}
        {context.isConnected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-14 right-3 z-50"
          >
            <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-[#30D158]/30 px-2.5 py-1.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full status-dot-online" />
              <Users className="h-3 w-3 text-[#30D158]" />
              <span className="text-[11px] text-[#30D158] font-semibold">{context.remoteNickname}</span>
            </div>
          </motion.div>
        )}

        {/* Video */}
        <div className="aspect-video w-full">
          <EnhancedVideoPlayer
            videoId={context.selectedVideoId}
            sendData={context.sendData}
            playerData={context.playerSyncData}
            isConnected={context.isConnected}
            onPlayingStateChange={() => { }}
            playerId="theater-player"
          />
        </div>
      </div>

      {/* ── Tabbed panel below video ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0e]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          {/* iOS segmented tab bar */}
          <TabsList className="shrink-0 flex rounded-none px-3 py-2 bg-black/90 backdrop-blur-xl border-b border-white/[0.07] gap-2 h-auto">
            {[
              { value: 'discover', icon: Search, label: 'Discover' },
              { value: 'connect', icon: Users, label: 'Connect' },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className={cn(
                  'relative flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[13px] font-semibold',
                  'data-[state=active]:text-white data-[state=inactive]:text-white/35',
                  'transition-colors duration-150'
                )}
              >
                {activeTab === value && (
                  <motion.span
                    layoutId="theater-pill"
                    className="absolute inset-0 rounded-xl bg-[#0A84FF]/15 border border-[#0A84FF]/25"
                    transition={spring}
                  />
                )}
                <Icon className="h-3.5 w-3.5 relative z-10" />
                <span className="relative z-10">{label}</span>
                {value === 'discover' && unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px] z-20 rounded-full bg-[#FF453A] border-0"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab content */}
          <TabsContent value="discover" className="flex-1 mt-0 overflow-y-auto p-4">
            <YouTubeSearch
              onVideoSelect={context.handleVideoSelect}
              isConnected={context.isConnected}
            />
          </TabsContent>

          <TabsContent value="connect" className="flex-1 mt-0 overflow-y-auto p-4">
            <div className="ios-card p-4">
              <PeerConnection
                peerId={context.peerId}
                connectToPeer={context.connectToPeer}
                isConnected={context.isConnected}
                myNickname={context.myNickname}
                remoteNickname={context.remoteNickname}
                sendData={context.sendData}
                startCall={context.startCall}
                isCallActive={context.isCallActive}
                connectionState={context.connectionState}
                onManualReconnect={context.onManualReconnect}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TheaterPage;
