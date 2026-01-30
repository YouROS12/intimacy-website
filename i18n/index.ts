import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr.json';
import en from './locales/en.json';
import ar from './locales/ar.json';

const resources = {
    fr: { translation: fr },
    en: { translation: en },
    ar: { translation: ar },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'fr',
        supportedLngs: ['fr', 'en', 'ar'],
        debug: import.meta.env.DEV,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;

// Helper to get current direction (for RTL support)
export const getDirection = (lang: string) => (lang === 'ar' ? 'rtl' : 'ltr');
