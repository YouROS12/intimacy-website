/**
 * Script: update-product-seo.js
 * Updates seo_title + seo_description for all products in Supabase.
 * Run: node scripts/update-product-seo.js
 */

const SUPABASE_URL = 'https://cquuanvqjupmtevrtjvl.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
};

// Category → French keyword
const CAT_LABEL = {
  Condoms: 'Préservatif',
  Lubricant: 'Lubrifiant Intime',
  'Intimate Gel': 'Gel Intime',
  'Intimate Care': 'Soin Intime',
  Massage: 'Huile de Massage',
  'Sexual Wellness': 'Soin Bien-être Intime',
  'Delay Spray/Cream': 'Spray Retardant',
  'Wellness Kit': 'Kit Bien-être',
};

// Category → SEO benefit phrase
const CAT_BENEFIT = {
  Condoms: 'protection optimale',
  Lubricant: 'confort et plaisir accrus',
  'Intimate Gel': 'hygiène intime respectueuse du pH',
  'Intimate Care': 'soin et hydratation intime',
  Massage: 'détente et sensualité',
  'Sexual Wellness': 'bien-être intime complet',
  'Delay Spray/Cream': 'durée prolongée',
  'Wellness Kit': 'routine bien-être complète',
};

function buildSeoTitle(p) {
  // Max ~60 chars
  const cat = CAT_LABEL[p.category] || p.category;
  const brand = p.brand ? ` ${p.brand}` : '';
  // Keep name clean (remove trailing spaces etc.)
  const name = p.name.trim();
  const candidate = `${name}${brand} | ${cat} Maroc`;
  if (candidate.length <= 60) return candidate;
  // Shorten: drop brand if too long
  const short = `${name} | ${cat} Maroc`;
  if (short.length <= 60) return short;
  // Truncate name
  return `${name.substring(0, 45).trim()}… | Intimacy Maroc`;
}

function buildSeoDescription(p) {
  // Max 155 chars
  const cat = CAT_LABEL[p.category] || p.category;
  const brand = p.brand ? ` ${p.brand}` : '';
  const benefit = CAT_BENEFIT[p.category] || 'qualité premium';
  const price = Number(p.price).toFixed(0);
  const desc = `Achetez ${p.name.trim()}${brand} à ${price} MAD — ${cat} pour ${benefit}. Livraison discrète 24-48h partout au Maroc. Paiement à la livraison.`;
  if (desc.length <= 155) return desc;
  // Shorten
  const short = `${p.name.trim()}${brand} — ${cat} ${price} MAD. Livraison discrète au Maroc en 24-48h. Paiement à la livraison.`;
  return short.substring(0, 155);
}

async function fetchProducts() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=*&limit=500`,
    { headers }
  );
  if (!res.ok) throw new Error(`Fetch error: ${res.status} ${await res.text()}`);
  return res.json();
}

async function upsertProduct(product, seo_title, seo_description) {
  // Must include all non-null fields to satisfy NOT NULL constraints in upsert
  const payload = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    image_url: product.image_url,
    stock: product.stock,
    features: product.features ?? [],
    is_featured: product.is_featured ?? false,
    show_on_homepage: product.show_on_homepage ?? false,
    brand: product.brand,
    seo_title,
    seo_description,
  };

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?on_conflict=id`,
    {
      method: 'POST',
      headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify([payload]),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upsert error for ${product.id}: ${res.status} ${err}`);
  }
}

async function main() {
  console.log('Fetching products...');
  const products = await fetchProducts();
  console.log(`Found ${products.length} products. Updating SEO fields...\n`);

  let updated = 0;
  let skipped = 0;

  for (const p of products) {
    // Skip if already manually set
    if (p.seo_title && p.seo_title.length > 5) {
      console.log(`  SKIP (already set): ${p.name}`);
      skipped++;
      continue;
    }

    const seo_title = buildSeoTitle(p);
    const seo_description = buildSeoDescription(p);

    process.stdout.write(`  Updating: ${p.name.substring(0, 50).padEnd(50)} | title(${seo_title.length}c) ...`);
    await upsertProduct(p, seo_title, seo_description);
    console.log(' ✓');
    updated++;

    // Avoid rate limiting
    await new Promise(r => setTimeout(r, 50));
  }

  console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
