'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders, updateUserProfile, getMoroccanCities } from '@/services/api';
import { Order } from '@/types';
import { Calendar, MapPin, Phone, User as UserIcon, Edit2, Save, X, Lock, Eye, EyeOff } from 'lucide-react';
import { validateMoroccanPhone, formatAddress, parseAddress } from '@/utils/helpers';
import { sanitizeInput, sanitizePhone } from '@/utils/sanitize';
import { useI18n } from '@/contexts/I18nContext';

export default function ProfilePage() {
    const { user, isLoading, refreshProfile, updatePassword } = useAuth();
    const router = useRouter();
    const { t } = useI18n();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [cities, setCities] = useState<string[]>([]);

    // Password Change State
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<{ newPassword?: string, confirmPassword?: string }>({});
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    const [editForm, setEditForm] = useState({
        full_name: '',
        phone: '',
        city: 'Casablanca',
        street_address: ''
    });
    const [errors, setErrors] = useState<{ phone?: string, address?: string, name?: string }>({});

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
            return;
        }

        // If user is anonymous, redirect to login to convert to permanent account
        if (user?.isAnonymous) {
            router.push('/login?from=profile&message=create-account');
            return;
        }

        getMoroccanCities().then(setCities);

        if (user) {
            getUserOrders(user.id).then(data => {
                setOrders(data);
                setLoadingOrders(false);
            });

            // Use helper to safely parse the address
            const { city, street } = parseAddress(user.address);

            setEditForm({
                full_name: user.name || '',
                phone: user.phone || '',
                city: city,
                street_address: street
            });
        }
    }, [user, isLoading, router]);

    const handleSaveProfile = async () => {
        if (!user) return;

        // Validation
        const newErrors: any = {};
        let hasError = false;

        if (!editForm.full_name.trim()) {
            newErrors.name = t('auth.errors.name_required');
            hasError = true;
        }
        if (!validateMoroccanPhone(editForm.phone)) {
            newErrors.phone = t('auth.errors.phone_invalid');
            hasError = true;
        }
        if (!editForm.street_address.trim()) {
            newErrors.address = t('auth.errors.address_required');
            hasError = true;
        }

        setErrors(newErrors);
        if (hasError) return;

        setIsSaving(true);
        try {
            // Sanitize inputs before saving to prevent XSS
            const sanitizedName = sanitizeInput(editForm.full_name);
            const sanitizedPhone = sanitizePhone(editForm.phone);
            const sanitizedAddress = sanitizeInput(editForm.street_address);

            await updateUserProfile(user.id, {
                full_name: sanitizedName,
                phone: sanitizedPhone,
                address: formatAddress(editForm.city, sanitizedAddress)
            });
            setIsEditing(false);
            refreshProfile(); // Refresh context
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert(t('auth.errors.general'));
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        // Validation
        const newErrors: any = {};
        let hasError = false;

        if (passwordForm.newPassword.length < 6) {
            newErrors.newPassword = t('auth.errors.password_short');
            hasError = true;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            newErrors.confirmPassword = t('auth.errors.password_mismatch');
            hasError = true;
        }

        setPasswordErrors(newErrors);
        if (hasError) return;

        setIsSavingPassword(true);
        try {
            await updatePassword(passwordForm.newPassword);
            // Success if no error thrown
            setPasswordSuccess('Mot de passe mis à jour avec succès.');
            setIsChangingPassword(false);
            setPasswordForm({ newPassword: '', confirmPassword: '' });
            setTimeout(() => setPasswordSuccess(''), 3000);
        } catch (err) {
            console.error(err);
            setPasswordErrors({ newPassword: t('auth.errors.general') });
        } finally {
            setIsSavingPassword(false);
        }
    };


    if (isLoading || !user) return <div className="min-h-screen pt-24 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">{t('profile.title')}</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Profile Info */}
                    <div className="w-full lg:w-1/3 space-y-8">
                        {/* User Details Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-lg font-medium text-gray-900">{t('profile.account_details')}</h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-brand-600 hover:text-brand-700 text-sm font-medium flex items-center"
                                    >
                                        <Edit2 className="h-4 w-4 mr-1" /> {t('profile.edit')}
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">{t('auth.full_name')}</label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <UserIcon className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={editForm.full_name}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                                                className={`pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm ${errors.name ? 'border-red-300' : ''}`}
                                            />
                                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-gray-900">
                                            <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                                            {user.name}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">{t('auth.phone')}</label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <Phone className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                                className={`pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm ${errors.phone ? 'border-red-300' : ''}`}
                                            />
                                            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-gray-900">
                                            <Phone className="h-5 w-5 text-gray-400 mr-3" />
                                            {user.phone || '-'}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">{t('auth.city')}</label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <MapPin className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                                            <select
                                                value={editForm.city}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                                                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                            >
                                                {cities.map((city) => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-gray-900">
                                            <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                                            {parseAddress(user.address).city}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">{t('auth.address')}</label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <MapPin className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                                            <textarea
                                                rows={2}
                                                value={editForm.street_address}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, street_address: e.target.value }))}
                                                className={`pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm ${errors.address ? 'border-red-300' : ''}`}
                                            />
                                            {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-gray-900 pl-8">
                                            {parseAddress(user.address).street}
                                        </div>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="flex-1 bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-bold shadow hover:bg-brand-700 transition-colors flex justify-center items-center"
                                        >
                                            {isSaving ? t('auth.loading') : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" /> {t('profile.save')}
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setErrors({});
                                                // Reset form
                                                const { city, street } = parseAddress(user.address);
                                                setEditForm({
                                                    full_name: user.name || '',
                                                    phone: user.phone || '',
                                                    city: city,
                                                    street_address: street
                                                });
                                            }}
                                            className="flex-1 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex justify-center items-center"
                                        >
                                            <X className="h-4 w-4 mr-2" /> {t('profile.cancel')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-6">{t('profile.security')}</h2>

                            {passwordSuccess && (
                                <div className="mb-4 bg-green-50 text-green-700 text-sm p-3 rounded-md">
                                    {passwordSuccess}
                                </div>
                            )}

                            {!isChangingPassword ? (
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-brand-300 hover:bg-brand-50 transition-all group"
                                >
                                    <div className="flex items-center">
                                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                                            <Lock className="h-5 w-5 text-gray-600 group-hover:text-brand-600" />
                                        </div>
                                        <span className="ml-3 font-medium text-gray-900">{t('profile.change_password')}</span>
                                    </div>
                                    <Edit2 className="h-4 w-4 text-gray-400 group-hover:text-brand-500" />
                                </button>
                            ) : (
                                <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('profile.new_password')}</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                className="block w-full border-gray-300 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showNewPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                            </button>
                                        </div>
                                        {passwordErrors.newPassword && <p className="text-xs text-red-600 mt-1">{passwordErrors.newPassword}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('profile.confirm_new_password')}</label>
                                        <input
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className="block w-full border-gray-300 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500"
                                        />
                                        {passwordErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{passwordErrors.confirmPassword}</p>}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handlePasswordChange}
                                            disabled={isSavingPassword}
                                            className="flex-1 bg-brand-600 text-white text-xs font-bold py-2 rounded hover:bg-brand-700"
                                        >
                                            {isSavingPassword ? '...' : t('profile.save')}
                                        </button>
                                        <button
                                            onClick={() => setIsChangingPassword(false)}
                                            className="flex-1 bg-white border border-gray-300 text-gray-700 text-xs font-bold py-2 rounded hover:bg-gray-50"
                                        >
                                            {t('profile.cancel')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Orders */}
                    <div className="w-full lg:w-2/3">
                        <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">{t('profile.orders')}</h2>
                        {loadingOrders ? (
                            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                        ) : orders.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <p className="text-gray-500">{t('profile.empty_orders')}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Commande</p>
                                                <p className="font-mono font-medium text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</p>
                                                <div className="flex items-center text-gray-900 text-sm">
                                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('checkout.total')}</p>
                                                <p className="font-bold text-brand-600">{order.total} MAD</p>
                                            </div>
                                            <div>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {order.status === 'pending' ? 'En Attente' : order.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="px-6 py-4">
                                            <ul className="divide-y divide-gray-100">
                                                {order.items.map((item, idx) => (
                                                    <li key={idx} className="py-3 flex justify-between items-center">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded bg-gray-100 flex-shrink-0 mr-4 overflow-hidden">
                                                                {/* Placeholder if no image in order item */}
                                                                <div className="w-full h-full bg-gray-200" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                                <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {item.price * item.quantity} MAD
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
