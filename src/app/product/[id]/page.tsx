
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

    if (!product) {
        return {
            title: 'Produit Introuvable | Intimacy Wellness Maroc',
        };
    }

    return {
        title: `${product.name} | Intimacy Wellness Maroc`,
        description: product.description.substring(0, 160),
        openGraph: {
            images: product.imageUrl ? [getProductImage(product.imageUrl) as string] : [],
            title: product.name,
            description: product.description.substring(0, 160),
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

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.imageUrl,
        description: product.description,
        brand: {
            '@type': 'Brand',
            name: product.brand || 'Intimacy Wellness'
        },
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'MAD',
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetailsClient product={product} relatedProducts={relatedProducts} />
        </>
    );
}
