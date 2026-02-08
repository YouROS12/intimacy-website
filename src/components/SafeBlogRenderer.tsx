"use client";

import React from 'react';
import { SafeBlogContent, SafeBlogBlock } from '@/lib/validation';
import { Product } from '@/types';

// Import existing blocks - assuming they are reasonably safe or we will wrap them
import { TextBlock } from './blog/blocks/TextBlock';
import { HeroBlock } from './blog/blocks/HeroBlock';
import { QuoteBlock } from './blog/blocks/QuoteBlock';
import { AlertBlock } from './blog/blocks/AlertBlock';
import { ProductGridBlock } from './blog/blocks/ProductGridBlock';
import { ExternalLink, AlertOctagon } from 'lucide-react';

interface Props {
    content: SafeBlogContent | null;
    products?: Product[];
    rawContent?: any; // For fallback
}

// Error Boundary Component for individual blocks
class BlockErrorBoundary extends React.Component<{ children: React.ReactNode, fallback?: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("Block rendering failed:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || null;
        }
        return this.props.children;
    }
}

const SafeBlogRenderer: React.FC<Props> = ({ content, products = [], rawContent }) => {
    // 1. Fallback for Invalid JSON
    if (!content) {
        if (typeof rawContent === 'string') {
            return (
                <div
                    className="prose prose-lg prose-slate max-w-none font-serif opacity-80"
                    dangerouslySetInnerHTML={{ __html: rawContent }}
                />
            );
        }
        return (
            <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                <AlertOctagon className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>Contenu indisponible</p>
            </div>
        );
    }

    // 2. Render Valid Content
    return (
        <div className={`blog-theme-${content.theme} space-y-8`}>
            {content.blocks.map((block: SafeBlogBlock, idx: number) => {
                const key = block.id || `safe-block-${idx}`;

                return (
                    <BlockErrorBoundary key={key} fallback={<div className="hidden" data-error={`block-${idx}`} />}>
                        {/* @ts-ignore: Types alignment between Zod/Supabase */}
                        <BlockDispatcher block={block} products={products} />
                    </BlockErrorBoundary>
                );
            })}

            {/* References */}
            {content.references.length > 0 && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 mt-16">
                    <h4 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider border-b border-slate-200 pb-2">
                        Sources & Références
                    </h4>
                    <ul className="space-y-3">
                        {content.references.map((ref, i) => (
                            <li key={i} className="text-sm text-slate-600 leading-relaxed flex items-start gap-2">
                                <span className="text-brand-400 mt-1.5">•</span>
                                {ref.url ? (
                                    <a href={ref.url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 hover:underline">
                                        {ref.text} <ExternalLink className="h-3 w-3 inline opacity-50" />
                                    </a>
                                ) : (
                                    <span>{ref.text}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// Dispatcher Component
const BlockDispatcher = ({ block, products }: { block: SafeBlogBlock, products: Product[] }) => {
    switch (block.type) {
        case 'text': return <TextBlock block={block as any} />;
        case 'hero': return <HeroBlock block={block as any} />;
        case 'quote': return <QuoteBlock block={block as any} />;
        case 'alert': return <AlertBlock block={block as any} />;
        case 'product_grid': return <ProductGridBlock block={block as any} products={products} />;
        case 'image_group': return <div className="text-gray-400 italic text-sm text-center">Images: {block.images.length}</div>; // Todo: Implement ImageGroup
        default: return null;
    }
}

export default SafeBlogRenderer;
