const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadImage() {
    try {
        const imagePath = '../pics/durex_ready_2.png';
        const file = fs.readFileSync(imagePath);

        console.log('Uploading image...');
        const { data, error } = await supabase.storage
            .from('product-images')
            .upload('durex_performax_hero.png', file, {
                contentType: 'image/png',
                upsert: true
            });

        if (error) {
            console.error('Upload error:', error);
            process.exit(1);
        }

        console.log('Upload success:', data);

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl('durex_performax_hero.png');

        console.log('\n✅ Image uploaded successfully!');
        console.log('📎 Public URL:', publicUrl);

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

uploadImage();
