'use client';

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export default function OneSignalInit() {
    useEffect(() => {
        const initOneSignal = async () => {
            try {
                await OneSignal.init({
                    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || 'ec00d117-6490-449e-af54-04983058f443', // Placeholder or use env
                    safari_web_id: "web.onesignal.auto.6490449e-af54-0498-3058-f443ec00d117", // Placeholder
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
