import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const VAPID_PUBLIC_KEY = 'BDxRolxe8GO9Y6tjKWhjztr9Yxy4_eD-WtB8vGa7hKS0rXJRtcZbOGV99tSDiBnf0XI3XOth9PQOYOdtMljla9g';

export interface PushNotificationState {
    permission: NotificationPermission;
    isSupported: boolean;
    requestPermission: () => Promise<boolean>;
    sendLocalNotification: (title: string, body: string, icon?: string, url?: string) => void;
    subscribeToPush: (userId: string) => Promise<boolean>;
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * usePushNotifications — Handles Web Push notification permission and
 * remote VAPID subscriptions.
 */
export const usePushNotifications = (): PushNotificationState => {
    const isSupported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;

    const [permission, setPermission] = useState<NotificationPermission>(
        isSupported ? Notification.permission : 'denied'
    );

    useEffect(() => {
        if (!isSupported) return;
        setPermission(Notification.permission);
    }, [isSupported]);

    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!isSupported) return false;
        const result = await Notification.requestPermission();
        setPermission(result);
        return result === 'granted';
    }, [isSupported]);

    const subscribeToPush = useCallback(async (userId: string): Promise<boolean> => {
        if (!isSupported || permission !== 'granted') return false;

        try {
            let registration = await navigator.serviceWorker.getRegistration();
            if (!registration || (registration.active && !registration.active.scriptURL.endsWith('push-sw.js'))) {
                registration = await navigator.serviceWorker.register('/push-sw.js');
            }
            await navigator.serviceWorker.ready;

            // Safety fallback if registration is somehow undefined
            if (!registration) {
                registration = await navigator.serviceWorker.ready;
            }

            // Check for existing subscription
            let subscription = await (registration as any).pushManager.getSubscription();

            if (!subscription) {
                // Create new subscription
                subscription = await (registration as any).pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });
            }

            if (subscription) {
                // Save subscription to database
                const { error } = await supabase
                    .from('push_subscriptions')
                    .upsert({
                        user_id: userId,
                        subscription: subscription.toJSON(),
                    }, { onConflict: 'user_id,subscription' });

                if (error) {
                    console.error('[Push] Failed to save subscription to DB:', error);
                    return false;
                }
                console.log('[Push] Subscription saved successfully');
                return true;
            }
            return false;
        } catch (err) {
            console.error('[Push] Subscription failed:', err);
            return false;
        }
    }, [isSupported, permission]);

    const sendLocalNotification = useCallback(
        (title: string, body: string, icon = '/icons/icon-192x192.png', url?: string) => {
            if (!isSupported || permission !== 'granted') return;

            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then((reg) => {
                    reg.showNotification(title, {
                        body,
                        icon,
                        badge: '/icons/icon-96x96.png',
                        vibrate: [100, 50, 100],
                        data: { url },
                    } as NotificationOptions);
                });
            } else {
                const n = new Notification(title, { body, icon });
                if (url) n.onclick = () => { window.focus(); window.location.href = url; };
            }
        },
        [isSupported, permission]
    );

    return { permission, isSupported, requestPermission, sendLocalNotification, subscribeToPush };
};

