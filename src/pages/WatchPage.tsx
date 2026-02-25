import { useOutletContext, useNavigate } from 'react-router-dom';
import { AppContextType } from '@/layouts/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedVideoPlayer from '@/components/EnhancedVideoPlayer';
import YouTubeSearch from '@/components/YouTubeSearch';
import PeerConnection from '@/components/PeerConnection';
import { useState, useEffect } from 'react';
import { AudioWaveform, Search, Link as LinkIcon, Tv, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'watch' | 'discover' | 'connect';

const spring = { type: 'spring' as const, stiffness: 420, damping: 32 };

const WatchPage = () => {
  const context = useOutletContext<AppContextType>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('watch');
  const [showWizard, setShowWizard] = useState(!context.isConnected);

  useEffect(() => {
    setShowWizard(!context.isConnected);
  }, [context.isConnected]);

  // If a video is playing, navigate to theater
  const handleVideoSelect = (id: string) => {
    context.handleVideoSelect(id);
  };

  const TABS: { key: Tab; icon: typeof Tv; label: string }[] = [
    { key: 'watch', icon: Tv, label: 'Watch' },
    { key: 'discover', icon: Search, label: 'Discover' },
    { key: 'connect', icon: LinkIcon, label: 'Connect' },
  ];

  return (
    <div className="flex flex-col gap-4">

      {/* ── Premium Connection Status Indicator ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-4 pb-2"
      >
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowWizard(!showWizard)}
          className={cn(
            'relative overflow-hidden group px-5 py-4 rounded-[32px] border transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)]',
            context.isConnected
              ? 'bg-[#30D158]/5 border-[#30D158]/20 shadow-[#30D158]/5'
              : 'bg-white/[0.03] border-white/[0.08] shadow-black/40'
          )}
        >
          {/* Animated Background Glow */}
          <div className={cn(
            "absolute -top-10 -right-10 h-32 w-32 rounded-full blur-[40px] opacity-20 transition-opacity",
            context.isConnected ? "bg-[#30D158]" : "bg-[#0A84FF]"
          )} />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={cn(
                  "h-10 w-10 rounded-[14px] flex items-center justify-center border transition-all duration-500",
                  context.isConnected
                    ? "bg-[#30D158]/20 border-[#30D158]/30 text-[#30D158]"
                    : "bg-white/10 border-white/20 text-white/40"
                )}>
                  <LinkIcon className="h-5 w-5" />
                </div>
                {context.isConnected && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#30D158] border-2 border-[#0A0A0F]"
                  />
                )}
              </div>

              <div className="space-y-0.5">
                <p className={cn(
                  "text-[15px] font-black tracking-tight",
                  context.isConnected ? "text-white" : "text-white/60"
                )}>
                  {context.isConnected ? "Connection active" : "Standalone mode"}
                </p>
                <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.1em]">
                  {context.isConnected
                    ? `Streaming with ${context.remoteNickname}`
                    : "Tap to sync with a friend"}
                </p>
              </div>
            </div>

            <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
              {showWizard
                ? <ChevronUp className="h-4 w-4 text-white/40" />
                : <ChevronDown className="h-4 w-4 text-white/40" />
              }
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Expandable connection wizard */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden px-4 mb-3"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modern Liquid Glass Tab Bar ── */}
      <div className="px-4 mb-4">
        <div className="relative p-1.5 rounded-[24px] bg-white/[0.04] border border-white/[0.05] flex items-center gap-1 shadow-2xl backdrop-blur-md">
          {TABS.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "relative flex-1 py-2.5 rounded-[18px] text-[13px] font-black uppercase tracking-wider transition-all duration-300",
                tab === key ? "text-white" : "text-white/40 hover:text-white/60"
              )}
            >
              {tab === key && (
                <motion.div
                  layoutId="watch-tab-glow"
                  className="absolute inset-0 bg-white/[0.08] rounded-[18px] border border-white/10"
                  style={{ boxShadow: '0 0 15px rgba(255,255,255,0.05)' }}
                  transition={spring}
                />
              )}
              <div className="relative z-10 flex items-center justify-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="px-4 pb-12">
        <AnimatePresence mode="wait">

          {tab === 'watch' && (
            <motion.div
              key="watch"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="space-y-4"
            >
              {context.selectedVideoId ? (
                <div className="ios-card overflow-hidden aspect-video w-full">
                  <EnhancedVideoPlayer
                    videoId={context.selectedVideoId}
                    sendData={context.sendData}
                    playerData={context.playerSyncData}
                    isConnected={context.isConnected}
                    onPlayingStateChange={() => { }}
                    playerId="watch-player-mobile"
                  />
                </div>
              ) : (
                <motion.div
                  className="relative group p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] flex flex-col items-center justify-center gap-6 cursor-pointer overflow-hidden shadow-2xl"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTab('discover')}
                >
                  <div className="absolute inset-x-0 -top-20 h-40 bg-[#0A84FF]/10 blur-[60px] rounded-full opacity-50" />

                  <div className="relative">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                      className="relative h-24 w-24 rounded-[32px] bg-gradient-to-tr from-[#0A84FF]/20 to-[#BF5AF2]/20 border border-white/10 flex items-center justify-center shadow-2xl"
                    >
                      <Tv className="h-10 w-10 text-white" />
                      <div className="absolute inset-0 bg-white/10 rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  </div>

                  <div className="text-center relative z-10 space-y-1">
                    <p className="text-[20px] font-black text-white tracking-tight">Ready to watch?</p>
                    <p className="text-[14px] font-bold text-white/30 uppercase tracking-widest">Select a video to begin</p>
                  </div>

                  <div className="ios-pill px-6 py-3 bg-[#0A84FF]/10 border-[#0A84FF]/20 flex items-center gap-2 group-hover:bg-[#0A84FF]/20 transition-all">
                    <Search className="h-4 w-4 text-[#0A84FF]" />
                    <span className="text-[14px] text-[#0A84FF] font-black uppercase tracking-tight">Browse YouTube</span>
                  </div>
                </motion.div>
              )}

              {context.isConnected && (
                <div className="ios-card p-3 flex items-center gap-2">
                  <AudioWaveform className="h-4 w-4 text-[#30D158] shrink-0" />
                  <span className="text-[13px] text-white/60">Synced with <strong className="text-white">{context.remoteNickname}</strong></span>
                </div>
              )}
            </motion.div>
          )}

          {tab === 'discover' && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            >
              <YouTubeSearch
                onVideoSelect={handleVideoSelect}
                isConnected={context.isConnected}
              />
            </motion.div>
          )}

          {tab === 'connect' && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="ios-card p-4"
            >
              <PeerConnection
                peerId={context.peerId}
                connectToPeer={context.connectToPeer}
                isConnected={context.isConnected}
                myNickname={context.myNickname}
                remoteNickname={context.remoteNickname}
                sendData={context.sendData}
                startCall={context.startCall}
                disconnectPeer={context.disconnectPeer}
                isCallActive={context.isCallActive}
                connectionState={context.connectionState}
                onManualReconnect={context.onManualReconnect}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default WatchPage;
