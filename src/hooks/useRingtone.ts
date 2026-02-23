/**
 * useRingtone — plays a synthetic ringtone using Web Audio API.
 * No external files needed.
 */
import { useRef, useCallback, useEffect } from 'react';

export function useRingtone() {
    const ctxRef = useRef<AudioContext | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isPlayingRef = useRef(false);

    const playBeep = useCallback(() => {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;

        if (!ctxRef.current || ctxRef.current.state === 'closed') {
            ctxRef.current = new AudioCtx();
        }
        const ctx = ctxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const playTone = (freq: number, startTime: number, duration: number, vol = 0.18) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
            gain.gain.setValueAtTime(vol, startTime + duration - 0.04);
            gain.gain.linearRampToValueAtTime(0, startTime + duration);
            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        const t = ctx.currentTime;
        // Two-tone ring: 480Hz + 620Hz (classic phone ring)
        playTone(480, t, 0.4);
        playTone(620, t, 0.4);
        playTone(480, t + 0.45, 0.4);
        playTone(620, t + 0.45, 0.4);
    }, []);

    const start = useCallback(() => {
        if (isPlayingRef.current) return;
        isPlayingRef.current = true;
        playBeep();
        intervalRef.current = setInterval(playBeep, 3000);
    }, [playBeep]);

    const stop = useCallback(() => {
        isPlayingRef.current = false;
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (ctxRef.current && ctxRef.current.state !== 'closed') {
            ctxRef.current.close().catch(() => { });
            ctxRef.current = null;
        }
    }, []);

    // Safety: stop on unmount
    useEffect(() => () => stop(), [stop]);

    return { startRingtone: start, stopRingtone: stop };
}
