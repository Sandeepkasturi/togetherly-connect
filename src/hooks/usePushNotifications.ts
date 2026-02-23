import { useState, useEffect, useCallback } from 'react';

export interface PushNotificationState {
    permission: NotificationPermission;
    isSupported: boolean;
    requestPermission: () => Promise<boolean>;
    sendLocalNotification: (title: string, body: string, icon?: string, url?: string) => void;
}

/**
 * usePushNotifications — Handles Web Push notification permission and
 * local notifications in the app (e.g. incoming connection requests).
 *
 * For now this implements LOCAL notifications (shown by the service worker
 * or the Notification API). Full remote push (FCM) can be layered on top.
 */
export const usePushNotifications = (): PushNotificationState => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;

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

    const sendLocalNotification = useCallback(
        (title: string, body: string, icon = '/icons/icon-192x192.png', url?: string) => {
            if (!isSupported || permission !== 'granted') return;

            // Prefer service worker notification (shows even if tab is in background)
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then((reg) => {
                    reg.showNotification(title, {
                        body,
                        icon,
                        badge: '/icons/icon-96x96.png',
                        vibrate: [100, 50, 100],
                        data: { url },
                        actions: url
                            ? [{ action: 'open', title: 'Open' }, { action: 'dismiss', title: 'Dismiss' }]
                            : [],
                    } as NotificationOptions);
                });
            } else {
                // Fallback to plain Notification API
                const n = new Notification(title, { body, icon });
                if (url) n.onclick = () => { window.focus(); window.location.href = url; };
            }
        },
        [isSupported, permission]
    );

    return { permission, isSupported, requestPermission, sendLocalNotification };
};
