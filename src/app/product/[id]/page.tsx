
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductById, getRelatedProducts } from '@/services/api';
import ProductDetailsClient from '@/components/ProductDetailsClient';
import { getProductImage } from '@/utils/imageHelpers';

interface Props {
    params: Promise<{
        id: string;
    }>;
}

// SEO Metadata Generator
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = await getProductById(id);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://intimacy.ma';

    if (!product) {
        return {
            title: 'Produit Introuvable | Intimacy Wellness Maroc',
            robots: {
                index: false,
                follow: true
            }
        };
    }

    const title = product.seo_title || `${product.name} | Intimacy Wellness Maroc`;
    const description = product.seo_description || product.description.substring(0, 160);
    const images = product.imageUrl ? [getProductImage(product.imageUrl)] : [];
    const canonicalUrl = `${siteUrl}/product/${id}`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: 'Intimacy Wellness Morocco',
            images: images.map(url => ({
                url,
                width: 800,
                height: 800,
                alt: product.name,
            })),
            locale: 'fr_MA',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images,
        },
    };
}

export const revalidate = 3600; // Cache for 1 hour

export default async function ProductPage({ params }: Props) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.category, product.id);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://intimacy.ma';
    const productUrl = `${siteUrl}/product/${id}`;
    const imageUrl = getProductImage(product.imageUrl);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: imageUrl,
        description: product.description,
        sku: product.id,
        mpn: product.id,
        brand: {
            '@type': 'Brand',
            name: product.brand || 'Intimacy Wellness'
        },
        offers: {
            '@type': 'Offer',
            url: productUrl,
            price: product.price,
            priceCurrency: 'MAD',
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
        }
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Accueil',
                item: siteUrl
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Boutique',
                item: `${siteUrl}/shop`
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: product.category,
                item: `${siteUrl}/shop?category=${encodeURIComponent(product.category)}`
            },
            {
                '@type': 'ListItem',
                position: 4,
                name: product.name,
                item: productUrl
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <ProductDetailsClient product={product} relatedProducts={relatedProducts} />
        </>
    );
}
