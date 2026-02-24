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
                // Fetch any online user that has a valid peer_id
                const { data: onlineUsers, error } = await supabase
                    .from('users')
                    .select('id, display_name, peer_id, is_online')
                    .neq('id', userProfile.id)
                    .eq('is_online', true)
                    .not('peer_id', 'is', null)
                    .limit(1);

                if (error) throw error;

                if (onlineUsers && onlineUsers.length > 0) {
                    const u = onlineUsers[0];
                    console.log('[AutoConnect] Auto-connecting to online user:', u.display_name);
                    connectToPeer(u.peer_id, { nickname });
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
