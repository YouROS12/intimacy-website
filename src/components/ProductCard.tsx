"use client";

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { getProductImage } from '@/utils/imageHelpers';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <Link href={`/product/${product.id}`} className="group relative glass-card rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 flex flex-col h-full border border-white/20 hover:border-brand-300/50">
            <div className="aspect-[4/5] w-full overflow-hidden relative bg-white/5">
                <img
                    src={getProductImage(product.imageUrl)}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                {/* Price Badge - Floating */}
                <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/50">
                    <span className="text-sm font-bold text-brand-700">{product.price} MAD</span>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col relative z-10">
                <span className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-2">{product.category}</span>
                <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2 leading-tight">
                    {product.name}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                    {product.description}
                </p>
                <div className="mt-auto pt-4 border-t border-brand-100/50 flex items-center justify-between text-brand-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                    Voir le produit <span>→</span>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
