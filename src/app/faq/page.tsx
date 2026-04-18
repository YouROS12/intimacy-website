
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'FAQ - Questions Fréquentes | Intimacy Wellness Maroc',
    description: 'Réponses à vos questions sur la commande, la livraison discrète et nos produits.',
    alternates: {
        canonical: 'https://intimacy.ma/faq',
    },
    openGraph: {
        title: 'FAQ | Intimacy Wellness Maroc',
        description: 'Questions fréquentes sur la livraison discrète, les délais et nos produits au Maroc.',
        url: 'https://intimacy.ma/faq',
        siteName: 'Intimacy Wellness Morocco',
        locale: 'fr_MA',
        type: 'website',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FAQ Intimacy Wellness Maroc' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'FAQ | Intimacy Wellness Maroc',
        description: 'Tout savoir sur la livraison discrète et nos produits au Maroc.',
        images: ['/og-image.png'],
    },
};

export default function FAQPage() {
    const faqData = [
        {
            question: "La livraison est-elle vraiment discrète ?",
            answer: "Oui, à 100%. Nos colis sont totalement anonymes, sans logo ni mention du contenu..."
        },
        {
            question: "Quels sont les délais de livraison ?",
            answer: "Nous livrons en 24-48h partout au Maroc..."
        }
        // ... more items
    ];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqData.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer
            }
        }))
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://intimacy.ma' },
            { '@type': 'ListItem', position: 2, name: 'FAQ', item: 'https://intimacy.ma/faq' },
        ],
    };

    return (
        <div className="bg-background-light min-h-screen py-12 lg:py-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-text-main mb-4">Questions Fréquentes</h1>
                    <p className="text-lg text-text-muted">Tout ce que vous devez savoir sur nos services et produits.</p>
                </div>

                <div className="space-y-6">
                    {faqData.map((item, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-[#f3ece7]">
                            <h2 className="text-xl font-bold text-text-main mb-3">{item.question}</h2>
                            <div className="text-text-muted leading-relaxed">
                                {item.answer}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
