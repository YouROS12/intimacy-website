"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function UpdatePasswordPage() {
    const { updatePassword } = useAuth();
    const { t } = useI18n();
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage(t('auth.errors.password_mismatch'));
            setStatus('error');
            return;
        }

        if (password.length < 6) {
            setErrorMessage(t('auth.errors.password_short'));
            setStatus('error');
            return;
        }

        setStatus('loading');
        setErrorMessage('');

        try {
            await updatePassword(password);
            setStatus('success');
            // Redirect after delay
            setTimeout(() => {
                router.push('/profile?updated=true');
            }, 2000);
        } catch (error: any) {
            console.error("Update password error:", error);
            setStatus('error');
            setErrorMessage(error.message || t('auth.errors.general'));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8" dir={t('dir') as any}>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center mb-6">
                    <span className="font-serif text-2xl font-bold text-slate-900">{t('nav.title')}</span>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 font-serif">
                    {t('auth.update_password.title')}
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    {t('auth.update_password.subtitle')}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-100">
                    {status === 'success' ? (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">{t('auth.update_password.success_title')}</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                {t('auth.update_password.success_desc')}
                            </p>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                    {t('auth.password')}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md focus:ring-brand-500 focus:border-brand-500 py-3"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                                    {t('auth.confirm_password')}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md focus:ring-brand-500 focus:border-brand-500 py-3"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <AlertCircle className="h-5 w-5 text-red-400" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                                            <div className="mt-2 text-sm text-red-700">
                                                <p>{errorMessage}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {status === 'loading' ? t('auth.loading') : t('auth.update_password.submit')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
