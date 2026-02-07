'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getOrderById } from '@/services/api';
import { Order } from '@/types';
import { CheckCircle, Package, Phone, ArrowRight, Home, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';

const WHATSAPP_NUMBER = '212656201278';

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useI18n();

    // Retrieve params from URL
    const orderId = searchParams.get('orderId');
    const email = searchParams.get('email');
    const isNewAccount = searchParams.get('newAccount') === 'true';

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) {
            router.push('/');
            return;
        }

        getOrderById(orderId).then(data => {
            setOrder(data);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load order", err);
            setLoading(false);
        });

    }, [orderId, router]);


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!order) {
        return <div className="p-8 text-center">{t('auth.errors.general')}</div>;
    }

    const orderNumber = order.id.slice(0, 8).toUpperCase();

    // We can translate the WhatsApp message too if we want, but keeping it French/Arabic default is fine.
    // Let's use French as base for WA.
    const whatsappMessage = encodeURIComponent(
        `Bonjour! Je viens de passer la commande #${orderNumber}. Je souhaite confirmer ma commande.`
    );
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
            <div className="max-w-lg mx-auto text-center">
                {/* Success Icon */}
                <div className="mb-8">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                </div>

                {/* Main Message */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4 font-serif">
                    {t('confirmation.title')}
                </h1>
                <p className="text-gray-600 mb-8">
                    {t('confirmation.message')}
                </p>

                {/* Email Verification Banner */}
                {isNewAccount && email && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
                        <h3 className="font-bold text-blue-900 text-lg mb-2">{t('confirmation.email_check')}</h3>
                        <p className="text-blue-800 mb-4">
                            {t('confirmation.account_created')} <strong>{email}</strong>
                        </p>
                        <div className="text-sm text-blue-600 bg-blue-100 p-3 rounded-lg">
                            <strong>Note:</strong> {t('confirmation.message')}
                        </div>
                    </div>
                )}

                {/* Order Details Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                        <span className="text-sm text-gray-500">{t('confirmation.order_number')}</span>
                        <span className="font-mono font-bold text-gray-900 text-lg">#{orderNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{t('confirmation.total')}</span>
                        <span className="font-bold text-brand-600 text-xl">{order.total} MAD</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-green-600 hover:bg-green-700 transition-all transform hover:-translate-y-0.5"
                    >
                        <Phone className="h-5 w-5 mr-2" />
                        {t('confirmation.track_order')} (WhatsApp)
                    </a>

                    <Link
                        href="/shop"
                        className="block w-full px-6 py-4 border border-gray-200 rounded-xl text-base font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        {t('confirmation.continue_shopping')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <OrderConfirmationContent />
        </Suspense>
    );
}
