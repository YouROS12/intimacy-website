
import React from 'react';
import LegalLayout from '@/components/LegalLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Politique de Retour | Intimacy Wellness Morocco',
    description: 'Conditions de retour, remboursement et échanges.',
};

export default function ReturnsPage() {
    return (
        <LegalLayout activeTab="returns">
            <div className="prose prose-slate max-w-none">
                <h1>Politique de Retour et Remboursement</h1>
                <p className="text-sm text-gray-500">Dernière mise à jour : Janvier 2026</p>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-6 not-prose">
                    <p className="text-amber-800 text-sm">
                        <strong>⚠️ Important :</strong> En raison de la nature intime de nos produits,
                        les retours sont soumis à des conditions strictes pour des raisons d'hygiène et de sécurité.
                    </p>
                </div>

                <h2>1. Produits Éligibles au Retour</h2>
                <p>Vous pouvez retourner un produit dans les cas suivants :</p>
                <ul>
                    <li><strong>Produit défectueux :</strong> Défaut de fabrication visible</li>
                    <li><strong>Erreur de commande :</strong> Nous vous avons envoyé le mauvais produit</li>
                    <li><strong>Produit endommagé :</strong> Colis reçu abîmé pendant le transport</li>
                    <li><strong>Produit non ouvert :</strong> Emballage d'origine intact, dans les 7 jours</li>
                </ul>

                <h2>2. Produits NON Éligibles</h2>
                <p>Les retours ne sont <strong>PAS acceptés</strong> pour :</p>
                <ul>
                    <li>❌ Produits dont l'emballage a été ouvert</li>
                    <li>❌ Produits utilisés ou testés</li>
                    <li>❌ Lubrifiants, gels et produits cosmétiques ouverts</li>
                    <li>❌ Retours après 7 jours de réception</li>
                </ul>

                <h2>3. Comment Effectuer un Retour</h2>
                <ol>
                    <li>
                        <strong>Contactez-nous</strong> via WhatsApp (+212 656 201 278) dans les 48h
                        suivant la réception avec :
                        <ul>
                            <li>Votre numéro de commande</li>
                            <li>Photo du produit et de l'emballage</li>
                            <li>Description du problème</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Attendez notre validation</strong> - nous vous recontacterons sous 24h
                    </li>
                    <li>
                        <strong>Renvoyez le produit</strong> selon nos instructions (frais de retour à votre charge
                        sauf en cas d'erreur de notre part)
                    </li>
                </ol>

                <h2>4. Remboursement</h2>
                <p>Une fois le retour validé :</p>
                <ul>
                    <li><strong>Échange :</strong> Nous vous envoyons un nouveau produit sans frais</li>
                    <li><strong>Avoir :</strong> Crédit sur votre prochaine commande</li>
                    <li><strong>Remboursement :</strong> Virement bancaire sous 5-7 jours ouvrables</li>
                </ul>

                <h2>5. Réclamations</h2>
                <p>
                    Vérifiez votre colis <strong>à la réception</strong>. Toute réclamation pour
                    colis endommagé doit être signalée immédiatement au livreur et à notre service client.
                </p>

                <h2>6. Contact Service Client</h2>
                <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 my-6 not-prose">
                    <p className="text-brand-800">
                        <strong>📱 WhatsApp :</strong> +212 656 201 278<br />
                        <strong>📧 Email :</strong> contact@intamicy.ma<br />
                        <strong>⏰ Disponibilité :</strong> Lundi - Samedi, 9h - 18h
                    </p>
                </div>
            </div>
        </LegalLayout>
    );
};
