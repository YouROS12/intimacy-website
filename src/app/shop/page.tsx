
import { Metadata } from 'next';
import { getProducts } from '@/services/api';
import ShopClient from '@/components/ShopClient';

export const metadata: Metadata = {
    title: 'Boutique | Intimacy Wellness Maroc',
    description: 'Découvrez notre sélection premium de produits de bien-être intime. Livraison discrète partout au Maroc.',
};

export const revalidate = 3600; // Update every hour

export default async function ShopPage() {
    const products = await getProducts();

    return <ShopClient initialProducts={products} />;
}
