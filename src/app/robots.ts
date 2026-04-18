
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
                userAgent: [
                    'GPTBot', 'ChatGPT-User', 'OAI-SearchBot',
                    'Claude-Web', 'anthropic-ai',
                    'PerplexityBot',
                    'Google-Extended', 'Googlebot-News',
                    'Bytespider', 'CCBot',
                    'cohere-ai', 'AI2Bot',
                    'Applebot-Extended',
                ],
                allow: '/',
                disallow: ['/admin/', '/profile/', '/checkout/', '/order-confirmation/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
