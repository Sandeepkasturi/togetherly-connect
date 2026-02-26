import { useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useShortsTelemetry = (videoId: string | null) => {
    const { userProfile } = useAuth();
    const startTimeRef = useRef<number>(Date.now());
    const likedRef = useRef<boolean>(false);
    const hasRecordedRef = useRef<boolean>(false);

    // Reset telemetry when video changes
    useEffect(() => {
        if (!videoId) return;

        startTimeRef.current = Date.now();
        likedRef.current = false;
        hasRecordedRef.current = false;

        return () => {
            recordTelemetry(videoId);
        };
    }, [videoId]);

    const toggleLike = () => {
        likedRef.current = !likedRef.current;
        return likedRef.current;
    };

    const recordTelemetry = async (idToRecord: string) => {
        if (!userProfile?.id || !idToRecord || hasRecordedRef.current) return;

        hasRecordedRef.current = true;
        const watchTimeMs = Date.now() - startTimeRef.current;
        const skipped = watchTimeMs < 3000; // Considered skipped if watched less than 3 seconds

        try {
            await supabase.from('youtube_shorts_interactions').insert({
                user_id: userProfile.id,
                video_id: idToRecord,
                watch_time_ms: watchTimeMs,
                liked: likedRef.current,
                skipped: skipped,
            });
        } catch (error) {
            console.error('Failed to record telemetry:', error);
        }
    };

    return {
        toggleLike,
        get isLiked() { return likedRef.current; }
    };
};
