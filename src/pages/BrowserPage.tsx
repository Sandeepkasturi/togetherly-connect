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
    <div className="flex flex-col px-4 pt-4 pb-12 gap-5">

      {/* ── Status Matrix ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between bg-white/[0.03] backdrop-blur-3xl border border-white/[0.05] px-6 py-5 rounded-[32px] shadow-2xl"
      >
        <div className="space-y-1">
          <h1 className="text-[24px] font-black text-white tracking-tight leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Screen Mirror
          </h1>
          <div className="flex items-center gap-2">
            <div className={cn('h-2 w-2 rounded-full', context.isConnected ? 'bg-[#30D158] animate-pulse glow-green' : 'bg-white/10')} />
            <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">
              {context.isConnected ? `Remote Node: ${context.remoteNickname}` : 'Satellite Offline'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Settings Trigger */}
          {!context.remoteScreenStream && context.isConnected && !context.isScreenSharing && (
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSettings((v) => !v)}
              className={cn(
                'h-11 w-11 rounded-[14px] flex items-center justify-center transition-all duration-500 shadow-xl',
                showSettings ? 'bg-[#0A84FF] text-white' : 'bg-white/5 border border-white/10 text-white/40'
              )}
            >
              <Settings2 className="h-5 w-5" />
            </motion.button>
          )}

          {/* Core Action Button */}
          {context.isConnected && (
            context.isScreenSharing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={context.stopScreenShare}
                className="flex items-center gap-2.5 bg-[#FF453A] text-white px-6 py-3 rounded-full text-[13px] font-black uppercase tracking-widest shadow-lg shadow-[#FF453A]/20"
              >
                <MonitorOff className="h-4 w-4" /> Termination
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={context.startScreenShare}
                className="flex items-center gap-2.5 bg-[#0A84FF] text-white px-6 py-3 rounded-full text-[13px] font-black uppercase tracking-widest shadow-lg shadow-[#0A84FF]/20"
              >
                <MonitorUp className="h-4 w-4" /> Broadcast
              </motion.button>
            )
          )}
        </div>
      </motion.div>

      {/* ── Neural Quality Selectors ── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
          >
            <div className="rounded-[32px] bg-white/[0.03] border border-white/[0.05] p-6 backdrop-blur-3xl shadow-2xl space-y-4">
              <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] px-1">Signal Fidelity</p>
              <div className="grid grid-cols-3 gap-3">
                {QUALITY_PRESETS.map((preset, i) => {
                  const Icon = preset.icon;
                  const active = quality === i;
                  return (
                    <motion.button
                      key={preset.label}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuality(i)}
                      className={cn(
                        'relative flex flex-col items-center gap-3 p-4 rounded-[24px] border transition-all duration-500 overflow-hidden',
                        active ? 'border-transparent shadow-2xl' : 'border-white/[0.05] bg-white/[0.02] text-white/40'
                      )}
                      style={active ? {
                        background: `linear-gradient(135deg, ${preset.color}20 0%, ${preset.color}05 100%)`,
                        borderColor: `${preset.color}40`
                      } : {}}
                    >
                      {active && (
                        <motion.div
                          layoutId="quality-glow"
                          className="absolute inset-0 bg-white/[0.02] animate-pulse"
                        />
                      )}
                      <div className={cn(
                        "h-12 w-12 rounded-[16px] flex items-center justify-center shadow-inner transition-colors duration-500",
                        active ? "bg-white/10" : "bg-white/5"
                      )}>
                        <Icon className="h-6 w-6" style={{ color: active ? preset.color : undefined }} />
                      </div>
                      <div className="text-center relative z-10">
                        <p className={cn("text-[14px] font-black uppercase tracking-tight", active ? "text-white" : "text-white/40")}>{preset.label}</p>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-0.5">{preset.sub.split(' · ')[0]}</p>
                      </div>
                      {active && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle2 className="h-4 w-4 absolute top-3 right-3" style={{ color: preset.color }} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
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

          {/* Sharing Spectrum (Active) */}
          {!context.remoteScreenStream && context.isScreenSharing && (
            <motion.div
              key="sharing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm mx-auto p-10 rounded-[40px] bg-white/[0.03] border border-white/[0.05] shadow-[0_40px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl text-center space-y-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0A84FF] to-transparent animate-shimmer" />

              <div className="relative mx-auto w-fit">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 bg-[#0A84FF] rounded-full blur-[40px]"
                />
                <div className="relative h-24 w-24 rounded-[28px] bg-gradient-to-br from-white/10 to-transparent border border-white/20 flex items-center justify-center mx-auto shadow-2xl">
                  <MonitorUp className="h-10 w-10 text-[#0A84FF] animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-[28px] font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Signal Active</h2>
                <div className="flex items-center justify-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#0A84FF]/10 text-[#0A84FF] text-[10px] font-black uppercase tracking-widest border border-[#0A84FF]/20">
                    {QUALITY_PRESETS[quality].label} HD
                  </span>
                  <span className="text-white/20 font-black text-[10px] uppercase tracking-widest">•</span>
                  <span className="text-white/40 font-black text-[10px] uppercase tracking-widest">{QUALITY_PRESETS[quality].sub.split(' · ')[1]}</span>
                </div>
              </div>

              <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 flex items-center gap-3 justify-center">
                <div className="w-2 h-2 rounded-full bg-[#FF453A] animate-ping" />
                <span className="text-[12px] font-black text-white/40 uppercase tracking-[0.15em]">Streaming to Peer</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={context.stopScreenShare}
                className="w-full h-14 rounded-[20px] bg-[#FF453A] text-white font-black uppercase tracking-widest text-[14px] shadow-lg shadow-[#FF453A]/20"
              >
                Terminate Link
              </motion.button>
            </motion.div>
          )}

          {/* Idle Terminal */}
          {!context.remoteScreenStream && !context.isScreenSharing && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm mx-auto p-10 rounded-[40px] bg-white/[0.03] border border-white/[0.05] shadow-[0_40px_100px_rgba(0,0,0,0.4)] backdrop-blur-3xl text-center space-y-8"
            >
              <div className="h-24 w-24 rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-2xl group overflow-hidden">
                <Monitor className="h-10 w-10 text-white/20 group-hover:text-[#0A84FF] transition-colors duration-500" />
              </div>

              <div className="space-y-2">
                <h2 className="text-[28px] font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Screen Mirror</h2>
                <p className="text-[14px] font-bold text-white/30 uppercase tracking-[0.15em]">Sync your view with peers</p>
              </div>

              {/* Quality Configuration Summary */}
              <motion.div
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-4 p-4 rounded-[22px] bg-white/5 border border-white/10 shadow-inner group cursor-pointer transition-all"
              >
                <div className="h-10 w-10 rounded-[14px] flex items-center justify-center bg-white/5 shadow-xl transition-transform group-hover:scale-110">
                  {(() => { const Icon = QUALITY_PRESETS[quality].icon; return <Icon className="h-5 w-5" style={{ color: QUALITY_PRESETS[quality].color }} />; })()}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-black text-white/60 tracking-tight uppercase">Quality: {QUALITY_PRESETS[quality].label}</p>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-0.5">{QUALITY_PRESETS[quality].sub}</p>
                </div>
                <Settings2 className="h-4 w-4 text-white/10 group-hover:text-[#0A84FF] transition-colors" />
              </motion.div>

              {context.isConnected ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={context.startScreenShare}
                  className="w-full h-15 rounded-[22px] bg-[#0A84FF] text-white flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[15px] shadow-2xl shadow-[#0A84FF]/30"
                >
                  <MonitorUp className="h-5 w-5" /> Initiate Link
                </motion.button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-[22px] bg-[#FF453A]/10 border border-[#FF453A]/20 shadow-inner">
                    <WifiOff className="h-5 w-5 text-[#FF453A] shrink-0" />
                    <p className="text-[12px] font-black text-[#FF453A]/80 uppercase tracking-widest text-left">Peer Connection Offline</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/watch')}
                    className="w-full h-13 rounded-[20px] bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-widest text-[13px] shadow-xl"
                  >
                    Return to Nexus
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
