"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, BookOpen, Heart, Activity, Shield, ArrowRight, Calendar, Clock } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface EducationClientProps {
    initialGuides: any[]; // PSEO Pages
    initialPosts: any[];  // Blog Posts
}

const CATEGORIES = [
    { id: 'Wellness', name: 'wellness', icon: Heart, color: 'text-rose-500' },
    { id: 'Performance', name: 'performance', icon: Activity, color: 'text-blue-500' },
    { id: 'Health', name: 'health', icon: Shield, color: 'text-green-500' },
    { id: 'Education', name: 'education', icon: BookOpen, color: 'text-purple-500' },
];

const EmptyState = ({ reset }: { reset: () => void }) => {
    const { t: tRaw } = useI18n();
    const t = (key: string) => tRaw(`education.${key}`);
    return (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 text-lg mb-4">{t('empty')}</p>
            <button onClick={reset} className="text-brand-600 font-bold hover:underline">
                {t('reset')}
            </button>
        </div>
    );
};

const EducationClient: React.FC<EducationClientProps> = ({ initialGuides, initialPosts }) => {
    const { t: tRaw } = useI18n();
    const t = (key: string) => tRaw(`education.${key}`);

    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Normalize and Merge Data
    const allItems = [
        ...(initialGuides || []).map(g => ({
            id: g.id,
            type: 'guide',
            title: g.title,
            slug: g.slug, // PSEO typically uses /solution/ or similar, but simplified here?
            // Wait, PSEO pages are served at /solution/[slug] usually? 
            // Or /guide/[slug] if they are treated as articles?
            // The previous code linked guides to /guide/[slug] too (line 143 in original).
            // Let's assume strict URL structure: /guide/[slug] for all for now, or respect original.
            // Original: href={`/guide/${guide.slug}`}
            link: `/guide/${g.slug}`,
            description: g.problem?.description || g.description,
            image: null, // Guides might not have cover images yet?
            category: 'Guide', // Or derive
            date: g.created_at
        })),
        ...(initialPosts || []).map(p => ({
            id: p.id,
            type: 'article',
            title: p.title,
            slug: p.slug,
            link: `/guide/${p.slug}`,
            description: p.excerpt,
            image: p.cover_image,
            category: p.category || 'Article',
            date: p.published_at
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Filter Logic
    const filteredItems = allItems.filter(item => {
        const matchSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());

        // Basic category filtering (simplified for now as PSEO doesn't map perfectly to these categories yet)
        // If we want to use the CATEGORIES filter, we need real category data on items.
        // For now, 'all' is default.
        const matchFilter = filter === 'all' // || item.category === filter; 

        return matchSearch && matchFilter;
    });

    return (
        <div className="bg-white min-h-screen pb-12">

            {/* Hero Section */}
            <div className="bg-slate-900 py-16 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-brand-300 text-sm font-semibold mb-4 border border-white/20">
                        {t('hero.badge')}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif">
                        {t('hero.title')}
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        {t('hero.subtitle')}
                    </p>

                    <div className="mt-8 max-w-xl mx-auto relative">
                        <input
                            type="text"
                            placeholder={t('search.article_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-full text-slate-900 focus:ring-4 focus:ring-brand-500/50 outline-none shadow-xl"
                        />
                        <Search className="absolute left-4 top-4 text-slate-400 h-6 w-6" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">

                {/* Visual Categories List (Optional / Future Use) */}
                <div className="flex flex-wrap gap-4 mb-12 justify-center">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Tout
                    </button>
                    {CATEGORIES.map((cat) => (
                        <div key={cat.id} className={`px-4 py-2 rounded-full text-sm font-medium bg-white border border-gray-100 text-gray-600 flex items-center gap-2 shadow-sm opacity-50 cursor-not-allowed`} title="Coming soon">
                            <cat.icon className={`h-4 w-4 ${cat.color}`} />
                            {t(`categories.${cat.name}`)}
                        </div>
                    ))}
                </div>

                {/* Unified Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <Link
                                href={item.link}
                                key={`${item.type}-${item.id}`}
                                className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full"
                            >
                                {item.image ? (
                                    <div className="h-48 overflow-hidden relative">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative flex items-center justify-center">
                                        <BookOpen className="text-slate-300 h-12 w-12" />
                                    </div>
                                )}

                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-brand-600">
                                        <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                                        <span>{item.category}</span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors font-serif line-clamp-2">
                                        {item.title}
                                    </h3>

                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow leading-relaxed">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-50 mt-auto">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>5 min read</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <EmptyState reset={() => { setSearchQuery(''); setFilter('all'); }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EducationClient;
