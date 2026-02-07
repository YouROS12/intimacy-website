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
import { useI18n } from '@/contexts/I18nContext';

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const { user, signup, signInAnonymously, convertGuestToPermanent } = useAuth();
    const router = useRouter();
    const { t, language } = useI18n();
    const [isProcessing, setIsProcessing] = useState(false);
    const [cities, setCities] = useState<string[]>(["Casablanca"]);
    const [submitError, setSubmitError] = useState('');

    // Shipping form data
    const [formData, setFormData] = useState({
        fullName: '',
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
    const [emailError, setEmailError] = useState('');
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
                city: cities.includes(city) ? city : (cities[0] || 'Casablanca'),
                phone: user.phone || ''
            }));
        }
    }, [user, cities]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'phone') {
            if (value && !validateMoroccanPhone(value)) {
                setPhoneError('Numéro de téléphone invalide (ex: 0612345678)');
            } else {
                setPhoneError('');
            }
        }
    };

    const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAccountData(prev => ({ ...prev, [name]: value }));

        if (name === 'password') {
            // Real-time strength check is handled by passwordStrength variable
        }
        if (name === 'confirmPassword') {
            if (value !== accountData.password) {
                setConfirmPasswordError('Les mots de passe ne correspondent pas');
            } else {
                setConfirmPasswordError('');
            }
        }
    };

    const validateForm = () => {
        let isValid = true;

        if (!validateMoroccanPhone(formData.phone)) {
            setPhoneError('Numéro de téléphone invalide');
            isValid = false;
        }

        if (wantsAccount && !user) {
            if (!accountData.email || !accountData.email.includes('@')) {
                setEmailError('Email invalide');
                isValid = false;
            }
            if (!passwordStrength.isValid) {
                setPasswordError('Mot de passe trop faible');
                isValid = false;
            }
            if (accountData.password !== accountData.confirmPassword) {
                setConfirmPasswordError('Les mots de passe ne correspondent pas');
                isValid = false;
            }
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        if (!validateForm()) {
            return;
        }

        setIsProcessing(true);

        try {
            const sanitizedFullName = sanitizeInput(formData.fullName);
            const sanitizedAddress = sanitizeInput(formData.address);
            const sanitizedPhone = sanitizePhone(formData.phone);

            let userId = user?.id;
            let isNewAccount = false;

            // Handle Account Creation
            if (!user && wantsAccount) {
                try {
                    const { user: newUser, error } = await signup(
                        sanitizeEmail(accountData.email),
                        accountData.password,
                        sanitizedFullName,
                        sanitizedPhone
                    );

                    if (error) throw error;
                    if (newUser) {
                        userId = newUser.id;
                        isNewAccount = true;
                    }
                } catch (signupError: any) {
                    console.error('Signup failed:', signupError);
                    setSubmitError(signupError.message || 'Erreur lors de la création du compte');
                    setIsProcessing(false);
                    return; // Stop checkout if account creation fails explicitly requested
                }
            } else if (!userId) {
                // Anonymous Sign In
                try {
                    const anonResult = await signInAnonymously();
                    if (anonResult?.user) {
                        userId = anonResult.user.id;
                    }
                } catch (anonError) {
                    console.error('Anonymous sign-in failed:', anonError);
                }
            }

            const orderId = await createOrder({
                user_id: userId || null,
                items: items,
                total: total,
                status: 'pending',
                shipping_info: {
                    first_name: sanitizedFullName,
                    last_name: '',
                    address: sanitizedAddress,
                    city: formData.city,
                    phone: sanitizedPhone
                }
            });

            clearCart();
            router.push(`/order-confirmation?orderId=${orderId}&email=${wantsAccount ? encodeURIComponent(accountData.email) : ''}&newAccount=${isNewAccount}`);

        } catch (error: any) {
            console.error('Order creation failed:', error);
            setSubmitError(t('checkout.order_failure') + ': ' + (error.message || 'Erreur inconnue'));
            window.scrollTo(0, 0);
        } finally {
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 font-serif">{t('checkout.empty_cart')}</h2>
                <p className="text-gray-500 mt-2 mb-8">{t('checkout.add_items_to_start')}</p>
                <button onClick={() => router.push('/shop')} className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
                    {t('checkout.empty_action')}
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
                            <h3 className="text-sm font-medium text-red-800">{t('checkout.order_failure')}</h3>
                            <p className="text-sm text-red-700 mt-1">{submitError}</p>
                            <p className="text-xs text-red-600 mt-2">
                                {t('checkout.please_screenshot')}
                            </p>
                            <a
                                href={`https://wa.me/212656201278?text=${encodeURIComponent('Bonjour, j\'ai une erreur: ' + submitError)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-red-600 hover:text-red-700 underline mt-2 inline-block font-medium"
                            >
                                {t('checkout.contact_support')} →
                            </a>
                        </div>
                    </div>
                )}

                {user && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                        <p className="text-green-800">
                            <span className="font-medium">{t('checkout.logged_in_as')} {user.email || user.name}</span>
                            <span className="text-green-600 text-sm ml-2">• {t('checkout.prefilled')}</span>
                        </p>
                    </div>
                )}

                <h1 className="text-3xl font-bold text-gray-900 mb-8 font-serif">{t('checkout.title')}</h1>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                    <div className="lg:col-span-7">
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
                            {/* Shipping Info */}
                            <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-100">
                                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                                    <div className="bg-brand-50 p-2 rounded-full">
                                        <Truck className="h-5 w-5 text-brand-600" />
                                    </div>
                                    <h2 className="text-lg font-medium text-gray-900">{t('checkout.shipping_info')}</h2>
                                </div>

                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">{t('checkout.labels.full_name')}</label>
                                        <div className="mt-1 relative">
                                            <input
                                                type="text"
                                                id="fullName"
                                                name="fullName"
                                                required
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('checkout.labels.phone')}</label>
                                        <div className="mt-1">
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className={`block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3 ${phoneError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                            />
                                            {phoneError && <p className="mt-1 text-xs text-red-600">{phoneError}</p>}
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">{t('checkout.labels.city')}</label>
                                        <div className="mt-1">
                                            <select
                                                id="city"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3"
                                            >
                                                {cities.map((city) => (
                                                    <option key={city} value={city}>
                                                        {city}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">{t('checkout.labels.address')}</label>
                                        <div className="mt-1 relative">
                                            <MapPin className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                                            <textarea
                                                id="address"
                                                name="address"
                                                required
                                                rows={3}
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="block w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method - Fixed to COD */}
                            <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-100">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">{t('checkout.payment.cod')}</h2>
                                <div className="flex items-center p-4 border border-brand-200 bg-brand-50 rounded-lg">
                                    <div className="h-5 w-5 text-brand-600 mr-3 flex-shrink-0">
                                        <Check className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm text-brand-900 font-medium">
                                        {t('checkout.payment.cod_desc')}
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-5 mt-8 lg:mt-0">
                        <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-lg font-medium text-gray-900 mb-6">{t('checkout.summary.title')}</h2>

                            <ul role="list" className="divide-y divide-gray-200 mb-6">
                                {items.map((item) => (
                                    <li key={item.id} className="py-4 flex">
                                        <div className="flex-shrink-0 h-16 w-16 border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                                            <img
                                                src={getProductImage(item.imageUrl)}
                                                alt={item.name}
                                                className="w-full h-full object-center object-cover"
                                            />
                                        </div>
                                        <div className="ml-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between text-sm font-medium text-gray-900">
                                                    <h3 className="line-clamp-2">{item.name}</h3>
                                                    <p className="ml-4 font-bold whitespace-nowrap">{item.price * item.quantity} MAD</p>
                                                </div>
                                                <p className="mt-1 text-xs text-brand-500 uppercase tracking-widest">{t(`shop.categories.${item.category}`) !== `shop.categories.${item.category}` ? t(`shop.categories.${item.category}`) : item.category}</p>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">Qté {item.quantity}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <dl className="space-y-4 border-t border-gray-200 pt-6">
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600">{t('checkout.summary.subtotal')}</dt>
                                    <dd className="text-sm font-medium text-gray-900">{total} MAD</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600">{t('checkout.summary.shipping')}</dt>
                                    <dd className="text-sm font-medium text-green-600">{t('checkout.summary.shipping_free')}</dd>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                    <dt className="text-base font-bold text-gray-900">{t('checkout.summary.total')}</dt>
                                    <dd className="text-base font-bold text-brand-600">{total} MAD</dd>
                                </div>
                            </dl>

                            <div className="mt-8">
                                <button
                                    type="submit"
                                    form="checkout-form"
                                    disabled={isProcessing}
                                    className={`w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 hover:shadow-brand-500/30'}`}
                                >
                                    {isProcessing ? t('checkout.processing') : t('checkout.cta')}
                                </button>
                                <p className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                                    <ShieldCheck className="h-4 w-4 text-green-500" />
                                    {t('product.discrete_shipping.title')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
