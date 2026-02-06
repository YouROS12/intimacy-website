
import React from 'react';
import LegalLayout from '@/components/LegalLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Politique de Confidentialité | Intimacy Wellness Morocco',
    description: 'Notre engagement pour la protection de vos données personnelles.',
};

export default function PrivacyPage() {
    return (
        <LegalLayout activeTab="privacy">
            <div className="prose prose-slate max-w-none">
                <h1>Politique de Confidentialité</h1>
                <p className="text-sm text-gray-500">Dernière mise à jour : Janvier 2026</p>

                <h2>1. Introduction</h2>
                <p>
                    Intimacy Wellness Morocco ("nous", "notre") s'engage à protéger votre vie privée.
                    Cette politique explique comment nous collectons, utilisons et protégeons vos données personnelles.
                </p>

                <h2>2. Données Collectées</h2>
                <p>Nous collectons les informations suivantes lors de vos commandes :</p>
                <ul>
                    <li><strong>Informations d'identité :</strong> Nom complet</li>
                    <li><strong>Coordonnées :</strong> Numéro de téléphone, adresse de livraison</li>
                    <li><strong>Email :</strong> Uniquement si vous créez un compte (optionnel)</li>
                    <li><strong>Historique de commandes :</strong> Produits commandés, montants</li>
                </ul>
                <p>
                    <strong>Nous ne stockons JAMAIS</strong> d'informations de carte bancaire.
                    Tous les paiements sont effectués en espèces à la livraison (COD).
                </p>

                <h2>3. Utilisation des Données</h2>
                <p>Vos données sont utilisées exclusivement pour :</p>
                <ul>
                    <li>Traiter et livrer vos commandes</li>
                    <li>Vous contacter concernant votre commande</li>
                    <li>Améliorer nos services</li>
                </ul>

                <h2>4. Livraison Discrète</h2>
                <p>
                    Nous utilisons des transporteurs tiers pour la livraison. Vos données sont partagées
                    avec eux uniquement à des fins de livraison. <strong>L'étiquette du colis ne décrit
                        jamais le contenu</strong> - tous les colis sont envoyés dans un emballage neutre.
                </p>

                <h2>5. Sécurité des Données</h2>
                <p>
                    Nous utilisons des mesures de sécurité conformes aux standards de l'industrie :
                </p>
                <ul>
                    <li>Connexion HTTPS chiffrée</li>
                    <li>Base de données sécurisée avec Supabase</li>
                    <li>Accès restreint aux données personnelles</li>
                </ul>

                <h2>6. Vos Droits</h2>
                <p>Conformément à la loi marocaine 09-08, vous avez le droit de :</p>
                <ul>
                    <li>Accéder à vos données personnelles</li>
                    <li>Demander la correction de vos données</li>
                    <li>Demander la suppression de vos données</li>
                </ul>
                <p>
                    Pour exercer ces droits, contactez-nous via WhatsApp : +212 656 201 278
                </p>

                <h2>7. Cookies</h2>
                <p>
                    Nous utilisons des cookies essentiels pour le fonctionnement du site (panier d'achat, session).
                    Aucun cookie publicitaire n'est utilisé.
                </p>

                <h2>8. Contact</h2>
                <p>
                    Pour toute question concernant cette politique :<br />
                    WhatsApp : +212 656 201 278<br />
                    Email : contact@intamicy.ma
                </p>
            </div>
        </LegalLayout>
    );
};
