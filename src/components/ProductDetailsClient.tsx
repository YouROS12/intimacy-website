"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';

interface Props {
    product: Product;
    relatedProducts: Product[];
}

const ProductDetailsClient: React.FC<Props> = ({ product, relatedProducts }) => {
    const router = useRouter();
    const { addToCart } = useCart();
    const [addingToCart, setAddingToCart] = useState(false);

    const handleAddToCart = (p: Product) => {
        setAddingToCart(true);
        addToCart(p);
        setTimeout(() => setAddingToCart(false), 500);
    };

    return (
        <div className="bg-white min-h-screen">
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-brand-600 mb-6">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Retour à la boutique
                </button>

                <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                    {/* Image */}
                    <div className="flex flex-col">
                        <div className="aspect-w-1 aspect-h-1 w-full rounded-lg overflow-hidden relative" style={{ aspectRatio: '1/1' }}>
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-center object-cover absolute inset-0"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 mb-4">
                            {product.category}
                        </span>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>

                        <div className="mt-3">
                            <h2 className="sr-only">Product information</h2>
                            <p className="text-3xl text-gray-900">{product.price} MAD</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <p className="text-base text-gray-700">{product.description}</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-gray-900">Points Forts</h3>
                            <ul role="list" className="mt-4 space-y-2">
                                {product.features?.map((feature, idx) => (
                                    <li key={idx} className="flex items-center text-sm text-gray-500">
                                        <Check className="h-4 w-4 text-green-500 mr-2" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-6 flex items-start p-4 bg-blue-50 rounded-md">
                            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-blue-700">
                                <strong>Livraison Discrète:</strong> Cet article est expédié dans un emballage neutre. Aucune description du contenu sur l'étiquette.
                            </p>
                        </div>

                        <div className="mt-10 flex sm:flex-col1">
                            <button
                                type="button"
                                onClick={() => handleAddToCart(product)}
                                className={`max-w-xs flex-1 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-brand-500 sm:w-full transition-colors ${addingToCart ? 'bg-green-600' : 'bg-brand-600 hover:bg-brand-700'}`}
                            >
                                {addingToCart ? (
                                    <>
                                        <Check className="h-5 w-5 mr-2" /> Ajouté !
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="h-5 w-5 mr-2" /> Ajouter au panier
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16 border-t border-gray-200 pt-10">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Vous aimerez peut-être aussi</h2>
                        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                            {relatedProducts.map((rp) => (
                                <Link key={rp.id} href={`/product/${rp.id}`} className="group relative">
                                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:aspect-none lg:h-80 relative" style={{ aspectRatio: '1/1' }}>
                                        <img
                                            src={rp.imageUrl}
                                            alt={rp.name}
                                            className="h-full w-full object-cover object-center lg:h-full lg:w-full absolute inset-0"
                                        />
                                    </div>
                                    <div className="mt-4 flex justify-between">
                                        <div>
                                            <h3 className="text-sm text-gray-700">
                                                <span aria-hidden="true" className="absolute inset-0" />
                                                {rp.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">{rp.category}</p>
                                        </div>
                                        <p className="text-sm font-medium text-brand-600">{rp.price} MAD</p>
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
