import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Phone, ArrowRight, Home } from 'lucide-react';
import SeoHead from '../components/SeoHead';

interface OrderConfirmationState {
    orderId: string;
    total: number;
    itemCount: number;
    email?: string;
    isNewAccount?: boolean;
    accountSkipped?: boolean;
}

const WHATSAPP_NUMBER = '212656201278';

const OrderConfirmation: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as OrderConfirmationState | null;

    // If no order state, redirect to home
    useEffect(() => {
        if (!state?.orderId) {
            navigate('/', { replace: true });
        }
    }, [state, navigate]);

    if (!state?.orderId) {
        return null;
    }

    const orderNumber = state.orderId.slice(0, 8).toUpperCase();
    const whatsappMessage = encodeURIComponent(
        `Bonjour! Je viens de passer la commande #${orderNumber}. Je souhaite confirmer ma commande.`
    );
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
            <SeoHead title="Order Confirmed" />

            <div className="max-w-lg mx-auto text-center">
                {/* Success Icon */}
                <div className="mb-8">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                </div>

                {/* Main Message */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Thank You for Your Order!
                </h1>
                <p className="text-gray-600 mb-8">
                    Your order has been placed successfully. We'll call you shortly to confirm delivery details.
                </p>

                {/* Email Verification Banner */}
                {state.isNewAccount && state.email && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
                        <h3 className="font-bold text-blue-900 text-lg mb-2">Verify Your Email</h3>
                        <p className="text-blue-800 mb-4">
                            We've created your account! Please check your email <strong>{state.email}</strong> to verify your account and access your order history.
                        </p>
                        <div className="text-sm text-blue-600 bg-blue-100 p-3 rounded-lg">
                            <strong>Note:</strong> Your order is already confirmed! You don't need to verify email to receive your package.
                        </div>
                    </div>
                )}

                {/* Account Skipped Warning */}
                {state.accountSkipped && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 text-left">
                        <h3 className="font-bold text-yellow-900 text-lg mb-2">Account Creation Skipped</h3>
                        <p className="text-yellow-800">
                            We couldn't create your account at this moment (system busy), but <strong>your order was placed successfully!</strong>
                        </p>
                        <p className="text-sm text-yellow-700 mt-2">
                            You can create an account later by visiting the login page.
                        </p>
                    </div>
                )}

                {/* Order Details Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                        <span className="text-sm text-gray-500">Order Number</span>
                        <span className="text-lg font-bold text-brand-600">#{orderNumber}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                        <span className="text-sm text-gray-500">Items</span>
                        <span className="font-medium">{state.itemCount} product{state.itemCount > 1 ? 's' : ''}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                        <span className="text-sm text-gray-500">Total</span>
                        <span className="text-xl font-bold text-gray-900">{state.total} MAD</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Payment</span>
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            Cash on Delivery
                        </span>
                    </div>
                </div>

                {/* What's Next */}
                <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        What Happens Next?
                    </h3>
                    <ol className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                            <span>We'll call you within 24 hours to confirm your order and delivery time.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                            <span>Your package will be prepared with <strong>discreet packaging</strong> - no product descriptions on the label.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                            <span>Delivery typically takes 2-5 business days. Pay when you receive your order.</span>
                        </li>
                    </ol>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-bold transition-colors"
                    >
                        <Phone className="h-5 w-5" />
                        Contact Us on WhatsApp
                    </a>

                    <Link
                        to="/profile"
                        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-4 px-6 rounded-xl font-bold transition-colors"
                    >
                        View My Orders
                        <ArrowRight className="h-5 w-5" />
                    </Link>

                    <Link
                        to="/"
                        className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 py-3 transition-colors"
                    >
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>

                {/* Trust Badge */}
                <p className="mt-8 text-xs text-gray-400">
                    Questions? Call us at +212 656 201 278 or message us on WhatsApp.
                </p>
            </div>
        </div>
    );
};

export default OrderConfirmation;
