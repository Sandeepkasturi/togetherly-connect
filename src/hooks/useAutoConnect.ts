import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useAutoConnect(
    connectToPeer: (id: string, metadata: { nickname: string }) => void,
    currentConn: any,
    nickname: string
) {
    const { userProfile } = useAuth();
    const hasAttempted = useRef(false);

    useEffect(() => {
        // Only attempt auto-connect once per session when there's no active connection
        if (!userProfile || currentConn || hasAttempted.current) return;

        const attemptAutoConnect = async () => {
            hasAttempted.current = true;
            try {
                // Fetch friends that the user is following
                const { data: follows, error } = await supabase
                    .from('follows')
                    .select(`
            following_id,
            users!follows_following_id_fkey (id, display_name, peer_id, is_online)
          `)
                    .eq('follower_id', userProfile.id);

                if (error) throw error;

                // Find the first friend who is online and has a valid peer ID
                const onlineFriend = follows?.find((f: any) => {
                    const u = Array.isArray(f.users) ? f.users[0] : f.users;
                    return u?.is_online && u?.peer_id;
                });

                if (onlineFriend) {
                    const u = Array.isArray(onlineFriend.users) ? onlineFriend.users[0] : onlineFriend.users;
                    if (u?.peer_id) {
                        console.log('[AutoConnect] Auto-connecting to online friend:', u.display_name);
                        connectToPeer(u.peer_id, { nickname });
                    }
                }
            } catch (err) {
                console.error('[AutoConnect] Failed to verify friends for auto-connect:', err);
            }
        };

        // Short delay to ensure peer initialization is complete before connecting
        const timer = setTimeout(attemptAutoConnect, 2500);
        return () => clearTimeout(timer);
    }, [userProfile, currentConn, nickname, connectToPeer]);
}
