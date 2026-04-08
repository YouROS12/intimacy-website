import { supabase } from './supabase';

// Types
interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    tag?: string;
    data?: Record<string, unknown>;
}

interface SendResult {
    success: boolean;
    sent: number;
    failed: number;
    errors: string[];
}

/**
 * Send push notification to a specific user
 * Note: This requires the web-push library on the server side
 * For client-side, this prepares the payload for a Supabase Edge Function
 */
export const sendNotificationToUser = async (
    userId: string,
    payload: PushNotificationPayload
): Promise<SendResult> => {
    try {
        // Call Supabase Edge Function to send the notification
        const { data, error } = await supabase.functions.invoke('send-push-notification', {
            body: {
                userId,
                notification: payload,
            },
        });

        if (error) {
            return { success: false, sent: 0, failed: 1, errors: [error.message] };
        }

        return data as SendResult;
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        return { success: false, sent: 0, failed: 1, errors: [errorMessage] };
    }
};

/**
 * Send push notification to all active subscribers
 */
export const sendNotificationToAll = async (
    payload: PushNotificationPayload
): Promise<SendResult> => {
    try {
        const { data, error } = await supabase.functions.invoke('send-push-notification', {
            body: {
                broadcast: true,
                notification: payload,
            },
        });

        if (error) {
            return { success: false, sent: 0, failed: 0, errors: [error.message] };
        }

        return data as SendResult;
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        return { success: false, sent: 0, failed: 0, errors: [errorMessage] };
    }
};

/**
 * Pre-made notification templates
 */
export const NotificationTemplates = {
    orderConfirmed: (orderId: string) => ({
        title: 'Commande confirmée! ✅',
        body: `Votre commande #${orderId.slice(0, 8)} a été confirmée.`,
        url: `/profile`,
        icon: '/icons/icon-192x192.png',
    }),

    orderShipped: (orderId: string) => ({
        title: 'Commande expédiée! 🚚',
        body: `Votre commande #${orderId.slice(0, 8)} est en route.`,
        url: `/profile`,
        icon: '/icons/icon-192x192.png',
    }),

    orderDelivered: (orderId: string) => ({
        title: 'Commande livrée! 📦',
        body: `Votre commande #${orderId.slice(0, 8)} a été livrée.`,
        url: `/profile`,
        icon: '/icons/icon-192x192.png',
    }),

    promoAlert: (discount: string, code?: string) => ({
        title: `Promo: ${discount} de réduction! 🔥`,
        body: code ? `Utilisez le code: ${code}` : 'Offre limitée!',
        url: `/shop`,
        icon: '/icons/icon-192x192.png',
    }),

    backInStock: (productName: string, productSlug: string) => ({
        title: 'De retour en stock! 🎉',
        body: `${productName} est à nouveau disponible.`,
        url: `/shop/${productSlug}`,
        icon: '/icons/icon-192x192.png',
    }),

    loyaltyPoints: (points: number) => ({
        title: 'Points fidélité! 💎',
        body: `Vous avez gagné ${points} points fidélité.`,
        url: `/profile`,
        icon: '/icons/icon-192x192.png',
    }),

    welcomeBonus: () => ({
        title: 'Bienvenue! 🎁',
        body: 'Merci de vous être inscrit. Profitez de 10% sur votre première commande!',
        url: `/shop`,
        icon: '/icons/icon-192x192.png',
    }),
};

const pushNotificationService = {
    sendNotificationToUser,
    sendNotificationToAll,
    NotificationTemplates,
};

export default pushNotificationService;
