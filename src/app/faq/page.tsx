
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'FAQ - Questions Fréquentes | Intimacy Wellness Maroc',
    description: 'Réponses à vos questions sur la commande, la livraison discrète et nos produits.',
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

    return (
        <div className="bg-background-light min-h-screen py-12 lg:py-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-text-main mb-4">Questions Fréquentes</h1>
                    <p className="text-lg text-text-muted">Tout ce que vous devez savoir sur nos services et produits.</p>
                </div>

                <div className="space-y-6">
                    {faqData.map((item, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-[#f3ece7]">
                            <h3 className="text-xl font-bold text-text-main mb-3">{item.question}</h3>
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
