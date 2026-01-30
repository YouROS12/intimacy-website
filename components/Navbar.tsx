import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogOut, Menu, X, ShieldCheck, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { UserRole } from '../types';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { items, setIsOpen } = useCart();

  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const [searchQuery, setSearchQuery] = useState('');

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <ShieldCheck className="h-8 w-8 text-brand-600 group-hover:animate-heartbeat transition-all" />
              <span className="font-serif text-xl font-bold text-slate-800 tracking-wide">Intimacy<span className="text-brand-600">Wellness</span></span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8 rtl:space-x-reverse">
              <Link to="/" className={`px-3 py-2 text-sm font-medium ${isActive('/') ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'}`}>{t('nav.home')}</Link>
              <Link to="/shop" className={`px-3 py-2 text-sm font-medium ${isActive('/shop') ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'}`}>{t('nav.shop')}</Link>
              <Link to="/education" className={`px-3 py-2 text-sm font-medium ${isActive('/education') ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'}`}>{t('nav.education')}</Link>
              <Link to="/about" className={`px-3 py-2 text-sm font-medium ${isActive('/about') ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'}`}>{t('nav.about')}</Link>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder={t('common.search') + '...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 w-48 lg:w-64 transition-all rtl:pl-4 rtl:pr-9"
              />
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-2.5 h-4 w-4 text-slate-400" />
            </form>

            {/* Language Switcher */}
            <LanguageSwitcher />

            <button
              onClick={() => setIsOpen(true)}
              className="p-2 text-slate-500 hover:text-brand-600 relative transition-colors"
              aria-label={t('nav.cart')}
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 rtl:right-auto rtl:left-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 rtl:-translate-x-1/4 -translate-y-1/4 bg-brand-600 rounded-full animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative group h-full flex items-center">
                <button className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-brand-600 py-2">
                  <UserIcon className="h-5 w-5" />
                  <span>{user.name}</span>
                </button>
                {/* Dropdown Container */}
                <div className="absolute right-0 rtl:right-auto rtl:left-0 top-full w-48 hidden group-hover:block z-50">
                  {/* Invisible bridge to maintain hover state */}
                  <div className="pt-2">
                    <div className="bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('nav.profile')}</Link>
                        {user.role === UserRole.ADMIN && (
                          <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('nav.admin')}</Link>
                        )}
                        <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <LogOut className="mr-2 rtl:mr-0 rtl:ml-2 h-4 w-4" /> {t('nav.logout')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-slate-600 hover:text-brand-600 text-sm font-medium">{t('nav.login')}</Link>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder={t('common.search') + '...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 rtl:pl-4 rtl:pr-10"
              />
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-2.5 h-4 w-4 text-slate-400" />
            </form>
          </div>
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className={`block pl-3 pr-4 rtl:pl-4 rtl:pr-3 py-2 border-l-4 rtl:border-l-0 rtl:border-r-4 text-base font-medium ${isActive('/') ? 'border-brand-500 text-brand-700 bg-brand-50' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-brand-500 hover:text-brand-700'}`}>{t('nav.home')}</Link>
            <Link to="/shop" className={`block pl-3 pr-4 rtl:pl-4 rtl:pr-3 py-2 border-l-4 rtl:border-l-0 rtl:border-r-4 text-base font-medium ${isActive('/shop') ? 'border-brand-500 text-brand-700 bg-brand-50' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-brand-500 hover:text-brand-700'}`}>{t('nav.shop')}</Link>
            <Link to="/education" className={`block pl-3 pr-4 rtl:pl-4 rtl:pr-3 py-2 border-l-4 rtl:border-l-0 rtl:border-r-4 text-base font-medium ${isActive('/education') ? 'border-brand-500 text-brand-700 bg-brand-50' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-brand-500 hover:text-brand-700'}`}>{t('nav.education')}</Link>
            <button onClick={() => setIsOpen(true)} className="w-full text-left rtl:text-right pl-3 pr-4 rtl:pl-4 rtl:pr-3 py-2 border-l-4 rtl:border-l-0 rtl:border-r-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-brand-500 hover:text-brand-700">
              {t('nav.cart')} ({totalItems})
            </button>
            {/* Mobile Language Switcher */}
            <div className="pl-3 pr-4 rtl:pl-4 rtl:pr-3 py-2">
              <LanguageSwitcher />
            </div>
            {user ? (
              <>
                <Link to="/profile" className="block pl-3 pr-4 rtl:pl-4 rtl:pr-3 py-2 border-l-4 rtl:border-l-0 rtl:border-r-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-brand-500 hover:text-brand-700">{t('nav.profile')}</Link>
                {user.role === UserRole.ADMIN && (
                  <Link to="/admin" className="block pl-3 pr-4 rtl:pl-4 rtl:pr-3 py-2 border-l-4 rtl:border-l-0 rtl:border-r-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-brand-500 hover:text-brand-700">{t('nav.admin')}</Link>
                )}
                <button onClick={handleLogout} className="w-full text-left rtl:text-right pl-3 pr-4 rtl:pl-4 rtl:pr-3 py-2 border-l-4 rtl:border-l-0 rtl:border-r-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-brand-500 hover:text-brand-700">{t('nav.logout')}</button>
              </>
            ) : (
              <Link to="/login" className="block pl-3 pr-4 rtl:pl-4 rtl:pr-3 py-2 border-l-4 rtl:border-l-0 rtl:border-r-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-brand-500 hover:text-brand-700">{t('nav.login')}</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;