import React from 'react';
import { BlogContent, BlogBlock, Product } from '@/types';
import { TextBlock } from './blog/blocks/TextBlock';
import { HeroBlock } from './blog/blocks/HeroBlock';
import { QuoteBlock } from './blog/blocks/QuoteBlock';
import { AlertBlock } from './blog/blocks/AlertBlock';
import { ProductGridBlock } from './blog/blocks/ProductGridBlock';
import { ExternalLink } from 'lucide-react';

interface BlogRendererProps {
    content: string | BlogContent | null; // Allow string (legacy/raw) or typed object
    products?: Product[];
}

const BlogRenderer: React.FC<BlogRendererProps> = ({ content, products = [] }) => {
    // 1. Robust Parsing Logic (Restored from Legacy)
    let data: BlogContent | null = null;
    let rawHtml: string | null = null;

    if (!content) return null;

    if (typeof content === 'string') {
        try {
            // Attempt to parse JSON
            const parsed = JSON.parse(content);
            if (parsed && (parsed.blocks || parsed.theme)) {
                data = parsed as BlogContent;
            } else {
                // If JSON parse works but looks like just a string or flat object, treat as HTML
                // actually if it has blocks it's good.
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
    // If we couldn't get structured data, render as prose
    if (!data && rawHtml) {
        return (
            <div
                className="prose prose-lg prose-slate max-w-none font-serif"
                dangerouslySetInnerHTML={{ __html: rawHtml }}
            />
        );
    }

    if (!data || !data.blocks) return null;

    // 3. Structured Layout
    return (
        <div className={`blog-theme-${data.theme || 'educational_deep_dive'} space-y-8`}>
            {data.blocks.map((block: BlogBlock, idx: number) => {
                // Determine key safely
                const key = block.id || `block-${idx}`;

                switch (block.type) {
                    case 'text':
                        return <TextBlock key={key} block={block} />;
                    case 'hero':
                        return <HeroBlock key={key} block={block} />;
                    case 'quote':
                        return <QuoteBlock key={key} block={block} />;
                    case 'alert':
                        return <AlertBlock key={key} block={block} />;
                    case 'product_grid':
                        return <ProductGridBlock key={key} block={block} products={products} />;
                    default:
                        // Fallback for unknown blocks (e.g. legacy 'image' type)
                        console.warn(`Unknown block type: ${(block as any).type}`);
                        return null;
                }
            })}

            {/* References Section */}
            {data.references && data.references.length > 0 && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 mt-16">
                    <h4 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider border-b border-slate-200 pb-2">
                        Sources & Références
                    </h4>
                    <ul className="space-y-3">
                        {data.references.map((ref, idx) => (
                            <li key={idx} className="text-sm text-slate-600 leading-relaxed flex items-start gap-2">
                                <span className="text-brand-400 mt-1.5">•</span>
                                {ref.url ? (
                                    <a
                                        href={ref.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-brand-600 hover:underline transition-colors inline-flex items-center gap-1"
                                    >
                                        {ref.text} <ExternalLink className="h-3 w-3 opacity-50" />
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

export default BlogRenderer;
