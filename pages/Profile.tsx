import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserOrders, updateUserProfile, getMoroccanCities } from '../services/api';
import { Order } from '../types';
import { Calendar, MapPin, Phone, User as UserIcon, Edit2, Save, X, Lock, Eye, EyeOff } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { validateMoroccanPhone, formatAddress, parseAddress } from '../utils/helpers';
import { sanitizeInput, sanitizePhone } from '../utils/sanitize';

const Profile: React.FC = () => {
    const { user, isLoading, refreshProfile, updatePassword } = useAuth();
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
    }, [user]);

    const handleSaveProfile = async () => {
        if (!user) return;

        // Validation
        const newErrors: any = {};
        let hasError = false;

        if (!editForm.full_name.trim()) {
            newErrors.name = "Name is required";
            hasError = true;
        }
        if (!validateMoroccanPhone(editForm.phone)) {
            newErrors.phone = "Invalid format. Use 06XXXXXXXX";
            hasError = true;
        }
        if (!editForm.street_address.trim()) {
            newErrors.address = "Address is required";
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

            // Use helper to format address for storage
            const fullAddress = formatAddress(editForm.city, sanitizedAddress);

            await updateUserProfile(user.id, {
                full_name: sanitizedName,
                phone: sanitizedPhone,
                address: fullAddress
            });
            await refreshProfile();
            setIsEditing(false);
        } catch (error: any) {
            alert("Failed to update profile: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        setPasswordErrors({});
        setPasswordSuccess('');
        let hasError = false;
        const newErrors: { newPassword?: string, confirmPassword?: string } = {};

        if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
            newErrors.newPassword = "Le mot de passe doit contenir au moins 6 caractères";
            hasError = true;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
            hasError = true;
        }

        setPasswordErrors(newErrors);
        if (hasError) return;

        setIsSavingPassword(true);
        try {
            await updatePassword(passwordForm.newPassword);
            setPasswordSuccess("Mot de passe modifié avec succès !");
            setPasswordForm({ newPassword: '', confirmPassword: '' });
            setIsChangingPassword(false);
            setTimeout(() => setPasswordSuccess(''), 5000);
        } catch (error: any) {
            setPasswordErrors({ newPassword: error.message || "Erreur lors du changement de mot de passe" });
        } finally {
            setIsSavingPassword(false);
        }
    };

    if (isLoading) return <div>Chargement...</div>;
    if (!user) return <Navigate to="/login" />;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Mon Compte</h1>

                {/* Profile Details Card */}
                <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Informations Personnelles</h3>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                <Edit2 className="h-4 w-4 mr-2" /> Modifier
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setErrors({});
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                >
                                    <X className="h-4 w-4 mr-2" /> Annuler
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4 mr-2" /> {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        {!isEditing ? (
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                        <UserIcon className="h-4 w-4" /> Full Name
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">{user.name || 'N/A'}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                        <Phone className="h-4 w-4" /> Phone Number
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">{user.phone || 'N/A'}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> Shipping Address
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">{user.address || 'N/A'}</dd>
                                </div>
                            </dl>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.full_name}
                                        onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input
                                        type="text"
                                        value={editForm.phone}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (/^\d*$/.test(val)) setEditForm({ ...editForm, phone: val });
                                        }}
                                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">City</label>
                                        <select
                                            value={editForm.city}
                                            onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                        >
                                            {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Street Address</label>
                                        <input
                                            type="text"
                                            value={editForm.street_address}
                                            onChange={e => setEditForm({ ...editForm, street_address: e.target.value })}
                                            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm ${errors.address ? 'border-red-300' : 'border-gray-300'}`}
                                        />
                                        {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                                    Note: Address will be saved as "City - Street".
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Password Change Card */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                            <Lock className="h-5 w-5" /> Sécurité
                        </h3>
                        {!isChangingPassword && (
                            <button
                                onClick={() => setIsChangingPassword(true)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                Changer le mot de passe
                            </button>
                        )}
                    </div>

                    {passwordSuccess && (
                        <div className="px-4 py-3 bg-green-50 border-b border-green-200">
                            <p className="text-sm text-green-700">{passwordSuccess}</p>
                        </div>
                    )}

                    {isChangingPassword && (
                        <div className="px-4 py-5 sm:p-6">
                            <div className="grid grid-cols-1 gap-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={passwordForm.newPassword}
                                            onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            className={`block w-full border rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm ${passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'}`}
                                            placeholder="Minimum 6 caractères"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {passwordErrors.newPassword && <p className="text-xs text-red-600 mt-1">{passwordErrors.newPassword}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm ${passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="Répétez le mot de passe"
                                    />
                                    {passwordErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{passwordErrors.confirmPassword}</p>}
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => {
                                            setIsChangingPassword(false);
                                            setPasswordForm({ newPassword: '', confirmPassword: '' });
                                            setPasswordErrors({});
                                        }}
                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                    >
                                        <X className="h-4 w-4 mr-2" /> Annuler
                                    </button>
                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={isSavingPassword}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4 mr-2" /> {isSavingPassword ? 'Enregistrement...' : 'Enregistrer'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Historique des Commandes</h2>
                {loadingOrders ? (
                    <p>Loading orders...</p>
                ) : orders.length === 0 ? (
                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white shadow sm:rounded-lg overflow-hidden">
                                <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                                        <p className="mt-1 max-w-2xl text-sm text-gray-500 flex items-center">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {order.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                                    <ul className="divide-y divide-gray-200">
                                        {order.items.map((item, idx) => (
                                            <li key={idx} className="py-2 flex justify-between">
                                                <div className="flex items-center">
                                                    <span className="text-gray-500 text-sm mr-2">{item.quantity}x</span>
                                                    <span className="text-gray-900 font-medium">{item.name}</span>
                                                </div>
                                                <span className="text-gray-600">{item.price * item.quantity} MAD</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                                        <span className="text-lg font-bold text-gray-900">Total: {order.total} MAD</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;