"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingBag, User as UserIcon, LogOut, Menu, X, ShieldCheck, Search, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useI18n } from '@/contexts/I18nContext';
import { UserRole } from '@/types';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const { items, setIsOpen } = useCart();
    const { t, locale, setLocale } = useI18n();

    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    const isActive = (path: string) => pathname === path;
    const [searchQuery, setSearchQuery] = useState('');

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsMenuOpen(false);
            setSearchQuery('');
        }
    };

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    return (
        <div className="sticky top-0 z-[100] w-full isolate shadow-sm">
            {/* Urgency Banner */}
            <div className="bg-brand-600 text-white py-2 px-4 text-center text-xs sm:text-sm font-medium relative z-[101]">
                {t('home.urgency_banner')}
            </div>
            <header className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-all duration-300 relative z-[100]">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo (Stitch Style) */}
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex items-center gap-2 group">
                                <ShieldCheck className="w-8 h-8" />
                                <h2 className="text-text-main dark:text-white text-xl font-bold tracking-tight font-serif">
                                    <span className="text-primary">Intimacy</span>
                                </h2>
                            </Link>
                        </div>

                        {/* Desktop Nav (Stitch Style) */}
                        <nav className="hidden md:flex items-center gap-8">
                            <Link href="/" className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-primary' : 'text-text-main dark:text-gray-200 hover:text-primary'}`}>{t('nav.home')}</Link>
                            <Link href="/shop" className={`text-sm font-medium transition-colors ${isActive('/shop') ? 'text-primary' : 'text-text-main dark:text-gray-200 hover:text-primary'}`}>{t('nav.shop')}</Link>
                            <Link href="/education" className={`text-sm font-medium transition-colors ${isActive('/education') ? 'text-primary' : 'text-text-main dark:text-gray-200 hover:text-primary'}`}>{t('nav.education')}</Link>
                            <Link href="/about" className={`text-sm font-medium transition-colors ${isActive('/about') ? 'text-primary' : 'text-text-main dark:text-gray-200 hover:text-primary'}`}>{t('nav.about')}</Link>
                        </nav>

                        <div className="hidden sm:flex items-center gap-3">
                            {/* Search Bar (Adapting functionality to Stitch look) */}
                            <form onSubmit={handleSearch} className="relative hidden lg:block">
                                <input
                                    type="text"
                                    placeholder={t('nav.search')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-48 pl-4 pr-10 py-2 rounded-full border border-[#e7d9cf] dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                                <button type="submit" className="absolute right-2 top-1.5 text-text-muted hover:text-primary">
                                    <Search className="h-4 w-4" />
                                </button>
                            </form>

                            {/* Search Icon (Mobile/Tablet view trigger could go here, but keeping simple for now) */}
                            <button className="lg:hidden flex items-center justify-center size-10 rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-text-main dark:text-white transition-colors">
                                <Search className="size-5" />
                            </button>

                            {/* Language Switcher */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                                    className="flex items-center justify-center size-10 tap-target rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-text-main dark:text-white transition-colors"
                                >
                                    <Globe className="h-5 w-5" />
                                </button>

                                {isLangMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                                        <button
                                            onClick={() => { setLocale('fr'); setIsLangMenuOpen(false); }}
                                            className={`w-full px-4 py-3 text-left text-sm hover:bg-primary/10 transition-colors flex items-center gap-2 ${locale === 'fr' ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700 dark:text-gray-200'}`}
                                        >
                                            <span className="text-lg">🇫🇷</span>
                                            <span>Français</span>
                                        </button>
                                        <button
                                            onClick={() => { setLocale('en'); setIsLangMenuOpen(false); }}
                                            className={`w-full px-4 py-3 text-left text-sm hover:bg-primary/10 transition-colors flex items-center gap-2 ${locale === 'en' ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700 dark:text-gray-200'}`}
                                        >
                                            <span className="text-lg">🇬🇧</span>
                                            <span>English</span>
                                        </button>
                                        <button
                                            onClick={() => { setLocale('ar'); setIsLangMenuOpen(false); }}
                                            className={`w-full px-4 py-3 text-left text-sm hover:bg-primary/10 transition-colors flex items-center gap-2 ${locale === 'ar' ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700 dark:text-gray-200'}`}
                                        >
                                            <span className="text-lg">🇲🇦</span>
                                            <span>العربية</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Cart Icon (Stitch Style) */}
                            <button
                                onClick={() => setIsOpen(true)}
                                className="relative flex items-center justify-center size-10 tap-target rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                            >
                                <ShoppingBag className="size-6" />
                                {totalItems > 0 && (
                                    <span className="absolute top-2 right-2 size-2 bg-primary rounded-full ring-2 ring-background-light dark:ring-background-dark animate-pulse"></span>
                                )}
                            </button>

                            {/* User Icon with Dropdown (Stitch Style) */}
                            {user ? (
                                <div className="relative group">
                                    <Link href="/profile">
                                        <button className="flex items-center justify-center size-10 tap-target rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-text-main dark:text-white transition-colors">
                                            <UserIcon className="size-6" />
                                        </button>
                                    </Link>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 top-full w-48 pt-2 hidden group-hover:block transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                                        <div className="bg-white dark:bg-[#221810] rounded-xl shadow-xl border border-[#f3ece7] dark:border-[#3a2e26] overflow-hidden">
                                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                                            </div>
                                            <div className="py-1">
                                                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/5 hover:text-primary transition-colors">
                                                    My Profile
                                                </Link>
                                                {user.role === 'admin' && (
                                                    <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/5 hover:text-primary transition-colors">
                                                        Admin Dashboard
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                                >
                                                    <span>Log Out</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link href="/login">
                                    <button className="flex items-center justify-center size-10 rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-text-main dark:text-white transition-colors">
                                        <span className="material-symbols-outlined">login</span>
                                    </button>
                                </Link>
                            )}
                        </div>

                        {/* Mobile: Menu Toggle */}
                        <div className="flex items-center gap-2 sm:hidden">
                            <button
                                onClick={() => setIsOpen(true)}
                                className="relative flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary"
                            >
                                <span className="material-symbols-outlined">shopping_bag</span>
                                {totalItems > 0 && (
                                    <span className="absolute top-2 right-2 size-2 bg-primary rounded-full ring-2 ring-background-light"></span>
                                )}
                            </button>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center justify-center size-10 rounded-full hover:bg-gray-100 text-text-main"
                            >
                                {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu (Simplified to match theme) */}
                {isMenuOpen && (
                    <div className="sm:hidden bg-background-light border-t border-[#f3ece7]">
                        <div className="p-4 space-y-4">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder={t('nav.search')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 rounded-full border border-[#e7d9cf] bg-white text-sm focus:outline-none focus:border-primary"
                                />
                                <Search className="absolute right-4 top-3.5 h-4 w-4 text-text-muted" />
                            </form>
                            <nav className="flex flex-col gap-2">
                                <Link href="/" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 hover:bg-primary/5 rounded-lg text-text-main font-medium">{t('nav.home')}</Link>
                                <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 hover:bg-primary/5 rounded-lg text-text-main font-medium">{t('nav.shop')}</Link>
                                <Link href="/education" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 hover:bg-primary/5 rounded-lg text-text-main font-medium">{t('nav.education')}</Link>
                                <Link href="/about" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 hover:bg-primary/5 rounded-lg text-text-main font-medium">{t('nav.about')}</Link>

                                <div className="px-4 py-2 border-t border-[#f3ece7] mt-2">
                                    <p className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">Language</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setLocale('fr')}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${locale === 'fr' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            🇫🇷 FR
                                        </button>
                                        <button
                                            onClick={() => setLocale('en')}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${locale === 'en' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            🇬🇧 EN
                                        </button>
                                        <button
                                            onClick={() => setLocale('ar')}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${locale === 'ar' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            🇲🇦 AR
                                        </button>
                                    </div>
                                </div>

                                {user && (
                                    <div className="mt-2 pt-2 border-t border-[#f3ece7]">
                                        <div className="px-4 py-2 text-sm font-bold text-primary">{user.name}</div>
                                        <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 hover:bg-primary/5 rounded-lg text-text-main font-medium">{t('nav.profile')}</Link>
                                        {user.role === 'admin' && (
                                            <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 hover:bg-primary/5 rounded-lg text-text-main font-medium">{t('nav.admin')}</Link>
                                        )}
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-red-50 rounded-lg text-red-600 font-medium"
                                        >
                                            {t('nav.logout')}
                                        </button>
                                    </div>
                                )}
                                {!user && (
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 mt-2 bg-primary text-white rounded-lg font-medium text-center">{t('nav.login')}</Link>
                                )}
                            </nav>
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
};

export default Navbar;
