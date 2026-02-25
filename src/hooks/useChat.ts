import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export interface ChatMessage {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'voice' | 'system' | 'watch_invite';
    read_at: string | null;
    created_at: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    duration?: number;
    payload?: any;
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

    // Subscribe to new messages and changes in real-time
    useEffect(() => {
        if (!currentUserId || !friendId) return;
        fetchHistory();

        const channelName = `chat:${[currentUserId, friendId].sort().join('_')}`;
        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                },
                (payload: any) => {
                    if (payload.eventType === 'INSERT') {
                        const msg = payload.new as ChatMessage;
                        if (msg.receiver_id === currentUserId && msg.sender_id === friendId) {
                            setMessages(prev => [...prev, msg]);
                            // Auto-mark as read since chat is open
                            supabase.from('messages')
                                .update({ read_at: new Date().toISOString() })
                                .eq('id', msg.id);
                        }
                    } else if (payload.eventType === 'DELETE') {
                        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
                    } else if (payload.eventType === 'UPDATE') {
                        const updated = payload.new as ChatMessage;
                        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
                    }
                }
            )
            .subscribe();

        channelRef.current = channel;
        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId, friendId, fetchHistory]);

    // Internal helper to upload file
    const uploadFile = async (file: File | Blob, name: string): Promise<string | null> => {
        const fileExt = name.split('.').pop();
        const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('chat-media')
            .upload(filePath, file);

        if (uploadError) {
            console.error('File upload error:', uploadError);
            return null;
        }

        const { data } = supabase.storage.from('chat-media').getPublicUrl(filePath);
        return data.publicUrl;
    };

    // Send a message
    const sendMessage = useCallback(async (
        content: string,
        type: ChatMessage['type'] = 'text',
        attachment?: { file: File | Blob; name: string; size?: number; duration?: number }
    ): Promise<boolean> => {
        if (!content.trim() && !attachment) return false;
        setSending(true);

        let file_url = undefined;
        let file_name = attachment?.name;
        let file_size = attachment?.size;
        let duration = attachment?.duration;

        if (attachment) {
            file_url = await uploadFile(attachment.file, attachment.name);
            if (!file_url) {
                setSending(false);
                return false;
            }
        }

        const dbMsg: Partial<ChatMessage> = {
            sender_id: currentUserId,
            receiver_id: friendId,
            content: content.trim() || (type === 'image' ? 'Sent an image' : type === 'voice' ? 'Voice message' : 'Sent a file'),
            type,
            file_url,
            file_name,
            file_size,
            duration,
        };

        const { data, error } = await supabase.from('messages').insert(dbMsg).select().single();

        if (error) {
            console.error('Failed to insert message into DB:', error);
            setSending(false);
            return false;
        }

        if (data) {
            setMessages(prev => [...prev, data as ChatMessage]);

            // Create notification record in DB (fire and forget)
            supabase.from('notifications').insert({
                user_id: friendId,
                type: 'chat',
                title: 'New Message',
                body: dbMsg.content?.slice(0, 100),
                data: { sender_id: currentUserId },
                read: false,
            }).then(({ error }) => {
                if (error) console.error('Failed to create notification:', error);
            });

            // Trigger remote push notification (fire and forget)
            import('@/lib/push').then(({ sendPushNotification }) => {
                sendPushNotification({
                    userId: friendId,
                    title: 'New Message',
                    body: dbMsg.content?.slice(0, 100),
                    url: `/chat/${currentUserId}`
                }).catch(e => console.error('Push notification failed:', e));
            }).catch(e => console.error('Push module load failed:', e));
        }

        setSending(false);
        return true;
    }, [currentUserId, friendId]);

    // Delete a message
    const deleteMessage = useCallback(async (messageId: string) => {
        const { error } = await supabase.from('messages').delete().eq('id', messageId);
        if (!error) {
            setMessages(prev => prev.filter(m => m.id !== messageId));
        }
    }, []);

    // Clear entire chat
    const clearChat = useCallback(async () => {
        const { error } = await supabase
            .from('messages')
            .delete()
            .or(
                `and(sender_id.eq.${currentUserId},receiver_id.eq.${friendId}),` +
                `and(sender_id.eq.${friendId},receiver_id.eq.${currentUserId})`
            );
        if (!error) {
            setMessages([]);
        }
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

    return { messages, loading, sending, sendMessage, deleteMessage, clearChat, markAllRead };
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
