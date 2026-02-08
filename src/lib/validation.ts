import { z } from 'zod';

// --- Primitives ---
const UuidSchema = z.string().uuid().or(z.string().min(10)); // Relaxed UUID for safety
const UrlSchema = z.string().url().or(z.string().startsWith('/'));

// --- Block Schemas ---

// Base Block
const BaseBlockSchema = z.object({
    id: z.string().optional(),
});

// 1. Text Block
export const TextBlockSchema = BaseBlockSchema.extend({
    type: z.literal('text'),
    content: z.string(), // HTML string
    title: z.string().optional(),
});

// 2. Hero Block
export const HeroBlockSchema = BaseBlockSchema.extend({
    type: z.literal('hero'),
    heading: z.string(),
    subheading: z.string().optional(),
    image: UrlSchema.optional(),
});

// 3. Quote Block
export const QuoteBlockSchema = BaseBlockSchema.extend({
    type: z.literal('quote'),
    content: z.string(),
    author: z.string().optional(),
    role: z.string().optional(),
});

// 4. Alert Block
export const AlertBlockSchema = BaseBlockSchema.extend({
    type: z.literal('alert'),
    variant: z.enum(['info', 'warning', 'tip']).default('info'),
    content: z.string(),
});

// 5. Product Grid Block (The risky one)
export const ProductGridBlockSchema = BaseBlockSchema.extend({
    type: z.literal('product_grid'),
    productIds: z.array(z.string()).default([]),
    title: z.string().optional(),
});

// 6. Image Group (Future proofing)
export const ImageGroupBlockSchema = BaseBlockSchema.extend({
    type: z.literal('image_group'),
    images: z.array(z.object({
        url: UrlSchema,
        caption: z.string().optional()
    })).default([])
});

// Union of all blocks
export const BlogBlockSchema = z.discriminatedUnion('type', [
    TextBlockSchema,
    HeroBlockSchema,
    QuoteBlockSchema,
    AlertBlockSchema,
    ProductGridBlockSchema,
    ImageGroupBlockSchema
]);

// --- Main Content Schema ---

export const BlogContentSchema = z.object({
    theme: z.enum(['educational_deep_dive', 'product_showcase', 'listicle']).default('educational_deep_dive'),
    blocks: z.array(BlogBlockSchema).default([]),
    references: z.array(z.object({
        text: z.string(),
        url: z.string().optional()
    })).optional().default([])
});

// --- Parsing Helper ---

export function parseBlogContent(input: any): z.infer<typeof BlogContentSchema> | null {
    try {
        // Case 1: Input is already an object
        if (typeof input === 'object' && input !== null) {
            return BlogContentSchema.parse(input);
        }

        // Case 2: Input is a string (legacy or double-encoded)
        if (typeof input === 'string') {
            const parsed = JSON.parse(input);
            return BlogContentSchema.parse(parsed);
        }

        return null; // Unknown format
    } catch (e) {
        console.warn("Zod Validation Failed:", e);
        return null;
    }
}

// Export Types derived from Zod (to replace manual types.ts eventually)
export type SafeBlogContent = z.infer<typeof BlogContentSchema>;
export type SafeBlogBlock = z.infer<typeof BlogBlockSchema>;
export type SafeBlogBlockType = SafeBlogBlock['type'];
