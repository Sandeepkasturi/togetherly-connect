/**
 * useRingtone — plays a synthetic ringtone using Web Audio API.
 * No external files needed.
 */
import { useRef, useCallback, useEffect } from 'react';

export function useRingtone() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const retryRef = useRef<boolean>(false);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        retryRef.current = false;
        document.removeEventListener('click', handleUserInteraction);
    }, []);

    const handleUserInteraction = useCallback(() => {
        if (retryRef.current && audioRef.current?.paused) {
            console.log('[useRingtone] Retrying playback after user interaction');
            audioRef.current?.play().catch(e => console.error('[useRingtone] Retry failed:', e));
            retryRef.current = false;
            document.removeEventListener('click', handleUserInteraction);
        }
    }, [stop]);

    const start = useCallback(() => {
        if (!audioRef.current) {
            // Using ringtone.mp3 for incoming calls
            audioRef.current = new Audio('/ringtone.mp3');
            audioRef.current.loop = true;
        }

        audioRef.current.play().catch(err => {
            console.warn('[useRingtone] Play blocked, waiting for interaction...', err);
            retryRef.current = true;
            document.addEventListener('click', handleUserInteraction, { once: true });
        });
    }, [handleUserInteraction]);

    // Safety: stop on unmount
    useEffect(() => () => stop(), [stop]);

    return { startRingtone: start, stopRingtone: stop };
}
