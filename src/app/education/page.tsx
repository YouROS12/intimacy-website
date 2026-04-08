
/* eslint-disable react-hooks/error-boundaries */
import { Metadata } from 'next';
import { getAllPseoPages, getAllPosts } from '@/services/api';
import EducationClient from '@/components/EducationClient';

export const metadata: Metadata = {
    title: "Centre d'Expertise | Intimacy Wellness Maroc",
    description: "Le hub complet pour votre santé sexuelle : Dossiers médicaux, guides pratiques et articles d'experts.",
    alternates: {
        canonical: 'https://intimacy.ma/education',
    },
    openGraph: {
        title: "Centre d'Expertise Santé Intime | Intimacy Wellness Maroc",
        description: "Guides, dossiers médicaux et articles d'experts sur le bien-être intime au Maroc.",
        url: 'https://intimacy.ma/education',
        siteName: 'Intimacy Wellness Morocco',
        locale: 'fr_MA',
        type: 'website',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Centre d\'Expertise Intimacy Wellness' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: "Centre d'Expertise | Intimacy Wellness Maroc",
        description: "Guides et articles d'experts sur le bien-être intime.",
        images: ['/og-image.png'],
    },
};

export const dynamic = 'force-dynamic';

export default async function EducationPage() {
    try {
        // Fetch data safely
        const [guides, posts] = await Promise.all([
            getAllPseoPages().catch(e => {
                console.error("PSEO fetch error:", e);
                return [];
            }),
            getAllPosts().catch(e => {
                console.error("Posts fetch error:", e);
                return [];
            })
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allItems = [...guides.map((g: any) => ({ name: g.title, url: `https://intimacy.ma/solution/${g.slug}` })), ...posts.map((p: any) => ({ name: p.title, url: `https://intimacy.ma/guide/${p.slug}` }))];

        const collectionJsonLd = {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: "Centre d'Expertise | Intimacy Wellness Maroc",
            description: "Dossiers médicaux, guides pratiques et articles d'experts sur le bien-être intime.",
            url: 'https://intimacy.ma/education',
            mainEntity: {
                '@type': 'ItemList',
                numberOfItems: allItems.length,
                itemListElement: allItems.slice(0, 50).map((item, idx) => ({
                    '@type': 'ListItem',
                    position: idx + 1,
                    name: item.name,
                    url: item.url,
                })),
            },
        };

        const breadcrumbJsonLd = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://intimacy.ma' },
                { '@type': 'ListItem', position: 2, name: "Centre d'Expertise", item: 'https://intimacy.ma/education' },
            ],
        };

        return (
            <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
                <EducationClient initialGuides={guides} initialPosts={posts} />
            </>
        );
    } catch (error) {
        console.error("Critical error in EducationPage:", error);
        return <EducationClient initialGuides={[]} initialPosts={[]} />;
    }
}
