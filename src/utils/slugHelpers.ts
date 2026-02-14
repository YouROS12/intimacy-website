/**
 * SEO Slug Utilities
 * Generates URL-friendly slugs from product names and provides slug helpers.
 */

/**
 * Generate a URL-friendly slug from a string.
 * Example: "Manix Gel Natural - 100ml" → "manix-gel-natural-100ml"
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')                    // Decompose accents (é → e + ́)
        .replace(/[\u0300-\u036f]/g, '')     // Remove accent marks
        .replace(/[^a-z0-9\s-]/g, '')        // Remove non-alphanumeric chars
        .replace(/\s+/g, '-')               // Replace whitespace with hyphens
        .replace(/-+/g, '-')                // Collapse multiple hyphens
        .replace(/^-|-$/g, '');             // Trim leading/trailing hyphens
}

/**
 * Get the slug for a product, preferring seo_slug from DB, falling back to generated slug.
 */
export function getProductSlug(product: { seo_slug?: string | null; name: string }): string {
    return product.seo_slug || generateSlug(product.name);
}

/**
 * Check if a string looks like a UUID (used for redirect logic).
 */
export function isUuid(str: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}
