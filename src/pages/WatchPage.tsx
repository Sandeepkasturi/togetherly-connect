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
    <div className="flex flex-col min-h-full">

      {/* ── Connection status pill ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="px-4 pt-2 pb-3"
      >
        <div
          className={cn(
            'ios-pill flex items-center gap-2 px-4 py-2.5 w-full justify-between cursor-pointer tap-effect',
            context.isConnected ? 'border-[#30D158]/30' : 'border-white/10'
          )}
          onClick={() => setShowWizard((v) => !v)}
        >
          <div className="flex items-center gap-2.5">
            <span className={cn(
              'h-2.5 w-2.5 rounded-full shrink-0',
              context.isConnected ? 'status-dot-online' : 'bg-white/20'
            )} />
            <span className={cn(
              'text-[14px] font-semibold',
              context.isConnected ? 'text-[#30D158]' : 'text-white/50'
            )}>
              {context.isConnected
                ? `Watching with ${context.remoteNickname}`
                : 'Not connected — tap to connect'}
            </span>
          </div>

          {showWizard
            ? <ChevronUp className="h-4 w-4 text-white/30" />
            : <ChevronDown className="h-4 w-4 text-white/30" />
          }
        </div>
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

      {/* ── iOS Segmented Control ── */}
      <div className="px-4 mb-4">
        <div className="ios-card p-1 flex gap-1">
          {TABS.map(({ key, icon: Icon, label }) => (
            <motion.button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'relative flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[13px] font-semibold transition-colors duration-200',
                tab === key ? 'text-white' : 'text-white/40 hover:text-white/60'
              )}
            >
              {tab === key && (
                <motion.span
                  layoutId="seg-pill"
                  className="absolute inset-0 bg-white/12 rounded-xl"
                  style={{ boxShadow: '0 0 12px rgba(10,132,255,0.2)' }}
                  transition={spring}
                />
              )}
              <Icon className="h-3.5 w-3.5 relative z-10" />
              <span className="relative z-10">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 px-4 pb-4">
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
                  className="ios-card aspect-video w-full flex flex-col items-center justify-center gap-4 cursor-pointer tap-effect"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setTab('discover')}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#0A84FF]/25 rounded-full blur-2xl animate-pulse" />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="relative h-16 w-16 rounded-3xl bg-[#0A84FF]/15 border border-[#0A84FF]/25 flex items-center justify-center"
                    >
                      <Tv className="h-8 w-8 text-[#0A84FF]" />
                    </motion.div>
                  </div>
                  <div className="text-center">
                    <p className="text-[16px] font-bold text-white">No video selected</p>
                    <p className="text-[13px] text-white/40 mt-1">Tap to discover videos</p>
                  </div>
                  <div className="ios-pill px-4 py-2 flex items-center gap-2">
                    <Search className="h-3.5 w-3.5 text-[#0A84FF]" />
                    <span className="text-[13px] text-[#0A84FF] font-semibold">Browse YouTube</span>
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
