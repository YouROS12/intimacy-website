/**
 * Script: insert-guides.js
 * Inserts 6 keyword-targeted guide posts into Supabase.
 * Run: node scripts/insert-guides.js
 */

const SUPABASE_URL = 'https://cquuanvqjupmtevrtjvl.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_ID = '1eb8ee95-426c-409b-8d0b-f5a736a547d0';

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
};

// Key product IDs
const IDS = {
  // Condoms
  manixSkynOriginal20:   '0884eeb1-c5d4-42e9-9694-2cbcf4ca1ff4',
  manixSkynEliteKing20:  '4d6d637d-f060-4dcc-8fa5-a59a4b2bf215',
  manixSkynIntenseFeel:  '99d1187b-6836-4c43-8af3-e2f3b491b902',
  durexPerformaxIntense: '8aecf27b-1969-4b98-a2e4-ab2aeac23e9a',
  durexFetherliteUltra:  '5e9521bb-5730-47af-a5b5-9d7f2ef6ad50',
  durexPleasureMe12:     '53e15513-963b-45c9-a5ee-7103ef481f6c',
  misterSize57x36:       '752ed301-f8b6-48fd-8264-81b6803ab974',
  manixContactPlus12:    '33f220cb-a090-4001-8220-9ae9d39a27a1',
  manixPure10:           '86b8634b-9df3-4a52-9d4a-47b0de20ab2d',
  manixUltraProtect12:   'b3724836-a897-432f-a99c-a8402ded8404',
  // Lubricants
  manixGelNatural100:    'e23e188c-218a-4192-9c53-ff9e1898dad6',
  manixSkynEndless80:    'dcb823cd-9a7f-4ad2-8aed-bdba14088718',
  manixGelAquaAloe:      'ecd97a5b-3df2-406e-b3db-2372e7d38329',
  manixGelEffect:        'e404c2d8-25e1-47dd-bee3-322eeea3fed6',
  // Intimate Gel
  cumlaude500:           '898cc7e7-b13e-4d95-a691-27de1dec6084',
  novaskinGel200:        'a62145a1-ade1-4e6a-a0c5-aa6b35c32fce',
  addaxSeptidol250ph5:   '85ee3f75-4556-41da-8443-59cd9e6a2cfe',
};

const guides = [
  // ─────────────────────────────────────────────────────── GUIDE 1
  {
    title: 'Quel préservatif choisir au Maroc ? Guide complet 2026',
    slug: 'quel-preservatif-choisir-maroc-guide-2026',
    excerpt: 'Manix, Durex, Mister Size : comment choisir le bon préservatif au Maroc selon votre taille, vos préférences et votre budget. Guide expert avec comparatif complet.',
    author: 'Équipe Intimacy Wellness',
    published: true,
    content: {
      theme: 'educational_deep_dive',
      references: [],
      blocks: [
        { type: 'text', content: '<p>Choisir le bon préservatif est essentiel pour votre sécurité et votre plaisir. Au Maroc, les marques <strong>Manix</strong>, <strong>Durex</strong> et <strong>Mister Size</strong> dominent le marché. Ce guide vous aide à faire le bon choix selon votre profil.</p>' },
        { type: 'hero', heading: '1. Pourquoi le choix du préservatif est important' },
        { type: 'text', content: '<p>Le préservatif reste la seule méthode de contraception qui protège simultanément contre les <strong>IST</strong> (Infections Sexuellement Transmissibles) et les grossesses non désirées. Un mauvais choix — taille inadaptée, matière incompatible — peut:</p><ul><li>Réduire la sensation et donc l\'utilisation régulière</li><li>Augmenter le risque de rupture</li><li>Provoquer des irritations en cas d\'allergie au latex</li></ul>' },
        { type: 'alert', variant: 'tip', content: '✅ <strong>Astuce :</strong> Un préservatif bien ajusté est 2x moins susceptible de se rompre. La taille compte vraiment.' },
        { type: 'hero', heading: '2. Comment choisir la bonne taille' },
        { type: 'text', content: '<h3>Guide de taille standard</h3><ul><li><strong>Taille standard (52-54mm)</strong> : Manix Super, Durex Extra Safe, Protect</li><li><strong>Large / King Size (56-60mm)</strong> : Manix King Size Max, Manix Skyn King Size</li><li><strong>Extra-large (64mm+)</strong> : Mister Size 64, Manix Skyn Elite King Size</li><li><strong>Slim / Snug (49-52mm)</strong> : Mister Size 49, Mister Size 53</li></ul><p>La marque <strong>Mister Size</strong> est disponible en 5 largeurs différentes — idéale si vous avez du mal à trouver votre taille.</p>' },
        { type: 'hero', heading: '3. Manix vs Durex : lequel choisir ?' },
        { type: 'text', content: '<h3>Manix</h3><ul><li>Marque française, très populaire au Maroc</li><li>Gamme <strong>Skyn</strong> en polyisoprène (sans latex) — idéale pour les allergiques</li><li>Gamme <strong>Pure</strong> ultra-fine pour plus de sensations</li><li>Gamme <strong>Xtra Pleasure</strong> avec nervures et points de plaisir</li><li>Prix : 20–200 MAD selon gamme et quantité</li></ul><h3>Durex</h3><ul><li>Marque mondiale avec présence confirmée au Maroc</li><li><strong>Fetherlite Ultra</strong> : ultra-fins pour sensations naturelles</li><li><strong>Performax Intense</strong> : lubrifiant spermicide + effet retard</li><li><strong>Extra Safe</strong> : paroi plus épaisse pour sécurité maximale</li><li>Prix : 17–67 MAD</li></ul>' },
        { type: 'quote', content: 'La gamme Skyn de Manix est fabriquée en polyisoprène ultra-doux — les utilisateurs rapportent des sensations proches de "sans préservatif".', author: 'Équipe Intimacy' },
        { type: 'hero', heading: '4. Préservatifs sans latex : Manix Skyn' },
        { type: 'text', content: '<p>Environ <strong>2 à 3% de la population</strong> est allergique au latex naturel. Les symptômes incluent démangeaisons, rougeurs et gonflements. La gamme <strong>Manix Skyn</strong> (polyisoprène) est la solution :</p><ul><li>Manix Skyn Original — standard</li><li>Manix Skyn Elite King Size — pour les morphologies plus larges</li><li>Manix Skyn Intense Feel — texture nervurée</li><li>Manix Skyn 5 Senses — pack découverte</li></ul>' },
        { type: 'product_grid', title: 'Notre sélection Manix Skyn', productIds: [IDS.manixSkynOriginal20, IDS.manixSkynEliteKing20, IDS.manixSkynIntenseFeel] },
        { type: 'hero', heading: '5. Notre recommandation par profil' },
        { type: 'text', content: '<ul><li><strong>Première fois / budget serré</strong> : Protect Nature 6 pièces (12 MAD) ou Manix Contact Plus 6 pièces</li><li><strong>Sensation maximale</strong> : Manix Pure 10 pièces ou Durex Fetherlite Ultra 10</li><li><strong>Allergie latex</strong> : Manix Skyn Elite ou Manix Skyn Intense Feel</li><li><strong>Grande taille</strong> : Mister Size 64x10 ou Manix Skyn Elite King Size</li><li><strong>Plaisir partagé</strong> : Durex Performax Intense (effet retardant + lubrifiant)</li></ul>' },
        { type: 'product_grid', title: 'Top ventes préservatifs Maroc', productIds: [IDS.durexPerformaxIntense, IDS.durexFetherliteUltra, IDS.manixPure10, IDS.misterSize57x36] },
        { type: 'alert', variant: 'info', content: '<strong>À savoir :</strong> Tous nos préservatifs sont livrés en emballage 100% discret — sans logo ni mention du contenu. Livraison 24-48h partout au Maroc, paiement à la livraison.' },
      ]
    }
  },

  // ─────────────────────────────────────────────────────── GUIDE 2
  {
    title: 'Lubrifiant intime : comment choisir et l\'utiliser — Guide Maroc',
    slug: 'lubrifiant-intime-choisir-utiliser-maroc',
    excerpt: 'Guide complet sur les lubrifiants intimes au Maroc : différences base eau vs silicone, comment les utiliser, quels produits choisir et où en acheter discrètement.',
    author: 'Équipe Intimacy Wellness',
    published: true,
    content: {
      theme: 'educational_deep_dive',
      references: [],
      blocks: [
        { type: 'text', content: '<p>Le lubrifiant intime est l\'un des produits de bien-être les plus utiles, mais aussi les moins bien compris. Ce guide vous explique tout : pourquoi en utiliser, comment choisir et quels produits sont disponibles au Maroc.</p>' },
        { type: 'hero', heading: '1. Pourquoi utiliser un lubrifiant intime ?' },
        { type: 'text', content: '<p>La lubrification naturelle peut varier selon :</p><ul><li>Le <strong>niveau de stress ou d\'anxiété</strong></li><li>Les <strong>médicaments</strong> (antihistaminiques, antidépresseurs, contraceptifs hormonaux)</li><li>La <strong>ménopause</strong> (baisse d\'œstrogènes = sécheresse intime)</li><li>L\'<strong>allaitement</strong></li><li>Les <strong>rapports prolongés</strong></li></ul><p>Un lubrifiant ne signifie pas que vous êtes "anormal" — c\'est un outil de confort et de plaisir pour tout le monde.</p>' },
        { type: 'alert', variant: 'tip', content: '✅ <strong>Le saviez-vous ?</strong> 70% des femmes déclarent que le lubrifiant améliore leur expérience sexuelle. Il est légitimement recommandé par les gynécologues.' },
        { type: 'hero', heading: '2. Lubrifiant base eau vs base silicone' },
        { type: 'text', content: '<h3>Base d\'eau (recommandé pour débuter)</h3><ul><li>Compatible avec tous les préservatifs en latex ✅</li><li>Compatible avec les sex-toys ✅</li><li>Se lave facilement à l\'eau</li><li>Ne tache pas les draps</li><li>Peut s\'assécher plus vite (applicader si besoin)</li><li><strong>Produits au Maroc</strong> : Manix Gel Natural, Manix Gel Pure, MANIX SKYN NATURALLY ENDLESS, Lubrix, Protect Gel</li></ul><h3>Base silicone</h3><ul><li>Durée beaucoup plus longue — idéal pour rapports prolongés</li><li>Compatible latex ✅ — mais incompatible avec sex-toys en silicone ❌</li><li>Se lave au savon</li><li><strong>Produits au Maroc</strong> : Cumlaude Lab Lubripiu</li></ul>' },
        { type: 'hero', heading: '3. Comment utiliser un lubrifiant correctement' },
        { type: 'text', content: '<ol><li><strong>Quantité</strong> : Commencez avec une petite noisette (1-2 ml). Ajoutez selon le besoin.</li><li><strong>Application</strong> : Appliquez sur la zone génitale ET sur le préservatif si vous en utilisez un.</li><li><strong>Timing</strong> : Peut être appliqué avant ou pendant les préliminaires.</li><li><strong>Compatibilité</strong> : Vérifiez toujours si le lubrifiant est compatible avec votre préservatif (base eau = compatible tout).</li><li><strong>Conservation</strong> : Fermez bien le flacon, conservez à température ambiante.</li></ol>' },
        { type: 'alert', variant: 'warning', content: '⚠️ <strong>À éviter :</strong> Huile de coco, vaseline, huile d\'olive — ces huiles dégradent le latex et augmentent le risque de rupture du préservatif de 90%.' },
        { type: 'hero', heading: '4. Les meilleurs lubrifiants disponibles au Maroc' },
        { type: 'text', content: '<h3>Pour les débutants (rapport qualité/prix)</h3><ul><li><strong>Protect Gel Nature 100ml</strong> — 37 MAD. Parfait pour commencer.</li><li><strong>Manix Gel Natural 100ml</strong> — 92 MAD. Ingrédients naturels, respectueux du pH.</li></ul><h3>Pour les sensations premium</h3><ul><li><strong>MANIX SKYN NATURALLY ENDLESS 80ml</strong> — 102 MAD. Formule longue durée.</li><li><strong>Manix Gel Infiniti 100ml</strong> — 99 MAD. Glisse extrême.</li></ul><h3>Pour la sécheresse intime / usage médical</h3><ul><li><strong>Cumlaude Lab Lubripiu 30ml</strong> — 199 MAD. Recommandé par les gynécologues.</li></ul>' },
        { type: 'product_grid', title: 'Nos lubrifiants recommandés', productIds: [IDS.manixGelNatural100, IDS.manixSkynEndless80, 'f96535bb-a68d-428c-bee2-40f8d483de90', 'e23e188c-218a-4192-9c53-ff9e1898dad6'] },
        { type: 'alert', variant: 'info', content: '<strong>Livraison 100% discrète :</strong> Tous nos lubrifiants sont expédiés dans un colis anonyme sans mention du contenu. Disponible partout au Maroc en 24-48h, paiement à la livraison.' },
      ]
    }
  },

  // ─────────────────────────────────────────────────────── GUIDE 3
  {
    title: 'Hygiène intime féminine : les 7 erreurs à éviter',
    slug: 'hygiene-intime-feminine-erreurs-eviter',
    excerpt: 'Savon classique, douches vaginales, produits parfumés : les erreurs d\'hygiène intime que font 80% des femmes au Maroc et comment les corriger avec les bons produits.',
    author: 'Équipe Intimacy Wellness',
    published: true,
    content: {
      theme: 'educational_deep_dive',
      references: [],
      blocks: [
        { type: 'text', content: '<p>La zone intime féminine est <strong>autocleanante</strong> — mais cela ne veut pas dire qu\'elle n\'a pas besoin de soins. Les mauvaises pratiques peuvent perturber le microbiome vaginal et provoquer infections, irritations et déséquilibres du pH. Voici les 7 erreurs les plus courantes au Maroc.</p>' },
        { type: 'hero', heading: 'Erreur #1 : Utiliser du savon classique' },
        { type: 'text', content: '<p>Le savon classique a un pH alcalin (8-10), alors que la zone intime féminine nécessite un pH <strong>acide (3,8-4,5)</strong> pour maintenir la flore protectrice de Lactobacilles.</p><p><strong>Utiliser du savon ordinaire</strong> détruit cette flore, ouvrant la porte aux infections à candida (mycoses) et vaginoses bactériennes.</p><p><strong>Solution :</strong> Utilisez un gel intime formulé avec un pH adapté (4,5-5,5).</p>' },
        { type: 'hero', heading: 'Erreur #2 : Les douches vaginales' },
        { type: 'text', content: '<p>Les douches vaginales internes sont <strong>contre-indiquées</strong> par tous les gynécologues. Elles :</p><ul><li>Détruisent la flore vaginale protectrice</li><li>Peuvent pousser des bactéries vers l\'utérus</li><li>Augmentent le risque d\'IST et de grossesse ectopique</li></ul><p><strong>Solution :</strong> Nettoyage externe uniquement avec un gel intime doux.</p>' },
        { type: 'alert', variant: 'warning', content: '⚠️ <strong>Important :</strong> Seul le nettoyage externe (vulve) est recommandé. Le vagin se nettoie de lui-même — ne jamais introduire de produit à l\'intérieur.' },
        { type: 'hero', heading: 'Erreur #3 : Produits parfumés et déodorants intimes' },
        { type: 'text', content: '<p>Les parfums, sprays et lingettes parfumées contiennent des allergènes qui irritent la muqueuse délicate. Cette zone absorbe les produits chimiques bien plus rapidement que la peau normale.</p><p><strong>Les conséquences :</strong> Démangeaisons, rougeurs, réactions allergiques, perturbation du pH.</p><p><strong>Solution :</strong> Choisissez un gel intime <em>sans parfum</em> et <em>hypoallergénique</em>.</p>' },
        { type: 'hero', heading: 'Erreur #4 : Nettoyer trop fréquemment' },
        { type: 'text', content: '<p>Nettoyer la zone intime plus d\'une fois par jour peut être contre-productif. La flore protectrice a besoin de temps pour se reconstituer. Un nettoyage matin ou soir est suffisant.</p>' },
        { type: 'hero', heading: 'Erreur #5 : Ne past utiliser de gel pendant le traitement antibiotique' },
        { type: 'text', content: '<p>Les antibiotiques tuent aussi les bonnes bactéries. Après ou pendant un traitement antibiotique, il est recommandé d\'utiliser un gel intime avec agents rééquilibrants (comme les gammes CLX de Cumlaude Lab) pour aider à restaurer la flore.</p>' },
        { type: 'hero', heading: 'Erreur #6 : Vêtements trop serrés / synthétiques' },
        { type: 'text', content: '<p>Les sous-vêtements synthétiques et les vêtements serrés créent humidité et chaleur — terrain idéal pour les mycoses. Préférez le coton, surtout la nuit.</p>' },
        { type: 'hero', heading: 'Erreur #7 : Utiliser le même produit pour l\'extérieur et l\'anus' },
        { type: 'text', content: '<p>Le nettoyage doit toujours se faire <strong>de avant vers arrière</strong> pour éviter la contamination fécale. Ce principe simple prévient 80% des infections urinaires.</p>' },
        { type: 'hero', heading: 'Les bons gels intimes disponibles au Maroc' },
        { type: 'text', content: '<p>Au Maroc, plusieurs gammes professionnelles sont disponibles chez intimacy.ma :</p><ul><li><strong>Cumlaude Lab Deligyn</strong> — formule gynécologique, pH 4,5, sans parfum</li><li><strong>Novaskin Gel Intime PH Neutre</strong> — doux, quotidien</li><li><strong>Addax Septidol pH5</strong> — action antibactérienne douce</li><li><strong>Dermoz Gel Intime pH5.5</strong> — 250ml, économique</li></ul>' },
        { type: 'product_grid', title: 'Gels intimes recommandés par nos expertes', productIds: [IDS.cumlaude500, IDS.addaxSeptidol250ph5, IDS.novaskinGel200, '8ede2379-ccd6-463a-8106-b0a19ad52be7'] },
      ]
    }
  },

  // ─────────────────────────────────────────────────────── GUIDE 4
  {
    title: 'Durex vs Manix au Maroc : lequel acheter en 2026 ?',
    slug: 'durex-vs-manix-comparatif-maroc-2026',
    excerpt: 'Comparatif complet Durex vs Manix au Maroc : prix, gammes, qualité, disponibilité et avis. Quel préservatif offre le meilleur rapport qualité-prix pour le marché marocain ?',
    author: 'Équipe Intimacy Wellness',
    published: true,
    content: {
      theme: 'educational_deep_dive',
      references: [],
      blocks: [
        { type: 'text', content: '<p>Durex et Manix sont les deux marques de préservatifs les plus vendues au Maroc. Mais laquelle choisir ? Ce comparatif objectif analyse prix, gammes, matières, et valeur pour vous aider à décider.</p>' },
        { type: 'hero', heading: 'Présentation des marques' },
        { type: 'text', content: '<h3>Durex</h3><p>Marque britannique (groupe Reckitt), leader mondial depuis 1929. Disponible dans plus de 140 pays. Certifiée CE, ISO 4074. Fabriquée en latex naturel (sauf exceptions). Gammes principales : Fetherlite (ultra-fin), Performax (renforcé), Extra Safe (sécurité max), Pleasure Me (plaisir).</p><h3>Manix</h3><p>Marque française (groupe HRA Pharma), très populaire en Europe et en Afrique. Gamme <strong>Skyn</strong> pionnière du préservatif sans latex. Gammes principales : Skyn (polyisoprène), Pure (ultra-fin), Contact (standard), King Size, Xtra Pleasure.</p>' },
        { type: 'hero', heading: 'Comparatif prix au Maroc' },
        { type: 'text', content: '<table style="width:100%;border-collapse:collapse"><tr><th style="text-align:left;padding:8px;border-bottom:2px solid #ddd">Produit</th><th style="padding:8px;border-bottom:2px solid #ddd">Prix unitaire estimé</th></tr><tr><td style="padding:8px">Durex Extra Safe 3</td><td style="padding:8px">~18 MAD</td></tr><tr><td style="padding:8px;background:#f9f9f9">Manix Super 6 pièces</td><td style="padding:8px;background:#f9f9f9">~35 MAD (~6 MAD/u)</td></tr><tr><td style="padding:8px">Durex Fetherlite Ultra 10</td><td style="padding:8px">~67 MAD (~7 MAD/u)</td></tr><tr><td style="padding:8px;background:#f9f9f9">Manix Skyn Original 20 pièces</td><td style="padding:8px;background:#f9f9f9">~166 MAD (~8 MAD/u)</td></tr><tr><td style="padding:8px">Durex Performax Intense 10</td><td style="padding:8px">~67 MAD (~7 MAD/u)</td></tr></table>' },
        { type: 'hero', heading: 'Comparatif gammes' },
        { type: 'text', content: '<h3>Ultra-mince (sensations naturelles)</h3><p>🏆 <strong>Égalité</strong> — Durex Fetherlite Ultra vs Manix Pure. Les deux sont excellents à ~0,045mm d\'épaisseur.</p><h3>Sans latex (allergie)</h3><p>🏆 <strong>Manix gagne</strong> — La gamme Skyn en polyisoprène est plus douce et plus disponible que les alternatives Durex.</p><h3>Grande taille</h3><p>🏆 <strong>Manix gagne</strong> — King Size Max (jusqu\'à 60mm) et Skyn Elite King Size. Durex a moins d\'options XL au Maroc.</p><h3>Effet retardant</h3><p>🏆 <strong>Durex gagne</strong> — Performax Intense avec lubrifiant Climax Control côté intérieur.</p><h3>Rapport qualité-prix</h3><p>🏆 <strong>Manix gagne</strong> — Plus de choix de formats (3, 6, 10, 12, 20 pièces). Les boîtes de 10-20 reviennent moins cher à l\'unité.</p>' },
        { type: 'alert', variant: 'tip', content: '💡 <strong>Notre recommandation :</strong> Pour un usage quotidien, commencez avec <strong>Manix Pure 10</strong> ou <strong>Durex Fetherlite Ultra 10</strong>. Pour allergie latex : <strong>Manix Skyn</strong> sans hésitation.' },
        { type: 'hero', heading: 'Disponibilité au Maroc' },
        { type: 'text', content: '<p>Chez intimacy.ma, vous trouverez les deux marques avec :</p><ul><li><strong>63+ références</strong> en stock</li><li>Livraison discrète 24-48h dans tout le Maroc</li><li>Paiement à la livraison (cash) — aucune carte bancaire requise</li><li>Service client WhatsApp 7j/7</li></ul>' },
        { type: 'product_grid', title: 'Nos bestsellers Durex & Manix', productIds: [IDS.durexPerformaxIntense, IDS.durexFetherliteUltra, IDS.manixSkynOriginal20, IDS.manixPure10] },
      ]
    }
  },

  // ─────────────────────────────────────────────────────── GUIDE 5
  {
    title: 'Livraison discrète au Maroc : comment ça fonctionne vraiment ?',
    slug: 'livraison-discrete-maroc-comment-fonctionne',
    excerpt: 'Comment fonctionne vraiment la livraison discrète au Maroc ? Emballage, délais, discrétion absolue : tout ce que vous devez savoir avant de commander en ligne.',
    author: 'Équipe Intimacy Wellness',
    published: true,
    content: {
      theme: 'educational_deep_dive',
      references: [],
      blocks: [
        { type: 'text', content: '<p>Beaucoup de Marocains hésitent à acheter des produits de bien-être intime en ligne par peur du regard des autres. Cette hésitation est compréhensible. Voici exactement comment notre livraison discrète fonctionne — sans surprise, sans mauvaise expérience.</p>' },
        { type: 'hero', heading: '1. Le colis : ce que voit (et ne voit pas) le livreur' },
        { type: 'text', content: '<p>Votre commande est emballée dans une <strong>boîte ou enveloppe neutre</strong> :</p><ul><li>❌ Aucun logo Intimacy Wellness sur l\'extérieur</li><li>❌ Aucune mention du contenu (pas de "préservatifs", "lubrifiant", etc.)</li><li>❌ Le bon de livraison n\'indique pas la nature du colis</li><li>✅ L\'expéditeur apparaît comme un nom commercial neutre</li></ul><p>Même le livreur DHL/Amana/Chronopost ne peut pas savoir ce qu\'il transporte.</p>' },
        { type: 'alert', variant: 'tip', content: '✅ <strong>100% discret</strong> : Testé et confirmé par des milliers de clients. Votre voisin, votre famille, votre livreur — personne ne saura ce que vous avez commandé.' },
        { type: 'hero', heading: '2. Les délais de livraison au Maroc' },
        { type: 'text', content: '<h3>Délais selon les villes</h3><ul><li><strong>Casablanca, Rabat</strong> : 24h (souvent livraison le lendemain si commande avant 18h)</li><li><strong>Marrakech, Fès, Tanger, Agadir</strong> : 24-48h</li><li><strong>Villes secondaires</strong> : 48-72h</li><li><strong>Zones rurales, douars</strong> : 48-96h selon l\'accessibilité</li></ul><p>Toutes les commandes sont traitées et expédiées sous <strong>24h ouvrées</strong>.</p>' },
        { type: 'hero', heading: '3. Le paiement à la livraison (COD)' },
        { type: 'text', content: '<p>Vous payez <strong>en espèces</strong> directement au livreur quand vous recevez votre colis. Avantages :</p><ul><li>Aucune carte bancaire requise</li><li>Vous vérifiez le colis avant de payer</li><li>Zéro risque de fraude en ligne</li></ul><p>Nous acceptons aussi <strong>CashPlus</strong> et <strong>Wave</strong> pour les paiements mobiles.</p>' },
        { type: 'hero', heading: '4. Et si je ne suis pas là à la livraison ?' },
        { type: 'text', content: '<p>Le livreur tente 2-3 passages. Si vous n\'êtes pas disponible :</p><ul><li>Contactez-nous sur WhatsApp au <strong>+212-656-201278</strong> pour reprogrammer</li><li>Vous pouvez demander la livraison à un voisin de confiance (le colis est discret)</li><li>Certains transporteurs peuvent laisser le colis en point relais</li></ul>' },
        { type: 'hero', heading: '5. Retours et remboursements' },
        { type: 'text', content: '<p>Si vous n\'êtes pas satisfait ou si le produit est endommagé :</p><ul><li>Retournez le produit <strong>scellé et non ouvert</strong> dans les <strong>14 jours</strong></li><li>Contactez-nous sur WhatsApp pour initier le retour</li><li>Remboursement intégral traité sous 5 jours ouvrés</li></ul>' },
        { type: 'product_grid', title: 'Produits les plus commandés en livraison discrète', productIds: [IDS.manixSkynOriginal20, IDS.durexPerformaxIntense, IDS.manixGelNatural100, IDS.cumlaude500] },
        { type: 'alert', variant: 'info', content: '<strong>Commandez maintenant</strong> sur intimacy.ma — livraison discrète 24-48h partout au Maroc. Paiement à la livraison. WhatsApp : +212-656-201278' },
      ]
    }
  },

  // ─────────────────────────────────────────────────────── GUIDE 6
  {
    title: 'Paiement à la livraison (COD) au Maroc : mode d\'emploi complet',
    slug: 'paiement-livraison-cod-maroc-guide',
    excerpt: 'Le paiement à la livraison (Cash on Delivery) est la méthode privilégiée pour acheter en ligne au Maroc. Comment ça fonctionne, ses avantages et comment commander chez intimacy.ma.',
    author: 'Équipe Intimacy Wellness',
    published: true,
    content: {
      theme: 'educational_deep_dive',
      references: [],
      blocks: [
        { type: 'text', content: '<p>Au Maroc, environ <strong>85% des achats e-commerce</strong> se font en paiement à la livraison (COD — Cash on Delivery). Ce mode de paiement est simple, sécurisé et accessible à tous. Voici tout ce qu\'il faut savoir.</p>' },
        { type: 'hero', heading: '1. Qu\'est-ce que le paiement à la livraison ?' },
        { type: 'text', content: '<p>Le <strong>paiement à la livraison (COD)</strong> signifie simplement que vous payez cash directement au livreur quand vous recevez votre commande. Vous n\'avez besoin :</p><ul><li>❌ d\'aucune carte bancaire</li><li>❌ d\'aucun compte PayPal ou Stripe</li><li>❌ d\'aucune inscription bancaire en ligne</li></ul><p>Seulement de l\'argent liquide au moment de la livraison.</p>' },
        { type: 'alert', variant: 'tip', content: '✅ <strong>Avantage principal :</strong> Vous vérifiez que le colis est bien reçu et intact AVANT de payer. Zéro risque financier.' },
        { type: 'hero', heading: '2. Pourquoi le COD est parfait pour les achats intimes au Maroc' },
        { type: 'text', content: '<ul><li><strong>Confidentialité totale</strong> : Aucune transaction bancaire liée à "Intimacy" ou "produits intimes" sur votre relevé</li><li><strong>Pas de trace numérique</strong> : Aucune empreinte sur votre historique bancaire</li><li><strong>Accessible à tous</strong> : Même sans carte bancaire ou compte en ligne</li><li><strong>Sécurité</strong> : Vous inspectez d\'abord, vous payez ensuite</li></ul>' },
        { type: 'hero', heading: '3. Étapes d\'une commande COD chez intimacy.ma' },
        { type: 'text', content: '<ol><li><strong>Ajoutez vos produits au panier</strong> sur intimacy.ma</li><li><strong>Passez à la caisse</strong> — entrez votre nom, téléphone, ville et adresse</li><li><strong>Choisissez "Paiement à la livraison"</strong> (seule option, pas de carte)</li><li><strong>Recevez une confirmation</strong> par WhatsApp ou SMS</li><li><strong>Attendez la livraison</strong> en 24-48h</li><li><strong>Payez en espèces</strong> au livreur à la réception du colis</li></ol>' },
        { type: 'hero', heading: '4. Autres modes de paiement acceptés' },
        { type: 'text', content: '<h3>CashPlus</h3><p>Un des plus grands réseaux de paiement au Maroc (plus de 3000 points de vente). Vous pouvez effectuer un transfert CashPlus au nom du livreur ou utiliser l\'application CashPlus.</p><h3>Wave</h3><p>Application de paiement mobile populaire au Maroc. Scan du QR code ou transfert direct.</p>' },
        { type: 'hero', heading: '5. FAQ sur le COD' },
        { type: 'text', content: '<h3>Que faire si je ne suis pas là ?</h3><p>Le livreur fait 2-3 tentatives. Contactez-nous sur WhatsApp pour reprogrammer la livraison.</p><h3>Puis-je annuler après la commande ?</h3><p>Oui, contactez-nous sur WhatsApp dans les 12h après la commande.</p><h3>Puis-je payer pour quelqu\'un d\'autre ?</h3><p>Oui, une autre personne peut réceptionner et payer à votre place (à votre adresse).</p><h3>Que se passe-t-il si le colis est abîmé ?</h3><p>Ne payez pas et contactez-nous immédiatement via WhatsApp (+212-656-201278).</p>' },
        { type: 'product_grid', title: 'Commandez maintenant — paiement à la livraison', productIds: [IDS.manixSkynOriginal20, IDS.manixGelNatural100, IDS.durexPerformaxIntense, IDS.cumlaude500] },
        { type: 'alert', variant: 'info', content: '📦 <strong>intimacy.ma</strong> — Livraison 100% discrète en 24-48h partout au Maroc. Paiement à la livraison uniquement. WhatsApp : +212-656-201278' },
      ]
    }
  },
];

async function postExists(slug) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/posts?slug=eq.${encodeURIComponent(slug)}&select=id`,
    { headers }
  );
  if (!res.ok) return false;
  const data = await res.json();
  return data.length > 0;
}

async function insertPost(guide) {
  const now = new Date().toISOString();
  const payload = {
    site_id: SITE_ID,
    title: guide.title,
    slug: guide.slug,
    excerpt: guide.excerpt,
    author: guide.author,
    published: guide.published,
    published_at: now,
    cover_image: null,
    content: guide.content,
    created_at: now,
    updated_at: now,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Insert error: ${res.status} ${err}`);
  }
  return res.json();
}

async function main() {
  console.log('Inserting guide posts...\n');

  for (const guide of guides) {
    process.stdout.write(`  [${guide.slug}] ...`);
    const exists = await postExists(guide.slug);
    if (exists) {
      console.log(' SKIP (already exists)');
      continue;
    }
    await insertPost(guide);
    console.log(' ✓ Inserted');
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\nAll done!');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
