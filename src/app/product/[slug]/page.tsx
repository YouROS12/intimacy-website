
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getProducts, getProductBySlug, getProductById, getRelatedProducts } from '@/services/api';
import ProductDetailsClient from '@/components/ProductDetailsClient';
import { getProductImage } from '@/utils/imageHelpers';
import { isUuid, getProductSlug } from '@/utils/slugHelpers';

interface Props {
    params: Promise<{
        slug: string;
    }>;
}

// SEO Metadata Generator
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    // If it's a UUID, we'll redirect in the page component, so return minimal metadata
    if (isUuid(slug)) {
        return { title: 'Redirecting...' };
    }

    const product = await getProductBySlug(slug);
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

    const categoryLabels: Record<string, string> = {
        'Lubricant': 'Lubrifiant',
        'Condoms': 'Préservatif',
        'Delay Spray/Cream': 'Spray Retardant',
        'Wellness Kit': 'Kit Bien-être',
        'Intimate Gel': 'Gel Intime',
    };
    const categoryLabel = categoryLabels[product.category] || product.category;
    const brandPart = product.brand ? ` ${product.brand}` : '';
    const title = product.seo_title || `${product.name}${brandPart} | Achat Maroc | Intimacy Wellness`;
    const descBase = `Achetez ${product.name}${product.brand ? ` (${product.brand})` : ''} à ${product.price} MAD — ${categoryLabel} premium. Livraison discrète 24-48h partout au Maroc. ${product.description}`;
    const description = product.seo_description || descBase.substring(0, 160);
    const images = product.imageUrl ? [getProductImage(product.imageUrl)] : [];
    const canonicalUrl = `${siteUrl}/product/${getProductSlug(product)}`;

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
                alt: `${product.name} - ${categoryLabel} au Maroc`,
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
        other: {
            'product:price:amount': String(product.price),
            'product:price:currency': 'MAD',
            'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
            'product:condition': 'new',
            'product:brand': product.brand || 'Intimacy Wellness',
        },
    };
}

export async function generateStaticParams() {
    const products = await getProducts();
    return products.map((p) => ({
        slug: getProductSlug(p),
    }));
}

export const revalidate = 3600; // Cache for 1 hour

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;

    // Handle old UUID URLs: 301 redirect to the slug version
    if (isUuid(slug)) {
        const product = await getProductById(slug);
        if (!product) {
            notFound();
        }
        redirect(`/product/${getProductSlug(product)}`);
    }

    const product = await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.category, product.id);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://intimacy.ma';
    const productSlug = getProductSlug(product);
    const productUrl = `${siteUrl}/product/${productSlug}`;
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
            priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // eslint-disable-line react-hooks/purity
            seller: {
                '@type': 'Organization',
                name: 'Intimacy Wellness Morocco',
                url: 'https://intimacy.ma'
            },
            shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingDestination: {
                    '@type': 'DefinedRegion',
                    addressCountry: 'MA'
                },
                deliveryTime: {
                    '@type': 'ShippingDeliveryTime',
                    handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
                    transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' }
                }
            }
        }
    };

    const productCategoryLabels: Record<string, string> = {
        'Lubricant': 'Lubrifiants',
        'Condoms': 'Préservatifs',
        'Delay Spray/Cream': 'Spray Retardant',
        'Wellness Kit': 'Kits Bien-être',
        'Intimate Gel': 'Gels Intimes',
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
                name: productCategoryLabels[product.category] || product.category,
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
