
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually since we are running a standalone script
const dotenv = require('fs').readFileSync('.env.local', 'utf-8');
const env = dotenv.split('\n').reduce((acc, line) => {
    const [key, val] = line.split('=');
    if (key && val) acc[key.trim()] = val.trim();
    return acc;
}, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateImages() {
    console.log('Starting migration...');

    // 1. Fetch products with lacdp.ma images
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, image_url')
        .ilike('image_url', '%lacdp.ma%');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(`Found ${products.length} products to migrate.`);

    // 1.5 Ensure bucket exists
    const { data: bucket, error: bucketError } = await supabase
        .storage
        .getBucket('products');

    if (bucketError && bucketError.message.includes('not found')) {
        console.log("Creating 'products' bucket...");
        const { error: createError } = await supabase.storage.createBucket('products', { public: true });
        if (createError) {
            console.error('Failed to create bucket:', createError);
            return;
        }
    } else if (bucketError) {
        console.error('Error checking bucket:', bucketError);
        return;
    }

    for (const product of products) {
        try {
            const oldUrl = product.image_url;
            const ext = path.extname(oldUrl) || '.jpg';
            // Create a clean filename from product name + random string to avoid cache/collisions
            const cleanName = product.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            const filename = `${cleanName}-${Date.now().toString().slice(-4)}${ext}`;

            console.log(`Migrating: ${product.name} (${filename})...`);

            // 2. Download Image
            const response = await fetch(oldUrl);
            if (!response.ok) throw new Error(`Failed to fetch ${oldUrl}: ${response.statusText}`);
            const buffer = await response.arrayBuffer();

            // 3. Upload to Supabase Storage (Bucket: 'products')
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('products')
                .upload(filename, buffer, {
                    contentType: response.headers.get('content-type') || 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

            // 4. Get Public URL
            const { data: { publicUrl } } = supabase
                .storage
                .from('products')
                .getPublicUrl(filename);

            // 5. Update Database
            const { error: updateError } = await supabase
                .from('products')
                .update({ image_url: publicUrl })
                .eq('id', product.id);

            if (updateError) throw new Error(`DB Update failed: ${updateError.message}`);

            console.log(`✓ Success: ${product.name}`);

        } catch (err) {
            console.error(`✗ Failed ${product.name}:`, err.message);
        }
    }

    console.log('Migration complete.');
}

migrateImages();
