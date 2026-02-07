import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';
import { getPostBySlug, getProductsByIds } from '@/services/api';
import BlogRenderer from '@/components/BlogRenderer';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BlogContent, BlogBlock, Product } from '@/types';

type Props = {
    params: Promise<{ slug: string }>;
};

// Helper: Safe JSON Parse
function safeParseContent(content: string | object): BlogContent | null {
    try {
        if (typeof content === 'string') {
            const parsed = JSON.parse(content);
            // Basic validation
            if (parsed && Array.isArray(parsed.blocks)) {
                return parsed as BlogContent;
            }
        } else if (typeof content === 'object' && content !== null) {
            // Already an object (Supabase JSONB)
            return content as BlogContent;
        }
    } catch (e) {
        console.warn("Failed to parse blog content:", e);
    }
    return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: 'Article non trouvé | Intimacy.ma',
        };
    }

    return {
        title: `${post.title} | Intimacy.ma`,
        description: post.excerpt,
        alternates: {
            canonical: `https://intimacy.ma/guide/${slug}`,
        },
        openGraph: {
            images: post.cover_image ? [post.cover_image] : []
        }
    };
}

export const revalidate = 3600; // Update every hour

export default async function BlogPostPage({ params }: Props) {
    try {
        const { slug } = await params;
        const post = await getPostBySlug(slug).catch(e => {
            console.error(`Error fetching post ${slug}:`, e);
            return null;
        });

        if (!post) {
            console.log(`Post not found for slug: ${slug}`);
            notFound();
        }

        const t = await getTranslations('education');

        // 1. Parse Content
        const blogContent: BlogContent | null = safeParseContent(post.content);

        // 2. Extract Dependencies (Products)
        let relatedProducts: Product[] = [];
        if (blogContent) {
            const allProductIds = blogContent.blocks
                .filter(b => b.type === 'product_grid')
                // Type assertion safe here because we filtered by type
                .flatMap(b => (b as any).productIds || [])
                .filter((id: any) => typeof id === 'string' && id.length > 0);

            if (allProductIds.length > 0) {
                relatedProducts = await getProductsByIds(allProductIds);
            }
        }

        // 3. Prepare JSON-LD
        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            image: post.cover_image ? [post.cover_image] : [],
            datePublished: post.published_at,
            dateModified: post.updated_at || post.published_at,
            author: {
                '@type': 'Person',
                name: post.author
            },
            publisher: {
                '@type': 'Organization',
                name: 'Intimacy Wellness Morocco',
                logo: {
                    '@type': 'ImageObject',
                    url: 'https://intimacy.ma/logo.png'
                }
            },
            description: post.excerpt
        };

        return (
            <div className="bg-white min-h-screen">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                {/* Post Header */}
                <div className="max-w-4xl mx-auto px-4 pt-12 pb-8">
                    <Link href="/education" className="text-slate-500 hover:text-brand-600 flex items-center mb-8 text-sm group">
                        <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" /> {t('back_to_articles')}
                    </Link>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight font-serif">
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
                            <span>5 {t('read_time')}</span>
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
                            className="w-full h-[300px] md:h-[500px] object-cover rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-500"
                        />
                    </div>
                )}

                {/* Content Renderer */}
                <div className="max-w-3xl mx-auto px-4 pb-20">
                    {/* Pass strictly typed content and fetched products */}
                    <BlogRenderer
                        content={blogContent || { theme: 'educational_deep_dive', blocks: [] }}
                        products={relatedProducts}
                    />

                    {/* Fallback for legacy HTML content if parsing failed but raw content exists */}
                    {!blogContent && typeof post.content === 'string' && (
                        <div
                            className="prose prose-lg prose-slate max-w-none font-serif"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    )}

                    {/* Back to articles link */}
                    <div className="mt-20 text-center">
                        <Link
                            href="/education"
                            className="inline-flex items-center text-brand-600 hover:text-brand-700 font-medium px-6 py-3 rounded-full bg-brand-50 hover:bg-brand-100 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {t('back_to_articles')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Critical error in BlogPostPage:", error);
        throw error;
    }
}
