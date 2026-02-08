"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Heart, Activity, Shield, Calendar, Clock } from 'lucide-react';
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

const EducationClient: React.FC<EducationClientProps> = ({ initialGuides = [], initialPosts = [] }) => {
    const { t: tRaw } = useI18n();
    const t = (key: string) => tRaw(`education.${key}`);

    const [searchQuery, setSearchQuery] = useState('');

    // Normalize and Merge Data with safeguards
    const allItems = [
        ...(Array.isArray(initialGuides) ? initialGuides : []).map(g => ({
            id: g.id || Math.random().toString(),
            type: 'guide',
            title: g.title || 'Untitled',
            slug: g.slug,
            link: `/guide/${g.slug}`,
            description: g.problem?.description || g.description || '',
            image: null,
            category: 'Guide',
            date: g.created_at || new Date().toISOString()
        })),
        ...(Array.isArray(initialPosts) ? initialPosts : []).map(p => ({
            id: p.id || Math.random().toString(),
            type: 'article',
            title: p.title || 'Untitled',
            slug: p.slug,
            link: `/guide/${p.slug}`,
            description: p.excerpt || '',
            image: p.cover_image,
            category: p.category || 'Article',
            date: p.published_at || new Date().toISOString()
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Filter Logic
    const filteredItems = allItems.filter(item => {
        const q = searchQuery.toLowerCase();
        return (item.title || '').toLowerCase().includes(q) ||
            (item.description || '').toLowerCase().includes(q);
    });

    return (
        <div className="bg-white min-h-screen pb-12">
            {/* Hero Section */}
            <div className="bg-slate-900 py-16 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-brand-300 text-sm font-semibold mb-4 border border-white/20">
                        {t('hero.badge') || "Centre d'Expertise"}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif">
                        {t('hero.title') || "Guide & Conseils"}
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        {t('hero.subtitle') || "Explorez nos articles validés par des experts."}
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
                {/* Unified Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.map((item) => (
                        <Link
                            href={item.link}
                            key={`${item.type}-${item.id}`}
                            className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full"
                        >
                            {/* Image with fallback */}
                            <div className="h-48 overflow-hidden relative bg-gray-100">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                                        <BookOpen className="h-12 w-12" />
                                    </div>
                                )}
                            </div>

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
                                            <span>
                                                {(() => {
                                                    try {
                                                        const d = new Date(item.date);
                                                        if (isNaN(d.getTime())) return 'Date inconnue';
                                                        return d.toLocaleDateString();
                                                    } catch (e) {
                                                        return 'Date inconnue';
                                                    }
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {filteredItems.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            Aucun article trouvé.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EducationClient;
