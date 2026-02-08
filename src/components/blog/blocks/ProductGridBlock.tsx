import React from 'react';
import Link from 'next/link';
import { ProductGridBlock as ProductGridBlockType, Product } from '@/types';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const ProductGridBlock: React.FC<{ block: ProductGridBlockType; products: Product[] }> = ({ block, products }) => {
    // Defensive: Handle missing productIds safely
    const ids = block.productIds || [];

    // Filter out products that match the IDs in this specific block
    const blockProducts = products.filter(p => ids.includes(p.id));

    if (blockProducts.length === 0) return null;

    return (
        <div className="my-12 bg-gradient-to-br from-brand-50/50 to-white border border-brand-100/50 rounded-3xl p-6 md:p-10 shadow-sm">
            <h3 className="text-xl font-bold text-brand-900 mb-8 flex items-center gap-2 font-serif">
                <ShoppingBag className="h-5 w-5 text-brand-600" />
                {block.title || "Nos Recommandations"}
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
                {blockProducts.map(product => (
                    <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="flex flex-col sm:flex-row items-center gap-5 bg-white p-5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-50 group no-underline"
                    >
                        {/* Image Container */}
                        <div className="h-28 w-28 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-3 relative group-hover:bg-brand-50/30 transition-colors">
                            {product.imageUrl || product.image_url ? (
                                <img
                                    src={product.imageUrl || product.image_url}
                                    alt={product.name}
                                    className="h-full w-auto object-contain mix-blend-multiply filter group-hover:brightness-110 transition-all"
                                />
                            ) : (
                                <div className="text-gray-300">No Image</div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="text-center sm:text-left flex-grow min-w-0">
                            <h4 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors line-clamp-2 leading-tight mb-2">
                                {product.name}
                            </h4>
                            <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                                {product.description}
                            </p>

                            <div className="flex items-center justify-center sm:justify-start">
                                <span className="inline-flex items-center text-xs font-bold text-brand-600 uppercase tracking-wide bg-brand-50 px-3 py-1.5 rounded-full group-hover:bg-brand-600 group-hover:text-white transition-all">
                                    Voir le produit <ArrowRight className="ml-1.5 h-3 w-3" />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
