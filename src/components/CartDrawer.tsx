'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { getProductImage } from '@/utils/imageHelpers';
import { useI18n } from '@/contexts/I18nContext';

const CartDrawer: React.FC = () => {
    const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, total } = useCart();
    const router = useRouter();
    const { t } = useI18n();

    if (!isOpen) return null;

    const getCategoryLabel = (cat: string) => {
        // @ts-ignore
        return t(`shop.categories.${cat}`) !== `shop.categories.${cat}` ? t(`shop.categories.${cat}`) : cat;
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            <div
                className="absolute inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity"
                onClick={() => setIsOpen(false)}
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md">
                    <div className="h-full flex flex-col bg-white shadow-xl">
                        <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                            <div className="flex items-start justify-between">
                                <h2 className="text-lg font-medium text-gray-900 font-serif">{t('cart.title')}</h2>
                                <div className="ml-3 h-7 flex items-center">
                                    <button onClick={() => setIsOpen(false)} className="-m-2 p-2 text-gray-400 hover:text-gray-500 transition-colors">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8">
                                {items.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 mb-4">{t('cart.empty.title')}</p>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="text-primary hover:text-primary/80 font-medium"
                                        >
                                            {t('cart.empty.action')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flow-root">
                                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                                            {items.map((item) => (
                                                <li key={item.id} className="py-6 flex">
                                                    <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                                                        <img
                                                            src={getProductImage(item.imageUrl)}
                                                            alt={item.name}
                                                            className="w-full h-full object-center object-cover"
                                                        />
                                                    </div>
                                                    <div className="ml-4 flex-1 flex flex-col">
                                                        <div>
                                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                                <h3 className="line-clamp-2 pr-2">{item.name}</h3>
                                                                <p className="whitespace-nowrap font-bold text-gray-900">{item.price * item.quantity} MAD</p>
                                                            </div>
                                                            <p className="mt-1 text-sm text-gray-500">{getCategoryLabel(item.category)}</p>
                                                        </div>
                                                        <div className="flex-1 flex items-end justify-between text-sm mt-2">
                                                            <div className="flex items-center gap-2 border border-gray-300 rounded-md p-1">
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                                                                    disabled={item.quantity <= 1}
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </button>
                                                                <span className="font-medium min-w-[1.5rem] text-center">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFromCart(item.id)}
                                                                className="font-medium text-red-500 hover:text-red-700 flex items-center transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-1" /> {t('cart.remove')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {items.length > 0 && (
                            <div className="border-t border-gray-200 py-6 px-4 sm:px-6 bg-gray-50">
                                <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                                    <p>{t('cart.subtotal')}</p>
                                    <p className="text-xl font-bold">{total} MAD</p>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500 mb-6">{t('cart.shipping_note')}</p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            router.push('/checkout');
                                        }}
                                        className="flex justify-center items-center w-full px-6 py-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
                                    >
                                        {t('cart.checkout')}
                                    </button>
                                    <button
                                        type="button"
                                        className="flex justify-center items-center w-full px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {t('cart.continue')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;
