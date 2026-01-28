import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Share2, Loader2 } from 'lucide-react';
import SeoHead from '../../components/SeoHead';
import { getPostBySlug } from '../../services/api';
import BlogRenderer from '../../components/blog/BlogRenderer';

const BlogPost: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchPost = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const data = await getPostBySlug(slug);
                setPost(data);
            } catch (err) {
                console.error("Error fetching post:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col">
                <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
                <Link to="/blog" className="text-brand-600 hover:underline">Retour au blog</Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <SeoHead
                title={`${post.title} | Intimacy Wellness`}
                description={post.excerpt}
            />

            {/* Post Header */}
            <div className="max-w-4xl mx-auto px-4 pt-12 pb-8">
                <Link to="/blog" className="text-slate-500 hover:text-brand-600 flex items-center mb-8 text-sm group">
                    <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" /> Retour aux articles
                </Link>

                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                    {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 border-b border-slate-100 pb-8">
                    <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-brand-500" />
                        <span className="font-medium text-slate-700">{post.author}</span>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(post.published_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>5 min de lecture</span>
                    </div>
                    <button className="ml-auto p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-brand-600">
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Cover Image */}
            {post.cover_image && (
                <div className="max-w-5xl mx-auto px-4 mb-12">
                    <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-[400px] object-cover rounded-3xl shadow-lg"
                    />
                </div>
            )}

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 pb-20">
                <BlogRenderer content={post.content} />

                {/* Footer / CTA */}
                <div className="mt-20 p-8 bg-brand-50 rounded-3xl border border-brand-100 text-center">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Vous avez aimé cet article ?</h3>
                    <p className="text-slate-600 mb-6">Inscrivez-vous à notre newsletter pour recevoir nos derniers conseils et offres exclusives.</p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="votre@email.com"
                            className="flex-1 px-4 py-3 rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <button className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors">
                            S'inscrire
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPost;
