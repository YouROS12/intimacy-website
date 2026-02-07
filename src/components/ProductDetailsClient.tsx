"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { getProductImage } from '@/utils/imageHelpers';
import { useI18n } from '@/contexts/I18nContext';

interface Props {
    product: Product;
    relatedProducts: Product[];
}

const ProductDetailsClient: React.FC<Props> = ({ product, relatedProducts }) => {
    const router = useRouter();
    const { addToCart } = useCart();
    const { t } = useI18n();
    const [addingToCart, setAddingToCart] = useState(false);

    const handleAddToCart = (p: Product) => {
        setAddingToCart(true);
        addToCart(p);
        setTimeout(() => setAddingToCart(false), 500);
    };

    const getCategoryLabel = (cat: string) => {
        // @ts-ignore
        return t(`shop.categories.${cat}`) !== `shop.categories.${cat}` ? t(`shop.categories.${cat}`) : cat;
    };

    return (
        <div className="bg-cream min-h-screen">
            {/* Schema.org Microdata */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": product.name,
                    "description": product.description,
                    "image": product.imageUrl,
                    "offers": {
                        "@type": "Offer",
                        "price": product.price,
                        "priceCurrency": "MAD",
                        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                        "url": typeof window !== 'undefined' ? window.location.href : ''
                    }
                })
            }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-brand-600 mb-8 transition-colors group">
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> {t('product.back_to_shop')}
                </button>

                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
                    {/* Image */}
                    <div className="flex flex-col">
                        <div className="aspect-w-1 aspect-h-1 w-full rounded-3xl overflow-hidden relative shadow-2xl shadow-brand-900/10 border border-white/20" style={{ aspectRatio: '1/1' }}>
                            <img
                                src={getProductImage(product.imageUrl)}
                                alt={product.name}
                                className="w-full h-full object-center object-cover absolute inset-0 transform hover:scale-105 transition-transform duration-700"
                            />
                            {/* Overlay Texture */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-brand-100 text-brand-800 mb-6 border border-brand-200 uppercase tracking-widest">
                            {getCategoryLabel(product.category)}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight text-slate-900 mb-4">{product.name}</h1>

                        <div className="mt-6 flex items-baseline">
                            <p className="text-4xl font-bold text-brand-600">{product.price} MAD</p>
                        </div>

                        <div className="mt-8 prose prose-slate">
                            <p className="text-lg text-slate-600 leading-relaxed font-sans">{product.description}</p>
                        </div>

                        <div className="mt-10">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">{t('product.highlights')}</h3>
                            <ul role="list" className="space-y-4">
                                {product.features?.map((feature, idx) => (
                                    <li key={idx} className="flex items-start text-base text-slate-600">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                                            <Check className="h-4 w-4 text-green-600" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-8 flex items-start p-5 bg-white/50 backdrop-blur-sm rounded-2xl border border-brand-100">
                            <AlertCircle className="h-6 w-6 text-brand-500 mt-0.5 mr-4 flex-shrink-0" />
                            <p className="text-sm text-slate-600">
                                <strong className="block text-brand-800 mb-1">{t('product.discrete_shipping.title')}</strong>
                                {t('product.discrete_shipping.description')}
                            </p>
                        </div>

                        <div className="mt-10 flex sm:flex-col1">
                            <button
                                type="button"
                                onClick={() => handleAddToCart(product)}
                                className={`w-full flex-1 border border-transparent rounded-full py-5 px-8 flex items-center justify-center text-lg font-bold text-white focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-all duration-300 shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 transform hover:-translate-y-1 ${addingToCart ? 'bg-green-600' : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400'}`}
                            >
                                {addingToCart ? (
                                    <>
                                        <Check className="h-6 w-6 mr-3" /> {t('product.added')}
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="h-6 w-6 mr-3" /> {t('product.add_to_cart')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-24 border-t border-brand-100 pt-16">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl font-serif font-black tracking-tight text-slate-900">{t('product.related')}</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedProducts.map((rp) => (
                                <Link key={rp.id} href={`/product/${rp.id}`} className="group relative">
                                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-2xl bg-white shadow-lg border border-white/20 relative" style={{ aspectRatio: '1/1' }}>
                                        <img
                                            src={getProductImage(rp.imageUrl)}
                                            alt={rp.name}
                                            className="h-full w-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                                    </div>
                                    <div className="mt-6">
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors font-serif">
                                            <span aria-hidden="true" className="absolute inset-0" />
                                            {rp.name}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500 font-medium mb-2">{getCategoryLabel(rp.category)}</p>
                                        <p className="text-lg font-bold text-brand-600">{rp.price} MAD</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailsClient;
