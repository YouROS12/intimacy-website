
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://intimacy.ma';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/profile/', '/checkout/', '/order-confirmation/', '/api/'],
            },
            // AI / LLM bots — welcome
            {
                userAgent: ['GPTBot', 'ChatGPT-User', 'Claude-Web', 'PerplexityBot', 'Bytespider', 'CCBot', 'anthropic-ai', 'Google-Extended'],
                allow: '/',
                disallow: ['/admin/', '/profile/', '/checkout/', '/order-confirmation/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
