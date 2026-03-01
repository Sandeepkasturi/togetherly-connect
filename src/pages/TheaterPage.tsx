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

      {/* ── Immersive Controls Overlay ── */}
      <div className="shrink-0 relative bg-black w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Elite Back Navigation */}
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/watch')}
          className="absolute top-14 left-4 z-50 h-10 w-10 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-2xl transition-all"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </motion.button>

        {/* Status Intelligence Island */}
        {context.isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-14 right-4 z-50"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl">
              <div className="relative">
                <div className="h-2 w-2 rounded-full bg-[#30D158] animate-pulse glow-green" />
              </div>
              <span className="text-[11px] font-black text-white/80 uppercase tracking-widest">{context.remoteNickname}</span>
              <div className="h-4 w-[1px] bg-white/10 mx-1" />
              <Users className="h-3.5 w-3.5 text-[#0A84FF]" />
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

      {/* ── Dynamic Control Panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0F] relative">
        {/* Background Atmosphere */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#0A84FF]/5 to-transparent pointer-events-none" />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full relative z-10">
          {/* Liquid Glass Navigation */}
          <div className="shrink-0 px-6 py-4">
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/[0.05] p-1.5 rounded-[24px] flex gap-1 shadow-2xl">
              {[
                { value: 'discover', icon: Search, label: 'Discover' },
                { value: 'connect', icon: Users, label: 'Connect' },
              ].map(({ value, icon: Icon, label }) => {
                const isActive = activeTab === value;
                return (
                  <button
                    key={value}
                    onClick={() => setActiveTab(value)}
                    className={cn(
                      "relative flex-1 flex items-center justify-center gap-2.5 py-3 rounded-[18px] transition-all duration-500",
                      isActive ? "text-white" : "text-white/30 hover:text-white/50"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="theater-nav-bg"
                        className="absolute inset-0 bg-[#0A84FF] rounded-[18px] shadow-[0_8px_20px_rgba(10,132,255,0.3)]"
                        transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                      />
                    )}
                    <Icon className={cn("h-4 w-4 relative z-10 transition-transform duration-500", isActive && "scale-110")} />
                    <span className="text-[13px] font-black uppercase tracking-widest relative z-10">{label}</span>

                    {value === 'discover' && unreadCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 h-5 w-5 bg-[#FF453A] rounded-full flex items-center justify-center text-[10px] font-black border-2 border-[#0A0A0F] z-20 shadow-lg shadow-[#FF453A]/20"
                      >
                        {unreadCount}
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <TabsContent value="discover" className="flex-1 mt-0 overflow-y-auto p-4">
            <YouTubeSearch
              onVideoSelect={context.handleVideoSelect}
              isConnected={context.isConnected}
            />
          </TabsContent>

          <TabsContent value="connect" className="flex-1 mt-0 overflow-y-auto px-4 pb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[32px] bg-white/[0.03] border border-white/[0.05] p-6 backdrop-blur-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0A84FF]/5 blur-[60px] rounded-full" />
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
                disconnectPeer={context.disconnectPeer}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TheaterPage;
