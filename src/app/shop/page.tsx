
import { Metadata } from 'next';
import { getProducts } from '@/services/api';
import ShopClient from '@/components/ShopClient';

export const metadata: Metadata = {
    title: 'Boutique | Intimacy Wellness Maroc',
    description: 'Découvrez notre sélection premium de produits de bien-être intime. Livraison discrète partout au Maroc.',
    alternates: {
        canonical: 'https://intimacy.ma/shop',
    },
    openGraph: {
        title: 'Boutique Bien-être Intime | Intimacy Wellness Maroc',
        description: 'Préservatifs, lubrifiants, hygiène intime — livraison discrète au Maroc. Expertise locale marocaine.',
        url: 'https://intimacy.ma/shop',
        siteName: 'Intimacy Wellness Morocco',
        locale: 'fr_MA',
        type: 'website',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Boutique Intimacy Wellness Maroc' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Boutique | Intimacy Wellness Maroc',
        description: 'Produits bien-être intime premium. Livraison discrète au Maroc.',
        images: ['/og-image.png'],
    },
};

export const revalidate = 3600; // Update every hour

export default async function ShopPage() {
    const products = await getProducts();

    const itemListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Boutique Intimacy Wellness Maroc',
        description: 'Sélection premium de produits de bien-être intime au Maroc',
        numberOfItems: products.length,
        itemListElement: products.slice(0, 50).map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: product.name,
            url: `https://intimacy.ma/product/${product.seo_slug || product.id}`,
        })),
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
            <ShopClient initialProducts={products} />
        </>
    );
}
