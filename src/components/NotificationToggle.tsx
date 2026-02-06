'use client';

import React from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import usePushNotifications from '../hooks/usePushNotifications';

interface NotificationToggleProps {
    variant?: 'button' | 'switch' | 'card';
    showTest?: boolean;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({
    variant = 'card',
    showTest = false
}) => {
    const {
        isSupported,
        isSubscribed,
        isLoading,
        permission,
        error,
        subscribe,
        unsubscribe,
        sendTestNotification,
    } = usePushNotifications();

    // Don't render if not supported
    if (!isSupported) {
        return null;
    }

    const handleToggle = async () => {
        if (isSubscribed) {
            await unsubscribe();
        } else {
            await subscribe();
        }
    };

    // Simple button variant
    if (variant === 'button') {
        return (
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isSubscribed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : isSubscribed ? (
                    <Bell className="h-4 w-4" />
                ) : (
                    <BellOff className="h-4 w-4" />
                )}
                {isSubscribed ? 'Notifications activées' : 'Activer les notifications'}
            </button>
        );
    }

    // Switch variant
    if (variant === 'switch') {
        return (
            <div className="flex items-center gap-3">
                <button
                    onClick={handleToggle}
                    disabled={isLoading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isSubscribed ? 'bg-brand-600' : 'bg-gray-300'
                        } disabled:opacity-50`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isSubscribed ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
                <span className="text-sm text-gray-700">
                    {isLoading ? 'Chargement...' : isSubscribed ? 'Notifications activées' : 'Notifications désactivées'}
                </span>
            </div>
        );
    }

    // Card variant (default)
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isSubscribed ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                    {isSubscribed ? (
                        <Bell className="h-5 w-5 text-green-600" />
                    ) : (
                        <BellOff className="h-5 w-5 text-gray-500" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900">
                        Notifications Push
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {isSubscribed
                            ? 'Vous recevez les alertes de commandes et promotions'
                            : 'Activez pour recevoir les mises à jour importantes'
                        }
                    </p>

                    {error && (
                        <p className="text-xs text-red-600 mt-1">{error}</p>
                    )}

                    {permission === 'denied' && !isSubscribed && (
                        <p className="text-xs text-amber-600 mt-1">
                            Les notifications sont bloquées. Modifiez les paramètres de votre navigateur.
                        </p>
                    )}
                </div>

                <button
                    onClick={handleToggle}
                    disabled={isLoading || permission === 'denied'}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isSubscribed
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-brand-600 text-white hover:bg-brand-700'
                        } disabled:opacity-50`}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isSubscribed ? (
                        'Désactiver'
                    ) : (
                        'Activer'
                    )}
                </button>
            </div>

            {showTest && isSubscribed && (
                <button
                    onClick={sendTestNotification}
                    className="mt-3 w-full py-2 px-3 text-xs text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                >
                    Envoyer une notification test
                </button>
            )}
        </div>
    );
};

export default NotificationToggle;
