
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, MapPin, Phone, User as UserIcon, Lock, ArrowLeft, Building, AlertCircle } from 'lucide-react';
import { getMoroccanCities } from '@/services/api';
import { validateMoroccanPhone, formatAddress } from '@/utils/helpers';
import { sanitizeInput, sanitizeEmail, sanitizePhone } from '@/utils/sanitize';
import Link from 'next/link';

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
                    setError("Les mots de passe ne correspondent pas.");
                    return; // Stop immediately
                }
                if (password.length < 6) {
                    newFieldErrors.password = "Le mot de passe doit contenir au moins 6 caractères.";
                    hasError = true;
                }
                if (!fullName.trim()) {
                    setError("Le nom complet est requis.");
                    hasError = true;
                }
                if (!validateMoroccanPhone(phone)) {
                    newFieldErrors.phone = "Numéro marocain invalide. Utilisez le format 06XXXXXXXX.";
                    hasError = true;
                }
                if (!address.trim()) {
                    setError("L'adresse de livraison est requise.");
                    hasError = true;
                }

                if (hasError) {
                    setFieldErrors(newFieldErrors);
                    throw new Error("Veuillez corriger les erreurs dans le formulaire.");
                }

                // Sanitize all inputs before submission
                const sanitizedEmail = sanitizeEmail(email);
                const sanitizedName = sanitizeInput(fullName);
                const sanitizedPhone = sanitizePhone(phone);
                const sanitizedAddress = sanitizeInput(address);
                const fullAddress = formatAddress(city, sanitizedAddress);

                // Check if user is anonymous - use updateUser to convert, otherwise signup
                if (user?.isAnonymous) {
                    // Convert anonymous user to permanent
                    try {
                        await convertGuestToPermanent(sanitizedEmail, password, sanitizedName, sanitizedPhone, fullAddress);
                        router.replace(redirectPath); // Redirect immediately, user is already logged in
                    } catch (conversionError: any) {
                        // If email already exists, show helpful error
                        if (conversionError.message?.includes('already') || conversionError.message?.includes('exists')) {
                            throw new Error("Cet email existe déjà. Veuillez vous connecter avec votre compte existant.");
                        }
                        throw conversionError;
                    }
                } else {
                    // Regular signup for new users
                    await signup(sanitizedEmail, password, sanitizedName, sanitizedPhone, fullAddress);
                    setIsLogin(true);
                    setError("Compte créé avec succès ! Veuillez vérifier votre email avant de vous connecter.");
                    // Clear form
                    setPassword('');
                    setConfirmPassword('');
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Échec de l'authentification");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
            <Link
                href="/"
                className="absolute top-8 left-8 text-gray-500 hover:text-brand-600 flex items-center gap-2"
            >
                <ArrowLeft className="h-5 w-5" /> Retour à la boutique
            </Link>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <ShieldCheck className="h-12 w-12 text-brand-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {isLogin ? 'Connectez-vous à votre compte' : 'Créer un nouveau compte'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {redirectPath.includes('checkout')
                        ? <span className="text-brand-600 font-medium">Veuillez vous connecter pour finaliser votre commande.</span>
                        : 'Rejoignez notre communauté discrète.'}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className={`p-3 rounded text-sm border ${error.includes('succès') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {error}
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Additional Fields for Signup */}
                        {!isLogin && (
                            <>
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nom Complet</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserIcon className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            id="fullName"
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                            placeholder="Votre Nom"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            id="phone"
                                            type="tel"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            required
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            className={`focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border rounded-md py-2 ${fieldErrors.phone ? 'border-red-300' : 'border-gray-300'}`}
                                            placeholder="0600000000"
                                        />
                                    </div>
                                    {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ville</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Building className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <select
                                                id="city"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border bg-white"
                                            >
                                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                id="address"
                                                type="text"
                                                required
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                                placeholder="Quartier, Rue..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Password Fields */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mot de passe
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                />
                            </div>
                            {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
                        </div>

                        {!isLogin && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirmer le mot de passe
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm ${confirmPassword && password !== confirmPassword ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                    />
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="mt-1 text-xs text-red-600">Les mots de passe ne correspondent pas</p>
                                )}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                            >
                                {loading ? 'Traitement...' : (isLogin ? 'Se connecter' : 'Créer un compte')}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    {isLogin ? 'Nouveau client ?' : 'Déjà client ?'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                    setFieldErrors({});
                                }}
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                {isLogin ? 'Créer un compte' : 'Retour à la connexion'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
            <Content />
        </Suspense>
    );
}
