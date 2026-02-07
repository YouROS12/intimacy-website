import React from 'react';
import { BlogContent, BlogBlock, Product } from '@/types';
import { Quote, ShoppingBag, Info, AlertTriangle, Lightbulb, ExternalLink } from 'lucide-react';
import Link from 'next/link';
// Removed MOCK_PRODUCTS import to force real data usage

interface BlogRendererProps {
    content: string | BlogContent; // Can be raw HTML (string) or JSON object
    products?: Product[]; // Real products fetched from DB
}

const BlogRenderer: React.FC<BlogRendererProps> = ({ content, products = [] }) => {
    // 1. Safe Parsing Logic
    let data: BlogContent | null = null;
    let rawHtml: string | null = null;

    if (typeof content === 'string') {
        try {
            // Attempt to parse JSON
            const parsed = JSON.parse(content);
            if (parsed.theme && parsed.blocks) {
                data = parsed as BlogContent;
            } else {
                rawHtml = content;
            }
        } catch (e) {
            // Not JSON, treat as HTML
            rawHtml = content;
        }
    } else {
        data = content;
    }

    // 2. Legacy Fallback (Raw HTML)
    if (rawHtml) {
        return (
            <div
                className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-brand-600 font-serif"
                dangerouslySetInnerHTML={{ __html: rawHtml }}
            />
        );
    }

    if (!data) return null;

    // 3. Theme Containers
    return (
        <div className={`blog-theme-${data.theme} max-w-3xl mx-auto space-y-12`}>
            {data.blocks.map((block, idx) => (
                <BlockRenderer key={idx} block={block} products={products} />
            ))}

            {data.references && data.references.length > 0 && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-sm text-gray-500 mt-12 mb-8">
                    <h4 className="font-bold text-gray-700 mb-2 uppercase text-xs tracking-wider">Sources & Références</h4>
                    <ul className="space-y-1">
                        {data.references.map((ref, idx) => (
                            <li key={idx}>
                                {ref.url ? (
                                    <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline flex items-center gap-1">
                                        {ref.text}
                                        <ExternalLink className="h-3 w-3" />
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

// --- Block Renderers ---

const BlockRenderer: React.FC<{ block: BlogBlock }> = ({ block }) => {
    switch (block.type) {
        case 'hero':
            return (
                <div className="mb-8">
                    {block.image && (
                        <img src={block.image} alt="Hero" className="w-full h-64 object-cover rounded-2xl mb-6 shadow-md" />
                    )}
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{block.heading}</h2>
                    {block.subheading && <p className="text-xl text-slate-500">{block.subheading}</p>}
                </div>
            );

        case 'text':
            return (
                <div
                    className="prose prose-slate max-w-none text-gray-700 leading-relaxed font-serif text-lg"
                    dangerouslySetInnerHTML={{ __html: block.content || '' }}
                />
            );

        case 'quote':
            return (
                <blockquote className="border-l-4 border-brand-500 pl-6 italic my-8 text-gray-700 bg-brand-50 py-6 pr-4 rounded-r-lg shadow-sm relative">
                    <Quote className="absolute top-4 right-4 text-brand-200 h-8 w-8" />
                    <div dangerouslySetInnerHTML={{ __html: block.content || '' }} className="text-lg font-medium mb-2" />
                    {block.author && (
                        <footer className="text-sm text-brand-700 font-bold">— {block.author}</footer>
                    )}
                </blockquote>
            );

        case 'alert':
            const alertColors = {
                info: 'bg-blue-50 text-blue-800 border-blue-100',
                warning: 'bg-yellow-50 text-yellow-800 border-yellow-100',
                tip: 'bg-green-50 text-green-800 border-green-100'
            };
            const icons = {
                info: <Info className="h-5 w-5" />,
                warning: <AlertTriangle className="h-5 w-5" />,
                tip: <Lightbulb className="h-5 w-5" />
            };
            const variant = block.variant || 'info';

            return (
                <div className={`p-4 rounded-lg border flex gap-3 ${alertColors[variant]}`}>
                    <div className="mt-0.5">{icons[variant]}</div>
                    <div
                        className="text-sm leading-relaxed font-medium"
                        dangerouslySetInnerHTML={{ __html: block.content || '' }}
                    />
                </div>
            );

        case 'product_grid':
            if (!block.productIds || !Array.isArray(block.productIds)) return null;
            const validIds = block.productIds.filter(id => id && typeof id === 'string'); // Filter empty strings

            // Use passed products prop
            const displayProducts = products.filter(p => validIds.includes(p.id));
            if (displayProducts.length === 0) return null;

            return (
                <div className="my-10 bg-gradient-to-br from-brand-50 to-white border border-brand-100 rounded-2xl p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-brand-800 mb-6 flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" /> {block.title || "Nos Recommandations"}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {displayProducts.map(product => (
                            <Link key={product.id} href={`/product/${product.id}`} className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-100 group no-underline">
                                <div className="h-24 w-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-2">
                                    <img src={product.imageUrl} alt={product.name} className="h-full w-auto object-contain group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-brand-600 transition-colors line-clamp-2">{product.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-2">{product.description}</p>
                                    <span className="inline-block bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                        Voir le produit
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            );

        default:
            return null;
    }
};

export default BlogRenderer;
