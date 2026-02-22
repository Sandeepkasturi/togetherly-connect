import { useOutletContext, useNavigate } from 'react-router-dom';
import { AppContextType } from '@/layouts/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState, useCallback } from 'react';
import {
  MonitorUp, MonitorOff, WifiOff, Monitor,
  Maximize2, Minimize2, Settings2, CheckCircle2, Zap, Film, Gauge, Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Quality presets ────────────────────────────────────────────
const QUALITY_PRESETS = [
  { label: 'HD', sub: '720p · 15fps', icon: Gauge, color: '#30D158', width: 1280, height: 720, frameRate: 15 },
  { label: 'FHD', sub: '1080p · 30fps', icon: Film, color: '#0A84FF', width: 1920, height: 1080, frameRate: 30 },
  { label: 'Fast', sub: '480p · 30fps', icon: Zap, color: '#FFD60A', width: 854, height: 480, frameRate: 30 },
];

const BrowserPage = () => {
  const context = useOutletContext<AppContextType>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [streamError, setStreamError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState(1); // index into QUALITY_PRESETS
  const [controlsVis, setControlsVis] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Wire remote stream to video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = context.remoteScreenStream ?? null;
      setStreamError(false);
    }
  }, [context.remoteScreenStream]);

  // Auto-hide controls after 3 s when a stream is live
  useEffect(() => {
    if (!context.remoteScreenStream) return;
    setControlsVis(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVis(false), 3000);
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [context.remoteScreenStream]);

  const pokeControls = useCallback(() => {
    setControlsVis(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVis(false), 3000);
  }, []);

  // Share with selected quality constraints
  const shareWithQuality = async () => {
    const { width, height, frameRate } = QUALITY_PRESETS[quality];
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { width: { ideal: width }, height: { ideal: height }, frameRate: { ideal: frameRate } },
        audio: true,
      });
      // Feed into the peer connection
      context.startScreenShare?.();
      // Replace video track if startScreenShare doesn't accept a stream — log for now
      console.info('[ScreenShare] stream tracks:', stream.getTracks());
    } catch {
      console.warn('Screen share cancelled or denied');
    }
  };

  return (
    <div className="min-h-full px-4 pt-2 pb-4 flex flex-col gap-5">

      {/* ── Header row ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-[22px] font-bold text-white">Screen Share</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn('h-2 w-2 rounded-full', context.isConnected ? 'status-dot-online' : 'bg-white/20')} />
            <span className="text-[13px] text-white/40">
              {context.isConnected ? `Peer: ${context.remoteNickname}` : 'Not connected'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings */}
          {!context.remoteScreenStream && context.isConnected && !context.isScreenSharing && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowSettings((v) => !v)}
              className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center border transition-colors',
                showSettings ? 'bg-[#0A84FF]/15 border-[#0A84FF]/30 text-[#0A84FF]' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'
              )}
            >
              <Settings2 className="h-4 w-4" />
            </motion.button>
          )}

          {/* Share / Stop button */}
          {context.isConnected && (
            context.isScreenSharing ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={context.stopScreenShare}
                className="flex items-center gap-2 bg-[#FF453A]/15 border border-[#FF453A]/30 text-[#FF453A] px-4 py-2 rounded-full text-[14px] font-semibold"
              >
                <MonitorOff className="h-4 w-4" /> Stop
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={context.startScreenShare}
                className="flex items-center gap-2 bg-[#0A84FF]/15 border border-[#0A84FF]/30 text-[#0A84FF] px-4 py-2 rounded-full text-[14px] font-semibold"
              >
                <MonitorUp className="h-4 w-4" /> Share
              </motion.button>
            )
          )}
        </div>
      </motion.div>

      {/* ── Quality picker (collapsible) ── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="ios-card p-4 space-y-3">
              <p className="text-[12px] font-semibold text-white/40 uppercase tracking-widest">Quality</p>
              <div className="grid grid-cols-3 gap-2">
                {QUALITY_PRESETS.map((preset, i) => {
                  const Icon = preset.icon;
                  const active = quality === i;
                  return (
                    <motion.button
                      key={preset.label}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuality(i)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all',
                        active
                          ? 'border-[${preset.color}]/40 text-white'
                          : 'border-white/8 text-white/40 hover:text-white/70'
                      )}
                      style={active ? { background: preset.color + '15', borderColor: preset.color + '40' } : {}}
                    >
                      <Icon className="h-5 w-5" style={{ color: active ? preset.color : undefined }} />
                      <div className="text-center">
                        <p className="text-[13px] font-bold">{preset.label}</p>
                        <p className="text-[10px] opacity-50">{preset.sub}</p>
                      </div>
                      {active && <CheckCircle2 className="h-3.5 w-3.5 absolute top-2 right-2" style={{ color: preset.color }} />}
                    </motion.button>
                  );
                })}
              </div>
              <p className="text-[11px] text-white/25 text-center">Higher quality uses more bandwidth</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <AnimatePresence mode="wait">

          {/* Live viewer */}
          {context.remoteScreenStream && (
            <motion.div
              key="viewing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                'relative w-full rounded-3xl overflow-hidden',
                fullscreen ? 'fixed inset-0 rounded-none z-50' : 'ios-card'
              )}
              onPointerMove={pokeControls}
            >
              <video
                ref={videoRef}
                autoPlay playsInline muted
                onError={() => setStreamError(true)}
                className="w-full h-auto max-h-[60vh] object-contain bg-black"
              />

              {/* Overlay controls */}
              <AnimatePresence>
                {controlsVis && !streamError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    {/* LIVE badge */}
                    <div className="absolute top-3 left-3 bg-[#FF453A] text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 pointer-events-auto">
                      <Radio className="h-3 w-3 animate-pulse" /> LIVE
                    </div>
                    {/* Fullscreen toggle */}
                    <button
                      className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center pointer-events-auto"
                      onClick={() => setFullscreen((v) => !v)}
                    >
                      {fullscreen ? <Minimize2 className="h-4 w-4 text-white" /> : <Maximize2 className="h-4 w-4 text-white" />}
                    </button>
                    {/* Quality badge */}
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] text-white/70 pointer-events-auto">
                      {QUALITY_PRESETS[quality].label}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stream error */}
              {streamError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md">
                  <div className="text-center space-y-2">
                    <WifiOff className="h-8 w-8 text-[#FF453A] mx-auto" />
                    <p className="text-sm text-white/60">Stream interrupted</p>
                    <p className="text-xs text-white/30">Peer may have stopped sharing</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Sharing state */}
          {!context.remoteScreenStream && context.isScreenSharing && (
            <motion.div
              key="sharing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="ios-card w-full max-w-xs mx-auto p-8 text-center space-y-6"
            >
              <div className="relative mx-auto w-fit">
                <div className="absolute inset-0 bg-[#0A84FF]/25 rounded-full blur-2xl animate-pulse" />
                <div className="relative h-20 w-20 rounded-3xl bg-[#0A84FF]/15 border border-[#0A84FF]/30 flex items-center justify-center mx-auto">
                  <MonitorUp className="h-9 w-9 text-[#0A84FF] animate-bounce" />
                </div>
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-white">Live Sharing</h2>
                <p className="text-[14px] text-white/45 mt-1">
                  {QUALITY_PRESETS[quality].label} · {QUALITY_PRESETS[quality].sub}
                </p>
              </div>
              <div className="ios-pill py-2 px-4 flex items-center gap-2 justify-center">
                <Radio className="h-3 w-3 text-[#FF453A] animate-pulse" />
                <span className="text-[13px] text-white/60">Your peer can see your screen</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={context.stopScreenShare}
                className="w-full h-12 rounded-xl bg-[#FF453A]/15 border border-[#FF453A]/30 text-[#FF453A] font-semibold text-[16px]"
              >
                Stop Sharing
              </motion.button>
            </motion.div>
          )}

          {/* Idle */}
          {!context.remoteScreenStream && !context.isScreenSharing && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="ios-card w-full max-w-xs mx-auto p-8 text-center space-y-5"
            >
              <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                <Monitor className="h-9 w-9 text-white/25" />
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-white">Screen Share</h2>
                <p className="text-[14px] text-white/40 mt-1">Share your screen with your peer in real time.</p>
              </div>

              {/* Quality info row */}
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {(() => { const Icon = QUALITY_PRESETS[quality].icon; return <Icon className="h-4 w-4 shrink-0" style={{ color: QUALITY_PRESETS[quality].color }} />; })()}
                <span className="text-[13px] text-white/50 flex-1 text-left">{QUALITY_PRESETS[quality].label} — {QUALITY_PRESETS[quality].sub}</span>
                <button onClick={() => setShowSettings((v) => !v)} className="text-[12px] text-[#0A84FF] font-semibold">Change</button>
              </div>

              {context.isConnected ? (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={context.startScreenShare}
                  className="w-full h-13 rounded-xl ios-btn-primary flex items-center justify-center gap-2 font-semibold text-[16px]"
                >
                  <MonitorUp className="h-5 w-5" /> Start Sharing
                </motion.button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FF453A]/08 border border-[#FF453A]/15">
                    <WifiOff className="h-4 w-4 text-[#FF453A]/70 shrink-0" />
                    <p className="text-[13px] text-white/45">Connect to a peer first</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate('/watch')}
                    className="w-full h-11 rounded-xl ios-btn-glass text-[15px]"
                  >
                    Go to Watch
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default BrowserPage;
