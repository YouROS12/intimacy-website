"use client";

import Link from 'next/link';
import React from 'react';
import { useI18n } from '@/contexts/I18nContext';

const Footer = () => {
    const { t } = useI18n();

    return (
        <footer className="bg-background-light dark:bg-background-dark py-8 border-t border-[#f3ece7] dark:border-[#3a2e26]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted dark:text-gray-500">
                <p>&copy; {new Date().getFullYear()} Intimacy. {t('footer.rights')}</p>
                <div className="flex gap-6">
                    <Link href="/legal/privacy" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link>
                    <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
                    <Link href="/legal/terms" className="hover:text-primary transition-colors">{t('footer.terms')}</Link>
                    <Link href="/legal/returns" className="hover:text-primary transition-colors">{t('footer.shipping')}</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
