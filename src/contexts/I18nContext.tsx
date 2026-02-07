"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import frMessages from '../../messages/fr.json';
import enMessages from '../../messages/en.json';
import arMessages from '../../messages/ar.json';

export type Locale = 'fr' | 'en' | 'ar';

type Messages = typeof frMessages;

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
    messages: Messages;
    dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const messages: Record<Locale, Messages> = {
    fr: frMessages,
    en: enMessages,
    ar: arMessages,
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('fr');
    const router = useRouter();

    // Load locale from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('locale') as Locale || 'fr';
        setLocaleState(saved);
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
        // Update document direction for RTL
        document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLocale;
    };

    // Helper to get nested translation
    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = messages[locale];

        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) {
                console.warn(`Translation missing: ${key} for locale ${locale}`);
                return key;
            }
        }

        return typeof value === 'string' ? value : key;
    };

    const dir = locale === 'ar' ? 'rtl' : 'ltr';

    // Update document direction on locale change
    useEffect(() => {
        document.documentElement.dir = dir;
        document.documentElement.lang = locale;
    }, [locale, dir]);

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, messages: messages[locale], dir }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return context;
}
