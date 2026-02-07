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
