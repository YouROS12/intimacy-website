import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, Calendar, User, ArrowLeft, Loader2 } from 'lucide-react';
import SeoHead from '../../components/SeoHead';
import { getAllPosts } from '../../services/api';

const BlogIndex: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const data = await getAllPosts();
                setPosts(data);
            } catch (err) {
                console.error("Error fetching blogs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <SeoHead
                title="Le Blog Bien-être - Intimacy Wellness Morocco"
                description="Articles, conseils et dossiers exclusifs sur la santé intime et l'épanouissement sexuel."
            />

            {/* Header */}
            <div className="bg-white border-b border-slate-100 py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <Link to="/education" className="text-slate-500 hover:text-brand-600 flex items-center justify-center mb-6 text-sm">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Retour à l'éducation
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Articles & Conseils</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Explorez notre blog pour approfondir vos connaissances sur le bien-être intime.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-12">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
                    </div>
                ) : posts.length > 0 ? (
                    <div className="grid gap-8">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                to={`/guide/${post.slug}`}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col md:flex-row"
                            >
                                {post.cover_image && (
                                    <div className="md:w-1/3 h-48 md:h-auto">
                                        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                )}
                                <div className="p-8 flex-1 flex flex-col justify-center">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-slate-600 mb-6 line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center gap-6 text-sm text-slate-400">
                                        <span className="flex items-center"><User className="h-4 w-4 mr-2" /> {post.author}</span>
                                        <span className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> {new Date(post.published_at).toLocaleDateString()}</span>
                                        <span className="text-brand-600 font-bold ml-auto group-hover:translate-x-1 transition-transform">Lire l'article →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 text-lg">Aucun article n'est disponible pour le moment.</p>
                        <Link to="/education" className="mt-4 inline-block text-brand-600 font-bold">Retour aux guides</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogIndex;
