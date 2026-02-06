
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load env vars to avoid 'dotenv' dependency issues
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    }
} catch (e) {
    console.warn("Could not load .env.local", e);
}

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cquuanvqjupmtevrtjvl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service Role Key is required for admin scripts

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: Please provide detailed environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DOMAIN = 'https://intimacy.ma';

async function generateImageSitemap() {
    console.log('Fetching products...');
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, image_url');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(`Found ${products.length} products.`);

    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    for (const product of products) {
        const pageUrl = `${DOMAIN}/product/${product.id}`;
        let imageUrl = product.image_url;

        if (!imageUrl) continue;

        // Apply Domain Masking
        if (imageUrl.includes(SUPABASE_URL) && imageUrl.includes('/products/')) {
            const filename = imageUrl.split('/').pop();
            imageUrl = `${DOMAIN}/cdn/products/${filename}`;
        }

        sitemapContent += `  <url>
    <loc>${pageUrl}</loc>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${escapeXml(product.name)}</image:title>
    </image:image>
  </url>
`;
    }

    sitemapContent += '</urlset>';

    // Output to Next.js public folder
    const nextPublic = path.join(__dirname, '../public/image_sitemap.xml');
    fs.writeFileSync(nextPublic, sitemapContent);
    console.log(`Image sitemap generated at: ${nextPublic}`);

    // Output to Legacy public folder (sibling directory)
    const legacyPublic = path.join(__dirname, '../../website/public/image_sitemap.xml');
    if (fs.existsSync(path.dirname(legacyPublic))) {
        fs.writeFileSync(legacyPublic, sitemapContent);
        console.log(`Image sitemap generated at: ${legacyPublic}`);
    } else {
        console.warn('Legacy public folder not found at expected path');
    }
}

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

generateImageSitemap();
