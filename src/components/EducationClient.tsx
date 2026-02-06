"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, BookOpen, Heart, Activity, Shield, Loader2, Stethoscope, FileText } from 'lucide-react';

interface EducationClientProps {
    initialGuides: any[];
    initialPosts: any[];
}

const CATEGORIES = [
    { id: 'Wellness', name: 'Bien-être', icon: Heart, color: 'text-rose-500' },
    { id: 'Performance', name: 'Performance', icon: Activity, color: 'text-blue-500' },
    { id: 'Health', name: 'Santé', icon: Shield, color: 'text-green-500' },
    { id: 'Education', name: 'Éducation', icon: BookOpen, color: 'text-purple-500' },
];

const EmptyState = ({ type, reset }: { type: string, reset: () => void }) => (
    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500 text-lg mb-4">Aucun résultat trouvé dans les {type}.</p>
        <button onClick={reset} className="text-brand-600 font-bold hover:underline">
            Réinitialiser la recherche
        </button>
    </div>
);

const EducationClient: React.FC<EducationClientProps> = ({ initialGuides, initialPosts }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'articles'; // 'dossiers' (PSEO) or 'articles' (Blog)

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
                        Centre d'Expertise
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Comprendre & Agir
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Des réponses claires, validées par l'IA et nos experts.
                    </p>

                    <div className="mt-8 max-w-xl mx-auto relative">
                        <input
                            type="text"
                            placeholder={activeTab === 'dossiers' ? "Rechercher un dossier..." : "Rechercher un article..."}
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
                        Guides
                    </button>
                    <button
                        onClick={() => setTab('articles')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold ${activeTab === 'articles' ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <FileText className="h-5 w-5" />
                        Articles & Blog
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 mt-12 min-h-[400px]">

                {/* VIEW 1: DOSSIERS (PSEO) */}
                {activeTab === 'dossiers' && (
                    <>
                        {/* Categories Filter */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilter(cat.id === filter ? 'all' : cat.id)}
                                    className={`${cat.id === filter ? 'ring-2 ring-brand-500 bg-brand-50' : 'bg-white hover:bg-gray-50'} 
                                    p-4 rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer border border-gray-100 shadow-sm`}
                                >
                                    <cat.icon className={`h-5 w-5 ${cat.color}`} />
                                    <span className={`font-bold ${cat.id === filter ? 'text-gray-900' : 'text-gray-600'}`}>{cat.name}</span>
                                </button>
                            ))}
                        </div>

                        {filteredGuides.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-8">
                                {filteredGuides.map((guide, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/solution/${guide.slug}`}
                                        className="group bg-white rounded-2xl p-6 hover:shadow-xl transition-all border border-gray-100"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-gray-100 text-gray-500 capitalize`}>
                                                {guide.problem?.gender || 'Wellness'}
                                            </span>
                                            <BookOpen className="h-5 w-5 text-gray-300 group-hover:text-brand-500 transition-colors" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                                            {guide.title || guide.problem?.name}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2">
                                            {guide.problem?.description || "Découvrez nos solutions et conseils d'experts."}
                                        </p>
                                        <div className="text-brand-600 font-medium text-sm flex items-center">
                                            Consulter le dossier <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <EmptyState type="dossiers" reset={() => { setFilter('all'); setSearchQuery('') }} />
                        )}
                    </>
                )}

                {/* VIEW 2: ARTICLES (BLOG) */}
                {activeTab === 'articles' && (
                    <>
                        {filteredPosts.length > 0 ? (
                            <div className="grid md:grid-cols-3 gap-8">
                                {filteredPosts.map((post, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/guide/${post.slug}`}
                                        className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col h-full"
                                    >
                                        <div className="p-8 flex-1 flex flex-col">
                                            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-4 block">Article Santé</span>
                                            <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-brand-600 transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-slate-600 mb-6 line-clamp-3 flex-1">
                                                {post.excerpt}
                                            </p>
                                            <div className="text-brand-600 font-bold text-sm flex items-center mt-auto">
                                                Lire l'article <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <EmptyState type="articles" reset={() => setSearchQuery('')} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EducationClient;
