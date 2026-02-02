import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

// VAPID public key - You need to generate this and add to .env
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

interface PushSubscriptionState {
    isSupported: boolean;
    isSubscribed: boolean;
    isLoading: boolean;
    permission: NotificationPermission | 'unsupported';
    error: string | null;
}

// Convert VAPID key to Uint8Array (outside hook to avoid recreation)
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export const usePushNotifications = () => {
    const { user } = useAuth();
    const [state, setState] = useState<PushSubscriptionState>({
        isSupported: false,
        isSubscribed: false,
        isLoading: true,
        permission: 'unsupported',
        error: null,
    });

    // Check if push is supported
    useEffect(() => {
        const checkSupport = async () => {
            const supported =
                'serviceWorker' in navigator &&
                'PushManager' in window &&
                'Notification' in window;

            if (!supported) {
                setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
                return;
            }

            const permission = Notification.permission;

            // Check if already subscribed
            let isSubscribed = false;
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                isSubscribed = !!subscription;
            } catch (e) {
                console.error('Error checking subscription:', e);
            }

            setState({
                isSupported: true,
                isSubscribed,
                isLoading: false,
                permission,
                error: null,
            });
        };

    }, []);

    // Subscribe to push notifications
    const subscribe = useCallback(async () => {
        if (!state.isSupported || !VAPID_PUBLIC_KEY) {
            setState(prev => ({ ...prev, error: 'Push notifications not supported or VAPID key missing' }));
            return false;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Request permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setState(prev => ({ ...prev, permission, isLoading: false, error: 'Permission denied' }));
                return false;
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready;

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            // Extract subscription data
            const subscriptionJson = subscription.toJSON();
            const { endpoint, keys } = subscriptionJson;

            if (!endpoint || !keys?.p256dh || !keys?.auth) {
                throw new Error('Invalid subscription data');
            }

            // Save to Supabase
            if (isSupabaseConfigured()) {
                const { error: dbError } = await supabase
                    .from('push_subscriptions')
                    .upsert({
                        user_id: user?.id || null,
                        endpoint,
                        p256dh: keys.p256dh,
                        auth: keys.auth,
                        device_info: {
                            userAgent: navigator.userAgent,
                            language: navigator.language,
                            platform: navigator.platform,
                        },
                        is_active: true,
                    }, {
                        onConflict: 'endpoint',
                    });

                if (dbError) {
                    console.error('Error saving subscription:', dbError);
                    // Don't fail - subscription still works locally
                }
            }

            setState(prev => ({
                ...prev,
                isSubscribed: true,
                permission: 'granted',
                isLoading: false,
                error: null,
            }));

            return true;
        } catch (error: any) {
            console.error('Subscribe error:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Failed to subscribe',
            }));
            return false;
        }
    }, [state.isSupported, user?.id]);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Get endpoint before unsubscribing
                const endpoint = subscription.endpoint;

                // Unsubscribe from browser
                await subscription.unsubscribe();

                // Remove from database
                if (isSupabaseConfigured()) {
                    await supabase
                        .from('push_subscriptions')
                        .delete()
                        .eq('endpoint', endpoint);
                }
            }

            setState(prev => ({
                ...prev,
                isSubscribed: false,
                isLoading: false,
                error: null,
            }));

            return true;
        } catch (error: any) {
            console.error('Unsubscribe error:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Failed to unsubscribe',
            }));
            return false;
        }
    }, []);

    // Send a test notification (local only)
    const sendTestNotification = useCallback(async () => {
        if (!state.isSubscribed) return;

        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('Test Notification', {
            body: 'Les notifications fonctionnent! 🎉',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            data: { url: '/' },
        });
    }, [state.isSubscribed]);

    return {
        ...state,
        subscribe,
        unsubscribe,
        sendTestNotification,
    };
};

export default usePushNotifications;
