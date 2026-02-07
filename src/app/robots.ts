
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://intimacy.ma';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/profile/', '/checkout/', '/order-confirmation/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
