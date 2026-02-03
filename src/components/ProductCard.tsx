"use client";

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <Link href={`/product/${product.id}`} className="group relative bg-white rounded-2xl p-4 hover:shadow-xl transition-all border border-transparent hover:border-gray-100 flex flex-col h-full">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-100 relative">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                {/* Quick Action Overlay (Optional) */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="mt-4 flex-1 flex flex-col">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                    {product.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2 mb-3">
                    {product.description}
                </p>
                <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-bold text-brand-600">{product.price} MAD</span>
                    <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">{product.category}</span>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
