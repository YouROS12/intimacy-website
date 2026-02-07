"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, BookOpen, Heart, Activity, Shield, Loader2, Stethoscope, FileText, ArrowRight } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface EducationClientProps {
    initialGuides: any[];
    initialPosts: any[];
}

const CATEGORIES = [
    { id: 'Wellness', name: 'wellness', icon: Heart, color: 'text-rose-500' },
    { id: 'Performance', name: 'performance', icon: Activity, color: 'text-blue-500' },
    { id: 'Health', name: 'health', icon: Shield, color: 'text-green-500' },
    { id: 'Education', name: 'education', icon: BookOpen, color: 'text-purple-500' },
];

const EmptyState = ({ type, reset }: { type: string, reset: () => void }) => {
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
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'articles'; // 'dossiers' (PSEO) or 'articles' (Blog)
    const { t: tRaw } = useI18n();
    const t = (key: string) => tRaw(`education.${key}`);

    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    // We use props for initial data, so no loading state needed for data fetching

    // Sync Tab with URL
    const setTab = (tab: 'dossiers' | 'articles') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    // Filter Logic
    const filteredGuides = (initialGuides || []).filter(g => {
        if (!g) return false;
        const matchCategory = filter === 'all' || g.problem?.gender === filter;
        const matchSearch = (g.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (g.problem?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    const filteredPosts = (initialPosts || []).filter(p => {
        if (!p) return false;
        return (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase());
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
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        {t('hero.title')}
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        {t('hero.subtitle')}
                    </p>

                    <div className="mt-8 max-w-xl mx-auto relative">
                        <input
                            type="text"
                            placeholder={activeTab === 'dossiers' ? t('search.guide_placeholder') : t('search.article_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-full text-slate-900 focus:ring-4 focus:ring-brand-500/50 outline-none shadow-xl"
                        />
                        <Search className="absolute left-4 top-4 text-slate-400 h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
                <div className="bg-white rounded-2xl shadow-lg p-2 flex justify-center max-w-2xl mx-auto border border-gray-100">
                    <button
                        onClick={() => setTab('dossiers')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold ${activeTab === 'dossiers' ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Stethoscope className="h-5 w-5" />
                        {t('tabs.guides')}
                    </button>
                    <button
                        onClick={() => setTab('articles')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold ${activeTab === 'articles' ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <FileText className="h-5 w-5" />
                        {t('tabs.articles')}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Categories - Only relevant for guides/dossiers if we had category filter implemented there, or general blog categories */}
                {/* For now keeping simplicity or implementing basic category filtering if data supports it */}
                {/* Visual Categories List */}
                <div className="flex flex-wrap gap-4 mb-8 justify-center">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Tout
                    </button>
                    {CATEGORIES.map((cat) => (
                        <div key={cat.id} className={`px-4 py-2 rounded-full text-sm font-medium bg-white border border-gray-100 text-gray-600 flex items-center gap-2 shadow-sm`}>
                            <cat.icon className={`h-4 w-4 ${cat.color}`} />
                            {t(`categories.${cat.name}`)}
                        </div>
                    ))}
                </div>


                {activeTab === 'dossiers' ? (
                    /* GUIDES GRID */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredGuides.length > 0 ? (
                            filteredGuides.map((guide) => (
                                <Link
                                    href={`/guide/${guide.slug}`}
                                    key={guide.id}
                                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                                        {/* Placeholder or image if available */}
                                        <div className={`absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100 opacity-50`} />
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-brand-700 mb-2">
                                                {/* Translate Guide Category if possible, else fallback */}
                                                Guide
                                            </span>
                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                                                {guide.title}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                                            {guide.problem?.description || guide.description}
                                        </p>
                                        <div className="flex items-center text-brand-600 font-bold text-sm">
                                            Lire le dossier <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full">
                                <EmptyState type="dossiers" reset={() => { setSearchQuery(''); setFilter('all'); }} />
                            </div>
                        )}
                    </div>
                ) : (
                    /* ARTICLES GRID */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((post) => (
                                <Link
                                    href={`/guide/${post.slug}`}
                                    key={post.id}
                                    className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full"
                                >
                                    {post.cover_image && (
                                        <div className="h-48 overflow-hidden relative">
                                            <img
                                                src={post.cover_image}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-brand-600">
                                            <span>Article</span>
                                            {post.category && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <span>{post.category}</span>
                                                </>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-50 mt-auto">
                                            <div className="flex items-center">
                                                <span>{new Date(post.published_at).toLocaleDateString()}</span>
                                                <span className="mx-2">•</span>
                                                <span>5 {t('read_time')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full">
                                <EmptyState type="articles" reset={() => { setSearchQuery(''); setFilter('all'); }} />
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default EducationClient;
