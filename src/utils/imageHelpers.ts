
/**
 * Transforms external image URLs to use the local domain masking where possible.
 * Specifically converts Supabase Storage URLs to /cdn/products/ paths.
 */
export const getProductImage = (url?: string | null) => {
    if (!url) return 'https://via.placeholder.com/400';

    // Fallback for legacy caching or unmigrated items
    if (url.includes('lacdp.ma')) return url;

    // Check if it's our Supabase bucket (products)
    // URL format: https://[project].supabase.co/storage/v1/object/public/products/[filename]
    const SUPABASE_HOST = 'cquuanvqjupmtevrtjvl.supabase.co';
    if (url.includes(SUPABASE_HOST) && url.includes('/products/')) {
        const filename = url.split('/').pop();
        if (filename) {
            return `/cdn/products/${filename}`;
        }
    }

    return url;
};
