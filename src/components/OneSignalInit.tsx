'use client';

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export default function OneSignalInit() {
    useEffect(() => {
        const initOneSignal = async () => {
            try {
                await OneSignal.init({
                    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '0f048a11-9040-4dc3-a3d6-d5a349f85ba6',
                    safari_web_id: "web.onesignal.auto.147da6f8-95e8-4f3e-9e77-8dc52e1c58f0",
                    notifyButton: {
                        enable: true,
                        prenotify: true,
                        showCredit: false,
                        text: {
                            'tip.state.unsubscribed': 'Subscribe to notifications',
                            'tip.state.subscribed': "You're subscribed to notifications",
                            'tip.state.blocked': "You've blocked notifications",
                            'message.prenotify': 'Click to subscribe to notifications',
                            'message.action.subscribed': "Thanks for subscribing!",
                            'message.action.resubscribed': "You're subscribed to notifications",
                            'message.action.unsubscribed': "You won't receive notifications again",
                            'dialog.main.title': 'Manage Site Notifications',
                            'dialog.main.button.subscribe': 'SUBSCRIBE',
                            'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
                            'dialog.blocked.title': 'Unblock Notifications',
                            'dialog.blocked.message': "Follow these instructions to allow notifications:"
                        }
                    },
                    allowLocalhostAsSecureOrigin: true,
                });

                // Example: Tag user with language
                // OneSignal.sendTag("language", "fr");
            } catch (error) {
                console.error('OneSignal Init Error:', error);
            }
        };

        initOneSignal();
    }, []);

    return null;
}
