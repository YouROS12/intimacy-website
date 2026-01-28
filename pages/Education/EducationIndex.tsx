import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Heart, Activity, Shield, Loader2 } from 'lucide-react';
import SeoHead from '../../components/SeoHead';
import { getAllPseoPages, getAllPosts } from '../../services/api';

const CATEGORIES = [
    { id: 'female', name: 'Female Wellness', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
    { id: 'male', name: 'Male Wellness', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'couple', name: 'Couple Intimacy', icon: BookOpen, color: 'text-brand-500', bg: 'bg-brand-50' },
    { id: 'safety', name: 'Safety & Hygiene', icon: Shield, color: 'text-green-500', bg: 'bg-green-50' },
];

const EducationIndex: React.FC = () => {
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [guides, setGuides] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [guidesData, postsData] = await Promise.all([
                    getAllPseoPages(),
                    getAllPosts()
                ]);
                setGuides(guidesData);
                setPosts(postsData);
            } catch (err) {
                console.error("Error fetching education data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredGuides = guides.filter(g => {
        const matchCategory = filter === 'all' || g.problem?.gender === filter;
        const matchSearch = g.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.problem?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    return (
        <div className="bg-white min-h-screen pb-12">
            <SeoHead
                title="Éducation Sexuelle & Bien-être Intime Maroc"
                description="Guides médicaux, conseils d'experts et solutions pour votre santé sexuelle. 100% fiable et discret."
            />

            {/* Hero Section */}
            <div className="bg-slate-900 py-16 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-brand-300 text-sm font-semibold mb-4 border border-white/20">
                        Expert Advice Center
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Éducation Sexuelle & Santé
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Des réponses claires à vos questions les plus intimes.
                        Information vérifiée pour une vie intime épanouie.
                    </p>

                    <div className="mt-8 max-w-xl mx-auto relative">
                        <input
                            type="text"
                            placeholder="Je cherche des informations sur..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-full text-slate-900 focus:ring-4 focus:ring-brand-500/50 outline-none shadow-xl"
                        />
                        <Search className="absolute left-4 top-4 text-slate-400 h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id === filter ? 'all' : cat.id)}
                            className={`${cat.id === filter ? 'ring-2 ring-brand-500 shadow-lg scale-105' : 'shadow-sm hover:shadow-md'} 
                bg-white p-6 rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer border border-gray-100`}
                        >
                            <div className={`p-3 rounded-full ${cat.bg} mb-3`}>
                                <cat.icon className={`h-6 w-6 ${cat.color}`} />
                            </div>
                            <span className="font-semibold text-gray-800 text-sm">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 mt-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {loading ? 'Chargement des guides...' : filter === 'all' ? 'Tous les guides' : `Dossiers : ${CATEGORIES.find(c => c.id === filter)?.name}`}
                    </h2>
                    {filter !== 'all' && (
                        <button onClick={() => setFilter('all')} className="text-brand-600 font-medium text-sm hover:underline">
                            Voir tout
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
                    </div>
                ) : filteredGuides.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        {filteredGuides.map((guide, idx) => (
                            <Link
                                key={idx}
                                to={`/solution/${guide.slug}`}
                                className="group bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-white text-gray-500 capitalize`}>
                                        {guide.problem?.gender || 'Wellness'}
                                    </span>
                                    <BookOpen className="h-5 w-5 text-gray-300 group-hover:text-brand-500 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                                    {guide.title || guide.problem?.name}
                                </h3>
                                <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                                    {guide.problem?.description || "Découvrez nos solutions et conseils d'experts pour ce sujet."}
                                </p>
                                <div className="text-brand-600 font-medium text-sm flex items-center">
                                    Lire le guide <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 text-lg">Aucun guide trouvé pour cette recherche.</p>
                        <button onClick={() => { setFilter('all'); setSearchQuery(''); }} className="mt-4 text-brand-600 font-bold">Voir tous les guides</button>
                    </div>
                )}

                {/* Blog Section */}
                {!loading && posts.length > 0 && filter === 'all' && (
                    <div className="mt-24 border-t border-slate-100 pt-16">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-3xl font-extrabold text-slate-900">Conseils de nos Experts</h2>
                                <p className="text-slate-500 mt-2 text-lg">Découvrez nos derniers articles et dossiers exclusifs.</p>
                            </div>
                            <Link to="/blog" className="text-brand-600 font-bold hover:underline flex items-center bg-brand-50 px-6 py-3 rounded-full transition-all hover:bg-brand-100">
                                Voir tout le blog <span className="ml-2">→</span>
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {posts.slice(0, 3).map((post, idx) => (
                                <Link
                                    key={idx}
                                    to={`/guide/${post.slug}`}
                                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100"
                                >
                                    <div className="p-8">
                                        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-4 block">Article Santé</span>
                                        <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-brand-600 transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-slate-600 mb-6 line-clamp-3">
                                            {post.excerpt}
                                        </p>
                                        <div className="text-brand-600 font-bold text-sm flex items-center">
                                            Lire l'article <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EducationIndex;

