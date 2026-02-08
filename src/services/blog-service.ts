import { getPostBySlug, getProductsByIds } from './api';
import { parseBlogContent, SafeBlogContent } from '@/lib/validation';
import { Product } from '@/types';

export interface ValidatedPost {
    original: any; // Raw Supabase data
    content: SafeBlogContent | null; // Validated content or null
    products: Product[]; // Fetched related products
}

export const BlogService = {
    async getPost(slug: string): Promise<ValidatedPost | null> {
        // 1. Fetch Raw Data
        const post = await getPostBySlug(slug);
        if (!post) return null;

        // 2. Validate Content (Zero Crash Policy)
        const content = parseBlogContent(post.content);

        // 3. Resolve Dependencies (Products)
        let products: Product[] = [];

        if (content) {
            try {
                // Extract IDs safely from product grids
                const productIds = content.blocks
                    .filter(b => b.type === 'product_grid')
                    .flatMap(b => b.productIds)
                    .filter(id => typeof id === 'string' && id.length > 0);

                if (productIds.length > 0) {
                    products = await getProductsByIds(productIds);
                }
            } catch (error) {
                console.error("BlogService: Failed to resolve products", error);
                // Continue without products, don't fail the whole request
            }
        }

        return {
            original: post,
            content,
            products
        };
    }
};
