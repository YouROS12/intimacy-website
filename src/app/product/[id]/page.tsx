
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductById, getRelatedProducts } from '@/services/api';
import ProductDetailsClient from '@/components/ProductDetailsClient';

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
            images: [product.imageUrl],
            title: product.name,
            description: product.description.substring(0, 160),
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.category, product.id);

    return <ProductDetailsClient product={product} relatedProducts={relatedProducts} />;
}
