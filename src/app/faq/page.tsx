
import { Metadata } from 'next';
import { FREE_SHIPPING_THRESHOLD_MAD, STANDARD_SHIPPING_RATE_MAD } from '@/lib/shipping';

export const metadata: Metadata = {
    title: 'FAQ — Livraison Discrète, Délais & Produits | Intimacy Wellness Maroc',
    description: 'Réponses complètes : livraison discrète au Maroc en 24-48h, paiement à la livraison, authenticité des produits, retours. Tout sur intimacy.ma.',
    alternates: {
        canonical: 'https://intimacy.ma/faq',
    },
    openGraph: {
        title: 'FAQ | Livraison Discrète & Produits Bien-être Intime au Maroc',
        description: 'Livraison discrète 24-48h, paiement à la livraison (COD), produits authentiques. Toutes les réponses sur intimacy.ma.',
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
            answer: "Oui, à 100%. Nos colis sont totalement anonymes : aucun logo, aucune mention du contenu ou de la marque sur l'emballage extérieur. Même le livreur ne sait pas ce qu'il transporte. Votre vie privée est notre priorité absolue."
        },
        {
            question: "Quels sont les délais de livraison au Maroc ?",
            answer: "Nous livrons en 24 à 48 heures partout au Maroc — Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir et toutes les autres villes. Les commandes passées avant 18h sont expédiées le jour même."
        },
        {
            question: "Quels modes de paiement acceptez-vous ?",
            answer: "Nous acceptons le paiement à la livraison (cash on delivery), CashPlus et Wave. Pas besoin de carte bancaire — vous payez en espèces quand vous recevez votre commande."
        },
        {
            question: "Les produits sont-ils authentiques et certifiés ?",
            answer: "Oui. Tous nos produits (Durex, Manix, Prote+, Cumlaude Lab, etc.) sont sourcés directement auprès de distributeurs agréés et sont 100% certifiés authentiques. Nous ne vendons aucun produit contrefait."
        },
        {
            question: "Puis-je acheter des préservatifs en ligne au Maroc ?",
            answer: "Oui, vous pouvez commander des préservatifs (Durex, Manix, Mister Size, Carex…) directement sur intimacy.ma. Livraison discrète en 24-48h partout au Maroc avec paiement à la livraison."
        },
        {
            question: "Quelle est votre politique de retour ?",
            answer: "Nous acceptons les retours dans les 14 jours suivant la réception pour tout produit scellé et non ouvert. Contactez-nous via WhatsApp pour initier un retour."
        },
        {
            question: "Livrez-vous dans toutes les villes du Maroc ?",
            answer: "Oui, nous livrons dans toutes les villes et régions du Maroc : Grand Casablanca, Rabat-Salé, Marrakech-Safi, Fès-Meknès, Souss-Massa, Tanger-Tétouan, l'Oriental, et toutes les autres régions."
        },
        {
            question: "La livraison est-elle gratuite ?",
            answer: `La livraison est gratuite pour toute commande de ${FREE_SHIPPING_THRESHOLD_MAD} MAD ou plus. En dessous de ce montant, des frais de livraison standards de ${STANDARD_SHIPPING_RATE_MAD} MAD s'appliquent.`
        },
        {
            question: "Comment puis-je contacter le service client ?",
            answer: "Notre service client est disponible via WhatsApp au +212-656-201278. Nous répondons généralement en moins d'une heure pendant les heures de travail."
        },
        {
            question: "Proposez-vous des lubrifiants intimes au Maroc ?",
            answer: "Oui, nous proposons une large gamme de lubrifiants intimes : à base d'eau (Manix Gel, Protect Gel, Lubrix), au silicone, et aromatisés. Tous disponibles avec livraison discrète au Maroc."
        },
        {
            question: "Mes données personnelles sont-elles sécurisées ?",
            answer: "Absolument. Nous ne partageons jamais vos informations personnelles avec des tiers. Vos données de commande sont chiffrées et utilisées uniquement pour la livraison. Consultez notre politique de confidentialité pour plus de détails."
        },
        {
            question: "Puis-je passer une commande sans créer de compte ?",
            answer: "Oui, vous pouvez commander en tant qu'invité sans créer de compte. Vous avez simplement besoin d'indiquer votre nom, téléphone et adresse de livraison. La création d'un compte est optionnelle et permet de suivre vos commandes."
        }
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
