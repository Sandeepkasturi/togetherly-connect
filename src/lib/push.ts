import { supabase } from './supabase';

interface PushPayload {
    userId: string;
    title: string;
    body: string;
    icon?: string;
    url?: string;
}

/**
 * sendPushNotification — Utility to invoke the Supabase Edge Function
 * for sending a remote Web Push notification via VAPID.
 */
export async function sendPushNotification({ userId, title, body, icon, url }: PushPayload) {
    try {
        console.log('[Push] Sending notification to userId:', userId);
        const { data, error } = await supabase.functions.invoke('send-push', {
            body: { userId, title, body, icon, url },
        });

        if (error) {
            console.warn('[Push] Edge Function error:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('[Push] Failed to invoke send-push:', err);
        return false;
    }
}
