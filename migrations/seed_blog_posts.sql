-- Insert the 'Comprendre la Dysfonction Érectile' article
INSERT INTO "public"."posts" ("id", "site_id", "slug", "title", "excerpt", "content", "cover_image", "author", "published", "published_at", "created_at", "updated_at") 
VALUES (
  '84ad3950-b1c4-436a-af03-473560e3a63d', 
  '1eb8ee95-426c-409b-8d0b-f5a736a547d0', 
  'comprendre-dysfonction-erectile-maroc', 
  'Comprendre la Dysfonction Érectile au Maroc : Briser le Silence', 
  'Une analyse approfondie sur les causes, la stigmatisation et les réalités médicales de la dysfonction érectile au Maroc et en Afrique du Nord.', 
  '{
    "theme": "educational_deep_dive",
    "references": [
      {
        "text": "MDPI - Diabetes Prevalence Morocco 2024",
        "url": "https://www.mdpi.com/journal/jcm"
      },
      {
        "text": "WHO - Tobacco Profile 2018",
        "url": "https://www.who.int/publications/m/item/tobacco-profile-morocco-2018"
      },
      {
        "text": "PubMed - DE Prevalence Casablanca",
        "url": "https://pubmed.ncbi.nlm.nih.gov/"
      },
      {
        "text": "Aujourd''hui le Maroc - Carte Sanitaire 2024",
        "url": "https://aujourdhui.ma/societe/sante-la-nouvelle-carte-sanitaire-devoilee"
      }
    ],
    "blocks": [
      {
        "type": "text",
        "content": "<p>Ceci est un aperçu basé sur le web de la <strong>dysfonction érectile (DE) : traitement + sensibilisation au Maroc</strong>, organisé autour de la stigmatisation, des causes, de l''accès et de la ''psychologie du patient''.</p>"
      },
      {
        "type": "hero",
        "heading": "1) Stigmatisation culturelle : ''Hchouma'', masculinité et silence"
      },
      {
        "type": "text",
        "title": "Comment c''est perçu",
        "content": "<ul><li>Au Maroc, de nombreux sujets sexuels relèvent de la <em>hchouma</em> (honte/déshonneur), une norme de contrôle social qui décourage la discussion ouverte—surtout concernant la ''performance masculine''.</li><li>Dans les contextes MENA, la recherche sur la santé sexuelle/reproductive des hommes signale de manière répétée le <strong>tabou + les attentes de masculinité</strong> comme des obstacles à la recherche d''aide, les hommes retardant souvent les soins pour éviter une perte de statut perçue.</li></ul>"
      },
      {
        "type": "quote",
        "content": "Le tabou au Maroc est décrit par le mot hchouma... honte ou déshonneur et agit comme une norme sociale restrictive."
      },
      {
        "type": "hero",
        "heading": "2) Réalité médicale : ce qui cause la DE localement"
      },
      {
        "type": "text",
        "content": "<p>La DE est généralement <strong>multifactorielle</strong> (vasculaire + métabolique + psychologique + effets des médicaments). Au Maroc, plusieurs facteurs de risque majeurs se démarquent :</p>"
      },
      {
        "type": "alert",
        "variant": "warning",
        "content": "<strong>Diabète (facteur majeur) :</strong> La prévalence du diabète chez les adultes au Maroc est estimée à ~11,9% (2024). La DE associée au diabète est courante et peut apparaître tôt."
      },
      {
          "type": "alert",
          "variant": "warning",
          "content": "<strong>Tabagisme & Risque Cardio :</strong> ~22,3% des hommes fument. La DE est souvent un signe précoce de maladie vasculaire."
      },
      {
        "type": "hero",
        "heading": "3) Traitements et accès : Casablanca vs Maroc rural"
      },
      {
        "type": "text",
        "content": "<h3>Disponibilité des spécialistes</h3><ul><li>Il existe une pénurie et une distribution inégale des urologues, concentrés principalement à <strong>Casablanca-Settat et Rabat-Salé-Kénitra</strong>.</li><li>Réalité pratique : À Casa/Rabat, il y a plus de cliniques privées et de discrétion. Dans les zones rurales, les délais sont longs et la pression sociale ''tout le monde se connaît'' est forte.</li></ul>"
      },
      {
        "type": "product_grid",
        "title": "Nos solutions recommandées pour la performance",
        "productIds": ["8507305f-6f94-4a6a-86bc-3e2e99649d3f", ""]
      },
      {
        "type": "hero",
        "heading": "4) Psychologie du patient"
      },
      {
        "type": "text",
        "content": "<p>Les hommes présentent souvent des symptômes tels que ''Je suis fatigué/stressé'' pour externaliser la cause, ou évitent les consultations par peur du diagnostic (diabète, cœur) ou par menace identitaire.</p>"
      },
      {
         "type": "hero",
         "heading": "5) Fausses idées courantes"
      },
      {
        "type": "alert",
        "variant": "tip",
        "content": "❌ <strong>''C''est juste psychologique.''</strong> Réalité : Les facteurs métaboliques (diabète) sont fréquents."
      },
      {
        "type": "alert",
        "variant": "tip",
         "content": "❌ <strong>''C''est juste l''âge.''</strong> Réalité : La DE peut être un signe avant-coureur vasculaire."
      },
      {
         "type": "alert",
         "variant": "tip",
         "content": "❌ <strong>''Les produits naturels sont plus sûrs.''</strong> Réalité : Risque élevé de produits frelatés sur le marché informel."
      }
    ]
  }',
  null,
  'Dr. Rédaction Intimacy',
  true,
  '2026-01-28 16:47:51.740599+00',
  '2026-01-28 16:27:02.049686+00',
  '2026-01-28 16:47:51.740599+00'
)
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  published = EXCLUDED.published;
