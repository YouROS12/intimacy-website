import React from 'react';
import { HeroBlock as HeroBlockType } from '@/types';

export const HeroBlock: React.FC<{ block: HeroBlockType }> = ({ block }) => {
    return (
        <div className="mb-12 relative rounded-3xl overflow-hidden shadow-2xl">
            {block.image && (
                <div className="absolute inset-0">
                    <img
                        src={block.image}
                        alt={block.heading}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />
                </div>
            )}
            <div className={`relative z-10 p-8 md:p-12 ${block.image ? 'text-white' : 'text-slate-900 bg-slate-50'}`}>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 font-serif leading-tight">
                    {block.heading}
                </h2>
                {block.subheading && (
                    <p className="text-lg md:text-2xl opacity-90 font-light leading-relaxed max-w-3xl">
                        {block.subheading}
                    </p>
                )}
            </div>
        </div>
    );
};
