'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getOrderById } from '@/services/api';
import { Order } from '@/types';
import { CheckCircle, Package, Phone, ArrowRight, Home, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const WHATSAPP_NUMBER = '212656201278';

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    // Retrieve params from URL (instead of location.state in React Router)
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

        // Fetch simpler order display info if needed, or just use IDs.
        // For accurate pricing/items, we should probably fetch the order.
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
        return <div className="p-8 text-center">Ordre introuvable.</div>;
    }

    const orderNumber = order.id.slice(0, 8).toUpperCase();
    const total = order.total;
    const itemCount = order.items.length;

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
                    Merci pour votre commande !
                </h1>
                <p className="text-gray-600 mb-8">
                    Votre commande a été passée avec succès. Nous vous appellerons bientôt pour confirmer la livraison.
                </p>

                {/* Email Verification Banner */}
                {isNewAccount && email && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
                        <h3 className="font-bold text-blue-900 text-lg mb-2">Vérifiez votre email</h3>
                        <p className="text-blue-800 mb-4">
                            Votre compte a été créé ! Veuillez vérifier votre email <strong>{email}</strong> pour activer votre compte.
                        </p>
                        <div className="text-sm text-blue-600 bg-blue-100 p-3 rounded-lg">
                            <strong>Note:</strong> Votre commande est déjà validée ! Pas besoin de vérifier l&apos;email pour recevoir votre colis.
                        </div>
                    </div>
                )}

                {/* Order Details Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                        <span className="text-sm text-gray-500">Numéro de commande</span>
                        <span className="text-lg font-bold text-primary">#{orderNumber}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                        <span className="text-sm text-gray-500">Articles</span>
                        <span className="font-medium">{itemCount} article{itemCount > 1 ? 's' : ''}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                        <span className="text-sm text-gray-500">Total</span>
                        <span className="text-xl font-bold text-gray-900">{total} MAD</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Paiement</span>
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            À la livraison
                        </span>
                    </div>
                </div>

                {/* What's Next */}
                <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left border border-blue-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        Que va-t-il se passer ?
                    </h3>
                    <ol className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                            <span>Nous vous appellerons sous 24h pour confirmer la commande.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                            <span>Votre colis sera préparé avec un <strong>emballage discret</strong>.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                            <span>Paiement à la livraison en espèces.</span>
                        </li>
                    </ol>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-4 px-6 rounded-xl font-bold transition-colors shadow-lg shadow-green-500/20"
                    >
                        <Phone className="h-5 w-5" />
                        Nous contacter sur WhatsApp
                    </a>

                    {user ? (
                        <Link
                            href="/profile"
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-4 px-6 rounded-xl font-bold transition-colors shadow-lg shadow-primary/20"
                        >
                            Voir mes commandes
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="w-full flex flex-col items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white py-4 px-6 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                        >
                            <span className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Créer un compte pour suivre mes commandes
                            </span>
                            <span className="text-xs font-normal opacity-90">
                                Accédez à l'historique et gérez vos livraisons
                            </span>
                        </Link>
                    )}

                    <Link
                        href="/"
                        className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 py-3 transition-colors"
                    >
                        <Home className="h-4 w-4" />
                        Retour à l&apos;accueil
                    </Link>
                </div>

                {/* Trust Badge */}
                <p className="mt-8 text-xs text-gray-400">
                    Questions ? Appelez-nous au +212 656 201 278
                </p>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
            <OrderConfirmationContent />
        </Suspense>
    );
}
