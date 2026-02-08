import { getAllPosts } from '@/services/api';
import { BlogService } from '@/services/blog-service';
import SafeBlogRenderer from '@/components/SafeBlogRenderer';
import { SafeBlogContent } from '@/lib/validation';
import { supabase } from '@/services/supabase';
import { ErrorBoundaryWrapper } from '@/components/DebugErrorBoundary';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

export default async function DebugPostsPage() {
    console.log("DebugPostsPage: Starting fetch...");

    // 1. Fetch ALL posts
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('published_at', { ascending: false });

    if (error) {
        return <div className="p-10 text-red-500">Error fetching posts: {error.message}</div>;
    }

    if (!posts || posts.length === 0) {
        return <div className="p-10">No posts found.</div>;
    }

    return (
        <div className="p-10 space-y-12 font-mono text-sm">
            <h1 className="text-2xl font-bold bg-yellow-100 p-4 rounded text-yellow-800">
                Systematic Blog Debugger
            </h1>
            <p>Total Posts: {posts.length}</p>

            <div className="grid gap-8">
                {posts.map((post) => {
                    let validationResult: any = { status: 'PENDING' };
                    let content: SafeBlogContent | null = null;

                    try {
                        // Attempt validation
                        const validated = BlogService.validateContentForDebug(post.content);
                        if (validated) {
                            content = validated;
                            validationResult = { status: 'VALID', theme: validated.theme, blocks: validated.blocks.length };
                        } else {
                            validationResult = { status: 'INVALID', details: 'Schema mismatch or parser failure' };
                        }
                    } catch (e: any) {
                        validationResult = { status: 'CRASH', error: e.message };
                    }

                    return (
                        <div key={post.id} className="border border-slate-300 rounded p-4 bg-slate-50">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{post.title}</h3>
                                    <p className="text-xs text-slate-500">{post.slug}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${validationResult.status === 'VALID' ? 'bg-green-100 text-green-700' :
                                    validationResult.status === 'INVALID' ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {validationResult.status}
                                </span>
                            </div>

                            {/* Validation Details */}
                            <pre className="text-xs bg-slate-200 p-2 rounded mb-4 overflow-x-auto">
                                {JSON.stringify(validationResult, null, 2)}
                            </pre>

                            {/* Attempt Render */}
                            <div className="bg-white p-4 border border-dashed border-slate-300 rounded">
                                <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Render Attempt:</p>
                                <ErrorBoundaryWrapper>
                                    <SafeBlogRenderer
                                        content={content}
                                        rawContent={post.content}
                                        products={[]}
                                    />
                                </ErrorBoundaryWrapper>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


