"use client";

import dynamic from 'next/dynamic';
import CookieConsent from '@/components/CookieConsent';

const WhatsAppButton = dynamic(() => import('@/components/WhatsAppButton'), { ssr: false });
const OneSignalInit = dynamic(() => import('@/components/OneSignalInit'), { ssr: false });

export default function ClientWidgets() {
    return (
        <>
            <CookieConsent />
            <WhatsAppButton />
            <OneSignalInit />
        </>
    );
}
