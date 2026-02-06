'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { createOrder, getMoroccanCities } from '@/services/api';
import { ShieldCheck, ShoppingBag, Truck, MapPin, AlertCircle, Eye, EyeOff, Check, X, UserPlus } from 'lucide-react';
import { validateMoroccanPhone, parseAddress } from '@/utils/helpers';
import { sanitizeInput, sanitizePhone, sanitizeEmail } from '@/utils/sanitize';
import { validatePassword, PASSWORD_RULES } from '@/utils/passwordValidation';
import { getProductImage } from '@/utils/imageHelpers';

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const { user, signup, signInAnonymously, convertGuestToPermanent } = useAuth();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [cities, setCities] = useState<string[]>(["Casablanca"]);
    const [submitError, setSubmitError] = useState('');

    // Shipping form data
    const [formData, setFormData] = useState({
        fullName: '',
        email: '', // Required for all users (order confirmation + potential account linking)
        phone: '',
        city: 'Casablanca',
        address: ''
    });

    // Account creation toggle and fields
    const [wantsAccount, setWantsAccount] = useState(false);
    const [accountData, setAccountData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validation errors
    const [phoneError, setPhoneError] = useState('');
    const [formEmailError, setFormEmailError] = useState(''); // Email error for main form
    const [emailError, setEmailError] = useState(''); // Email error for account creation
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    // Password strength
    const passwordStrength = validatePassword(accountData.password);

    useEffect(() => {
        getMoroccanCities().then(data => setCities(data));
    }, []);

    // Pre-fill for logged-in users
    useEffect(() => {
        if (user) {
            const { city, street } = parseAddress(user.address);
            setFormData(prev => ({
                ...prev,
                fullName: user.name || '',
                address: street,
                city: city || 'Casablanca',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData({ ...formData, phone: val });
        if (val.length >= 10 && validateMoroccanPhone(val)) {
            setPhoneError('');
        }
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        setFormEmailError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');

        // Validate email (required for all users)
        if (!validateEmail(formData.email)) {
            setFormEmailError('Email invalide');
            window.scrollTo(0, 0);
            return;
        }

        // Validate phone
        if (!validateMoroccanPhone(formData.phone)) {
            setPhoneError('Veuillez entrer un numéro valide (06XXXXXXXX)');
            window.scrollTo(0, 0);
            return;
        }

        // If creating account, validate account fields
        if (wantsAccount && !user) {
            if (!validateEmail(accountData.email)) {
                setEmailError('Email invalide');
                return;
            }

            if (!passwordStrength.isValid) {
                setPasswordError('Le mot de passe ne respecte pas les critères');
                return;
            }

            if (accountData.password !== accountData.confirmPassword) {
                setConfirmPasswordError('Les mots de passe ne correspondent pas');
                return;
            }
        }

        setIsProcessing(true);

        try {
            // Sanitize all inputs
            const sanitizedFullName = sanitizeInput(formData.fullName);
            const sanitizedAddress = sanitizeInput(formData.address);
            const sanitizedPhone = sanitizePhone(formData.phone);

            let userId = user?.id || null;
            let isNewAccount = false;

            // Create account if requested
            if (wantsAccount) {
                try {
                    const sanitizedEmail = sanitizeEmail(accountData.email);
                    let signupResult;

                    if (user && !user.email) {
                        signupResult = await convertGuestToPermanent(
                            sanitizedEmail,
                            accountData.password,
                            sanitizedFullName,
                            sanitizedPhone,
                            `${formData.city}, ${sanitizedAddress}`
                        );
                        userId = user.id;
                        isNewAccount = true;
                    } else if (!user) {
                        signupResult = await signup(
                            sanitizedEmail,
                            accountData.password,
                            sanitizedFullName,
                            sanitizedPhone,
                            `${formData.city}, ${sanitizedAddress}`
                        );
                        if (signupResult?.user) {
                            isNewAccount = true;
                            userId = signupResult.user.id;
                        }
                    }

                } catch (signupError: any) {
                    console.error('Signup failed:', signupError);
                    userId = null;
                    isNewAccount = false;
                    console.warn("Falling back to guest checkout due to signup error");
                }
            }

            if (!userId) {
                try {
                    const anonResult = await signInAnonymously();
                    if (anonResult?.user) {
                        userId = anonResult.user.id;
                    }
                } catch (anonError) {
                    console.error('Anonymous sign-in failed:', anonError);
                    userId = null;
                }
            }

            const orderId = await createOrder({
                user_id: userId,
                items: items,
                total: total,
                status: 'pending',
                shipping_info: {
                    first_name: sanitizedFullName,
                    last_name: '',
                    address: sanitizedAddress,
                    city: formData.city,
                    phone: sanitizedPhone,
                    // Always save email for order confirmation and potential account linking
                    guest_email: formData.email
                }
            });

            clearCart();

            // Pass orderId as query param instead of state
            router.push(`/order-confirmation?orderId=${orderId}&email=${wantsAccount ? encodeURIComponent(accountData.email) : ''}&newAccount=${isNewAccount}`);

        } catch (error) {
            console.error('Order creation failed:', error);
            setSubmitError('Erreur de commande: ' + (error as any).message || 'Erreur inconnue');
            window.scrollTo(0, 0);
        } finally {
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 font-serif">Votre panier est vide</h2>
                <p className="text-gray-500 mt-2 mb-8">Ajoutez des produits pour commencer.</p>
                <button onClick={() => router.push('/shop')} className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
                    Retourner à la boutique
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {submitError && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-red-800">Échec de la commande</h3>
                            <p className="text-sm text-red-700 mt-1">{submitError}</p>
                            <p className="text-xs text-red-600 mt-2">
                                Veuillez faire une capture d&apos;écran et nous l&apos;envoyer sur WhatsApp.
                            </p>
                            <a
                                href={`https://wa.me/212656201278?text=${encodeURIComponent('Bonjour, j\'ai une erreur: ' + submitError)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-red-600 hover:text-red-700 underline mt-2 inline-block font-medium"
                            >
                                Contacter le support WhatsApp →
                            </a>
                        </div>
                    </div>
                )}

                {user && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                        <p className="text-green-800">
                            <span className="font-medium">Connecté en tant que {user.email || user.name}</span>
                            <span className="text-green-600 text-sm ml-2">• Informations pré-remplies</span>
                        </p>
                    </div>
                )}

                <h1 className="text-3xl font-bold text-gray-900 mb-8 font-serif">Caisse</h1>

                <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">

                    {/* Left Column: Forms */}
                    <section className="lg:col-span-7 space-y-8">

                        {/* Shipping Information */}
                        <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
                            <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-gray-400" /> Livraison
                            </h2>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-6">
                                    <label className="block text-sm font-medium text-gray-700">Nom Complet *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-primary focus:border-primary shadow-sm"
                                        placeholder="Votre nom complet"
                                    />
                                </div>
                                <div className="sm:col-span-6">
                                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className={`mt-1 block w-full p-2.5 border rounded-md focus:ring-primary focus:border-primary shadow-sm ${formEmailError ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="votre@email.com"
                                    />
                                    {formEmailError && <p className="mt-1 text-sm text-red-600">{formEmailError}</p>}
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Téléphone *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        className={`mt-1 block w-full p-2.5 border rounded-md focus:ring-primary focus:border-primary shadow-sm ${phoneError ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="06XXXXXXXX"
                                    />
                                    {phoneError && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {phoneError}</p>}
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Ville *</label>
                                    <select
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-primary focus:border-primary shadow-sm bg-white"
                                    >
                                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="sm:col-span-6">
                                    <label className="block text-sm font-medium text-gray-700">Adresse *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-primary focus:border-primary shadow-sm"
                                        placeholder="123 Rue Mohammed V, Apt 4B"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Account Creation */}
                        {!user && (
                            <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                        <UserPlus className="h-5 w-5 text-gray-400" /> Créer un compte
                                        <span className="text-sm font-normal text-gray-500">(Optionnel)</span>
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => setWantsAccount(!wantsAccount)}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${wantsAccount ? 'bg-primary' : 'bg-gray-200'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${wantsAccount ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <p className="text-sm text-gray-500 mb-4">
                                    Suivez vos commandes et gagnez du temps pour la prochaine fois.
                                </p>

                                <button type="button" onClick={() => router.push('/login?redirect=/checkout')} className="text-sm text-primary hover:text-primary/80 font-medium mb-4 block">
                                    Déjà un compte ? Se connecter →
                                </button>

                                {wantsAccount && (
                                    <div className="mt-6 space-y-4 pt-4 border-t border-gray-200">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email *</label>
                                            <input
                                                type="email"
                                                value={accountData.email}
                                                onChange={e => setAccountData({ ...accountData, email: e.target.value })}
                                                className={`mt-1 block w-full p-2.5 border rounded-md focus:ring-primary focus:border-primary shadow-sm ${emailError ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="votre.email@exemple.com"
                                            />
                                            {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Mot de passe *</label>
                                            <div className="relative mt-1">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={accountData.password}
                                                    onChange={e => setAccountData({ ...accountData, password: e.target.value })}
                                                    className={`block w-full p-2.5 pr-10 border rounded-md focus:ring-primary focus:border-primary shadow-sm ${passwordError ? 'border-red-300' : 'border-gray-300'}`}
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>

                                            {accountData.password && (
                                                <div className="mt-2 text-xs">
                                                    Force du mot de passe: <span className={
                                                        passwordStrength.label === 'weak' ? 'text-red-600' :
                                                            passwordStrength.label === 'fair' ? 'text-yellow-600' :
                                                                'text-green-600'
                                                    }>{passwordStrength.label}</span>
                                                </div>
                                            )}
                                            {passwordError && <p className="mt-2 text-xs text-red-600">{passwordError}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe *</label>
                                            <div className="relative mt-1">
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={accountData.confirmPassword}
                                                    onChange={e => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                                                    className={`block w-full p-2.5 pr-10 border rounded-md focus:ring-primary focus:border-primary shadow-sm ${confirmPasswordError ? 'border-red-300' : 'border-gray-300'}`}
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            {confirmPasswordError && <p className="mt-1 text-xs text-red-600">{confirmPasswordError}</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment Method */}
                        <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <Truck className="h-5 w-5 text-gray-400" /> Paiement
                            </h2>
                            <div className="border rounded-lg p-4 flex items-center justify-between cursor-pointer border-primary bg-primary/5 ring-1 ring-primary">
                                <div className="flex items-center">
                                    <input type="radio" checked readOnly className="h-4 w-4 text-primary focus:ring-primary border-gray-300" />
                                    <label className="ml-3 block text-sm font-medium text-gray-900">Paiement à la livraison</label>
                                </div>
                                <span className="text-xs font-semibold text-primary uppercase tracking-wide">Sélectionné</span>
                            </div>
                            <p className="mt-3 text-xs text-gray-500">Payez à la réception. Nous vous appellerons pour confirmer l&apos;heure de livraison.</p>
                        </div>
                    </section>

                    {/* Right Column: Order Summary */}
                    <section className="lg:col-span-5 mt-8 lg:mt-0">
                        <div className="bg-white shadow rounded-lg overflow-hidden sticky top-24 border border-gray-100">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Résumé de la commande</h2>
                            </div>
                            <div className="p-6">
                                <ul className="divide-y divide-gray-200">
                                    {items.map((item) => (
                                        <li key={item.id} className="py-4 flex">
                                            <div className="flex-shrink-0 h-16 w-16 border border-gray-200 rounded-md overflow-hidden bg-gray-100">
                                                <img src={getProductImage(item.imageUrl)} alt={item.name} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="ml-4 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                                        <h3 className="line-clamp-1">{item.name}</h3>
                                                        <p className="ml-2 whitespace-nowrap">{item.price * item.quantity} MAD</p>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                                                </div>
                                                <div className="flex items-end justify-between text-sm">
                                                    <p className="text-gray-500">Qté {item.quantity}</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-6 space-y-4 pt-6 border-t border-gray-200">
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <p>Sous-total</p>
                                        <p>{total} MAD</p>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <p>Livraison</p>
                                        <p className="text-gray-900 font-medium">35 MAD</p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                        <p className="text-base font-bold text-gray-900">Total</p>
                                        <p className="text-xl font-bold text-primary">{total + 35} MAD</p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="mt-8 w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-primary/90 shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>Traitement...</>
                                    ) : (
                                        <>Confirmer la commande ({total + 35} MAD) <Truck className="h-5 w-5" /></>
                                    )}
                                </button>

                                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Payez à la livraison</span>
                                    <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Colis Discret</span>
                                </div>
                            </div>
                        </div>
                    </section>

                </form>
            </div>
        </div>
    );
}
