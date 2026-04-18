
import { MetadataRoute } from 'next';
import { getProducts, getAllPosts, getAllPseoPages } from '@/services/api';
import { getProductSlug } from '@/utils/slugHelpers';

const baseUrl = 'https://intimacy.ma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [products, posts, pseoPages] = await Promise.all([
        getProducts(),
        getAllPosts(),
        getAllPseoPages().catch(() => []),
    ]);

    const productUrls = products.map((product) => ({
        url: `${baseUrl}/product/${getProductSlug(product)}`,
        lastModified: new Date(product.updated_at || product.created_at || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const postUrls = posts.map((post: any) => ({
        url: `${baseUrl}/guide/${post.slug}`,
        lastModified: new Date(post.updated_at || post.created_at || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/shop`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/education`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/legal/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/legal/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/legal/returns`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        ...productUrls,
        ...postUrls,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...pseoPages.map((page: any) => ({
            url: `${baseUrl}/solution/${page.slug}`,
            lastModified: new Date(page.updated_at || page.created_at || Date.now()),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        })),
    ];
}
