import React from 'react';
import { QuoteBlock as QuoteBlockType } from '@/types';
import { Quote } from 'lucide-react';

export const QuoteBlock: React.FC<{ block: QuoteBlockType }> = ({ block }) => {
    return (
        <blockquote className="my-12 relative">
            <div className="absolute -top-4 -left-4 text-brand-100 transform -scale-x-100">
                <Quote className="h-16 w-16 opacity-50" />
            </div>
            <div className="relative z-10 pl-6 border-l-4 border-brand-500">
                <p className="text-xl md:text-2xl font-serif text-slate-700 italic leading-relaxed mb-4">
                    "{block.content.replace(/<[^>]*>?/gm, '')}"
                </p>
                {(block.author || block.role) && (
                    <footer className="text-sm">
                        <span className="font-bold text-slate-900 block">{block.author}</span>
                        <span className="text-slate-500">{block.role}</span>
                    </footer>
                )}
            </div>
        </blockquote>
    );
};
