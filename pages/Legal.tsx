import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SeoHead from '../components/SeoHead';

const Legal: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const isPrivacy = path.includes('privacy');
  const isReturns = path.includes('returns');
  const isTerms = !isPrivacy && !isReturns;

  const tabs = [
    { path: '/legal/privacy', label: 'Politique de Confidentialité', active: isPrivacy },
    { path: '/legal/terms', label: 'Conditions Générales', active: isTerms },
    { path: '/legal/returns', label: 'Politique de Retour', active: isReturns },
  ];

  return (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        title={isPrivacy ? 'Politique de Confidentialité' : isReturns ? 'Politique de Retour' : 'Conditions Générales'}
        description="Politique de confidentialité, conditions générales de vente et politique de retour d'Intimacy Wellness Morocco."
      />
      <div className="max-w-3xl mx-auto">
        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200 pb-4">
          <div className="flex flex-wrap gap-4">
            {tabs.map(tab => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`text-sm sm:text-base font-medium transition-colors ${tab.active
                    ? 'text-brand-600 border-b-2 border-brand-600 pb-2'
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Privacy Policy */}
        {isPrivacy && (
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
        )}

        {/* Terms of Service */}
        {isTerms && (
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
              Consultez notre <Link to="/legal/returns" className="text-brand-600 hover:underline">Politique de Retour</Link> pour
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
        )}

        {/* Returns Policy */}
        {isReturns && (
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
        )}
      </div>
    </div>
  );
};

export default Legal;