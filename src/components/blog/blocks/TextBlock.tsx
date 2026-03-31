import React from 'react';
import { TextBlock as TextBlockType } from '@/types';
import { sanitizeHTML } from '@/utils/sanitize';

export const TextBlock: React.FC<{ block: TextBlockType }> = ({ block }) => {
    return (
        <div className="mb-8">
            {block.title && (
                <h3 className="text-2xl font-bold text-slate-800 mb-4 mt-8 font-serif">
                    {block.title}
                </h3>
            )}
            <div
                className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed custom-prose"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(block.content) }}
            />
        </div>
    );
};
