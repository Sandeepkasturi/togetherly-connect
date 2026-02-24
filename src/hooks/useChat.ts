import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export interface ChatMessage {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    type: 'text' | 'image' | 'system';
    read_at: string | null;
    created_at: string;
}

interface UseChatOptions {
    currentUserId: string;
    friendId: string;
}

export function useChat({ currentUserId, friendId }: UseChatOptions) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    // Fetch conversation history
    const fetchHistory = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(
                `and(sender_id.eq.${currentUserId},receiver_id.eq.${friendId}),` +
                `and(sender_id.eq.${friendId},receiver_id.eq.${currentUserId})`
            )
            .order('created_at', { ascending: true })
            .limit(200);

        if (!error && data) setMessages(data as ChatMessage[]);
        setLoading(false);
    }, [currentUserId, friendId]);

    // Subscribe to new messages in real-time
    useEffect(() => {
        if (!currentUserId || !friendId) return;
        fetchHistory();

        const channelName = `chat:${[currentUserId, friendId].sort().join('_')}`;
        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${currentUserId}`,
                },
                (payload) => {
                    const msg = payload.new as ChatMessage;
                    if (msg.sender_id === friendId) {
                        setMessages(prev => [...prev, msg]);
                        // Auto-mark as read since chat is open
                        supabase.from('messages')
                            .update({ read_at: new Date().toISOString() })
                            .eq('id', msg.id);
                    }
                }
            )
            .subscribe();

        channelRef.current = channel;
        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId, friendId, fetchHistory]);

    // Send a message
    const sendMessage = useCallback(async (content: string): Promise<boolean> => {
        if (!content.trim()) return false;
        setSending(true);
        const msg: Partial<ChatMessage> = {
            sender_id: currentUserId,
            receiver_id: friendId,
            content: content.trim(),
            type: 'text',
        };
        const { data, error } = await supabase.from('messages').insert(msg).select().single();
        if (!error && data) {
            setMessages(prev => [...prev, data as ChatMessage]);

            // Create notification record in DB
            await supabase.from('notifications').insert({
                user_id: friendId,
                type: 'chat',
                title: 'New Message',
                body: content.trim().slice(0, 100),
                data: { sender_id: currentUserId },
                read: false,
            });

            // Trigger remote push notification
            import('@/lib/push').then(({ sendPushNotification }) => {
                sendPushNotification({
                    userId: friendId,
                    title: 'New Message',
                    body: content.trim().slice(0, 100),
                    url: `/chat/${currentUserId}`
                });
            });
        }
        setSending(false);
        return !error;
    }, [currentUserId, friendId]);

    // Mark all messages from friend as read
    const markAllRead = useCallback(async () => {
        await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('sender_id', friendId)
            .eq('receiver_id', currentUserId)
            .is('read_at', null);
    }, [currentUserId, friendId]);

    return { messages, loading, sending, sendMessage, markAllRead };
}

// ── Unread counts for ALL friends (used in FriendsPage badge) ──
export async function getUnreadCounts(currentUserId: string): Promise<Record<string, number>> {
    const { data, error } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', currentUserId)
        .is('read_at', null);

    if (error || !data) return {};
    return data.reduce<Record<string, number>>((acc, row) => {
        acc[row.sender_id] = (acc[row.sender_id] ?? 0) + 1;
        return acc;
    }, {});
}
