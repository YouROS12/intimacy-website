
import React from 'react';
import Link from 'next/link';
import LegalLayout from '@/components/LegalLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Conditions Générales | Intimacy Wellness Morocco',
    description: 'Conditions générales de vente et d\'utilisation du site Intimacy Wellness Morocco.',
};

export default function TermsPage() {
    return (
        <LegalLayout activeTab="terms">
            <div className="prose prose-slate max-w-none">
                <h1>Conditions Générales de Vente</h1>
                <p className="text-sm text-gray-500">Dernière mise à jour : Janvier 2026</p>

                <h2>1. Acceptation des Conditions</h2>
                <p>
                    En accédant à ce site et en passant commande, vous acceptez d'être lié par ces
                    Conditions Générales de Vente.
                </p>

                <h2>2. Restriction d'Âge</h2>
                <p>
                    <strong>Vous devez avoir au moins 18 ans</strong> pour acheter sur ce site.
                    En passant commande, vous confirmez être majeur.
                </p>

                <h2>3. Produits</h2>
                <p>
                    Tous les produits sont vendus à des fins de bien-être intime. Nous proposons
                    exclusivement des produits de marques reconnues (Durex, Manix, Control, etc.)
                    et garantissons leur authenticité.
                </p>

                <h2>4. Prix et Paiement</h2>
                <ul>
                    <li>Les prix sont affichés en Dirhams Marocains (MAD)</li>
                    <li>Paiement accepté : <strong>Espèces à la livraison (COD)</strong></li>
                    <li>Livraison gratuite sur tout le territoire marocain</li>
                </ul>

                <h2>5. Commandes</h2>
                <p>
                    Après validation de votre commande, vous recevrez un appel de confirmation
                    pour vérifier les détails de livraison. Nous nous réservons le droit de
                    refuser toute commande suspecte.
                </p>

                <h2>6. Livraison</h2>
                <ul>
                    <li>Délai : 2-5 jours ouvrables selon la ville</li>
                    <li>Emballage : 100% discret, sans mention du contenu</li>
                    <li>Zone : Tout le Maroc</li>
                </ul>

                <h2>7. Retours</h2>
                <p>
                    Consultez notre <Link href="/legal/returns" className="text-brand-600 hover:underline">Politique de Retour</Link> pour
                    les conditions détaillées.
                </p>

                <h2>8. Responsabilité</h2>
                <p>
                    Nous ne sommes pas responsables de l'utilisation incorrecte des produits.
                    Veuillez lire les instructions fournies avec chaque produit.
                </p>

                <h2>9. Propriété Intellectuelle</h2>
                <p>
                    Tout le contenu du site (textes, images, logos) est protégé par le droit
                    d'auteur. Toute reproduction sans autorisation est interdite.
                </p>

                <h2>10. Contact</h2>
                <p>
                    WhatsApp : +212 656 201 278<br />
                    Email : contact@intamicy.ma
                </p>
            </div>
        </LegalLayout>
    );
};
