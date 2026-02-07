'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, MapPin, Phone, User as UserIcon, Lock, ArrowLeft, Building, AlertCircle } from 'lucide-react';
import { getMoroccanCities } from '@/services/api';
import { validateMoroccanPhone, formatAddress } from '@/utils/helpers';
import { sanitizeInput, sanitizeEmail, sanitizePhone } from '@/utils/sanitize';
import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';

function Content() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Profile Data
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('Casablanca');
    const [cities, setCities] = useState<string[]>([]);

    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ phone?: string, password?: string }>({});
    const [loading, setLoading] = useState(false);

    const { login, signup, convertGuestToPermanent, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('from') || '/';
    const { t } = useI18n();

    // Helper to check if any form data exists
    const hasFormData = () => {
        return email.trim() || password.trim() || fullName.trim() || phone.trim() || address.trim();
    };

    // Handle tab switching with confirmation
    const handleTabSwitch = (switchToLogin: boolean) => {
        if (hasFormData()) {
            const confirmed = window.confirm(
                switchToLogin
                    ? 'Vous avez des données non sauvegardées. Voulez-vous vraiment passer à la connexion?'
                    : 'Vous avez des données non sauvegardées. Voulez-vous vraiment passer à l\'inscription?'
            );
            if (!confirmed) return;
        }
        setIsLogin(switchToLogin);
        // Clear form on switch
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setPhone('');
        setAddress('');
        setError('');
        setFieldErrors({});
    };

    useEffect(() => {
        getMoroccanCities().then(setCities);

        // Auto-switch to signup mode if coming from profile (anonymous user conversion)
        const message = searchParams.get('message');
        if (message === 'create-account') {
            setIsLogin(false);
        }
    }, [searchParams]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            setPhone(value);
            // Real-time validation clear
            if (validateMoroccanPhone(value)) {
                setFieldErrors(prev => ({ ...prev, phone: undefined }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
                router.replace(redirectPath);
            } else {
                // --- Strict Validations ---
                let hasError = false;
                const newFieldErrors: any = {};

                if (password !== confirmPassword) {
                    setError(t('auth.errors.password_mismatch'));
                    return; // Stop immediately
                }
                if (password.length < 6) {
                    newFieldErrors.password = t('auth.errors.password_short');
                    hasError = true;
                }
                if (!fullName.trim()) {
                    setError(t('auth.errors.name_required'));
                    hasError = true;
                }
                if (!validateMoroccanPhone(phone)) {
                    newFieldErrors.phone = t('auth.errors.phone_invalid');
                    hasError = true;
                }
                if (!address.trim()) {
                    setError(t('auth.errors.address_required'));
                    hasError = true;
                }

                if (hasError) {
                    setFieldErrors(newFieldErrors);
                    throw new Error(t('auth.errors.general')); // Generic error, specific ones are in fieldErrors or error state
                }

                // Sanitize all inputs before submission
                const sanitizedEmail = sanitizeEmail(email);
                const sanitizedName = sanitizeInput(fullName);
                const sanitizedPhone = sanitizePhone(phone);
                const sanitizedAddress = sanitizeInput(address);

                // Check if converting anonymous user
                if (user && user.isAnonymous) {
                    await convertGuestToPermanent(
                        sanitizedEmail,
                        password,
                        sanitizedName,
                        sanitizedPhone,
                        sanitizedAddress // Pass address to update profile
                    );
                } else {
                    await signup(
                        sanitizedEmail,
                        password,
                        sanitizedName,
                        sanitizedPhone,
                        sanitizedAddress // Pass address to update profile
                    );
                    // For new signup, we might want to update address separately if signup doesn't take it,
                    // but useAuth implementation suggests signup takes basic info.
                    // If address update is needed separate, we'd do it here.
                    // Assuming signup sufficient or profile update happens later/embedded.
                }
                router.replace(redirectPath);
            }
        } catch (err: any) {
            console.error(err);
            // Better error handling for firebase auth errors
            if (err.code === 'auth/email-already-in-use') {
                setError('Cet email est déjà utilisé.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Email invalide.');
            } else if (err.code === 'auth/wrong-password') {
                setError('Mot de passe incorrect.');
            } else if (err.code === 'auth/user-not-found') {
                setError('Utilisateur introuvable.');
            }
            else {
                setError(err.message || t('auth.errors.general'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
            <Link href="/" className="absolute top-8 left-8 flex items-center text-gray-500 hover:text-brand-600 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                {t('product.back_to_shop')}
            </Link>

            <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row">
                {/* Left Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                            {isLogin ? t('auth.login') : t('auth.signup')}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {t('home.hero.badge')}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-pulse">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="flex border-b border-gray-200 mb-8">
                        <button
                            type="button"
                            className={`pb-4 w-1/2 text-sm font-bold uppercase tracking-widest transition-colors ${isLogin ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
                            onClick={() => handleTabSwitch(true)}
                        >
                            {t('auth.login')}
                        </button>
                        <button
                            type="button"
                            className={`pb-4 w-1/2 text-sm font-bold uppercase tracking-widest transition-colors ${!isLogin ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
                            onClick={() => handleTabSwitch(false)}
                        >
                            {t('auth.signup')}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
                            <input
                                type="email"
                                required
                                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
                            <div className="relative">
                                <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    className={`pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3 ${fieldErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
                            </div>
                            {isLogin && (
                                <div className="mt-2 text-right">
                                    <Link href="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 hover:underline">
                                        Mot de passe oublié?
                                    </Link>
                                </div>
                            )}
                        </div>

                        {!isLogin && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirm_password')}</label>
                                    <div className="relative">
                                        <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 mb-3">Informations de livraison</p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.full_name')}</label>
                                            <div className="relative">
                                                <UserIcon className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.phone')}</label>
                                            <div className="relative">
                                                <Phone className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    required
                                                    className={`pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3 ${fieldErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                    value={phone}
                                                    onChange={handlePhoneChange}
                                                />
                                                {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.city')}</label>
                                            <div className="relative">
                                                <Building className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                                                <select
                                                    className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3 appearance-none"
                                                    value={city}
                                                    onChange={(e) => setCity(e.target.value)}
                                                >
                                                    {cities.map((c) => (
                                                        <option key={c} value={c}>
                                                            {c}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.address')}</label>
                                            <div className="relative">
                                                <MapPin className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all transform hover:-translate-y-0.5 hover:shadow-lg mt-6"
                        >
                            {loading ? t('auth.loading') : (isLogin ? t('auth.submit_login') : t('auth.submit_signup'))}
                        </button>
                    </form>
                </div>

                {/* Right Side - Benefits */}
                <div className="hidden md:flex w-1/2 bg-gray-50 flex-col justify-center p-12 border-l border-gray-100">
                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">{t('auth.benefits.title')}</h3>
                    <ul className="space-y-6">
                        <li className="flex items-start">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center mr-4">
                                <ShieldCheck className="h-5 w-5 text-brand-600" />
                            </div>
                            <div>
                                <p className="text-gray-900 font-medium">{t('auth.benefits.delivery')}</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center mr-4">
                                <Building className="h-5 w-5 text-brand-600" />
                            </div>
                            <div>
                                <p className="text-gray-900 font-medium">{t('auth.benefits.payment')}</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center mr-4">
                                <Phone className="h-5 w-5 text-brand-600" />
                            </div>
                            <div>
                                <p className="text-gray-900 font-medium">{t('auth.benefits.support')}</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="mt-8 text-center text-xs text-gray-400">
                <p>
                    <Link href="#" className="hover:text-gray-600 underline">{t('footer.privacy')}</Link> • <Link href="#" className="hover:text-gray-600 underline">{t('footer.terms')}</Link>
                </p>
                <p className="mt-2 text-gray-300">© 2024 Intimacy Wellness. {t('footer.rights')}</p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>}>
            <Content />
        </Suspense>
    );
}
