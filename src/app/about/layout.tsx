import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'À Propos | Intimacy Wellness Maroc',
    description: 'Découvrez Intimacy Wellness Morocco : votre expert en bien-être intime au Maroc. Livraison 100% discrète, produits authentiques, expertise locale marocaine.',
    alternates: {
        canonical: 'https://intimacy.ma/about',
    },
    openGraph: {
        title: 'À Propos | Intimacy Wellness Maroc',
        description: 'Expert en bien-être intime au Maroc. Livraison discrète, produits certifiés, expertise locale.',
        url: 'https://intimacy.ma/about',
        siteName: 'Intimacy Wellness Morocco',
        locale: 'fr_MA',
        type: 'website',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Intimacy Wellness Morocco - À Propos' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'À Propos | Intimacy Wellness Maroc',
        description: 'Expert en bien-être intime au Maroc. Livraison discrète, produits certifiés.',
        images: ['/og-image.png'],
    },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return children;
}
