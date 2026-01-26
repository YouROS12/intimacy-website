
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'; // Note: You might need to install dotenv if not present
// If scripts are modules, we can use top level await.

// Load environment variables manually since we are running this as a script
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cquuanvqjupmtevrtjvl.supabase.co';
// Note: In a real script, we'd use a service role key if RLS blocks public access, 
// but for public products, the anon key should work if policies allow read.
// We'll use the anon key hardcoded for now or from env to match the project setup.
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_tA9-QTGTlRM9hTr4QC24jw_ymguApsl';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BASE_URL = 'https://intamicy.ma';

async function generateSitemap() {
    console.log('🗺️  Generating Sitemap...');

    // 1. Fetch all products
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name'); // Simplified query

    if (error) {
        console.error('Error fetching products:', error);
        process.exit(1);
    }

    console.log(`   ✓ Found ${products.length} products`);

    // 2. Define static routes
    const staticRoutes = [
        '/',
        '/shop',
        '/about',
        '/legal/privacy',
        '/legal/terms',
        '/login'
    ];

    // 3. Build XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static routes
    staticRoutes.forEach(route => {
        sitemap += `  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>
`;
    });

    // Add product routes
    products.forEach(product => {
        sitemap += `  <url>
    <loc>${BASE_URL}/product/${product.id}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    // 4. Write to file
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const publicDir = path.join(__dirname, '../public');

    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
    console.log(`✅ Sitemap generated at ${path.join(publicDir, 'sitemap.xml')}`);
}

generateSitemap();
