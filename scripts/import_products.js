import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple .env parser since we can't rely on dotenv being installed
function getEnvVars() {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envFile.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim().replace(/['"]/g, ''); // Remove quotes
                env[key] = value;
            }
        });
        return env;
    } catch (error) {
        console.warn('Could not read .env file, checking process.env');
        return process.env;
    }
}

const env = getEnvVars();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY missing. Import might fail due to RLS.');
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function importProducts() {
    console.log('Starting product import...');

    try {
        const filePath = path.resolve(__dirname, '../sexual_wellness_missing_only.xlsx');
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const products = XLSX.utils.sheet_to_json(worksheet);

        console.log(`Found ${products.length} products in Excel file.`);

        // Map Excel data to Supabase schema
        const mappedProducts = products.map((p) => ({
            name: p.name,
            description: p.description,
            price: p.price,
            // Map 'Condoms' to 'Condoms' to match our new enum, fallback to existing if needed
            category: p.category,
            image_url: p.imageUrl, // Map imageUrl to image_url
            stock: p.stock || 0,
            features: p.features ? p.features.split(',') : [], // Assume features might be comma separated or empty
        }));

        // In a real production scenario, we might want to upsert based on a unique field (like name or SKU if we had it)
        // For now, let's try to insert. 

        // First, verify the current data to see if we should clean up or just append?
        // User didn't specify, but "import" usually implies adding.

        // Check for existing products to avoid duplicates
        const { data: existingProducts } = await supabase
            .from('products')
            .select('name');

        const existingNames = new Set(existingProducts?.map(p => p.name) || []);

        const newProducts = mappedProducts.filter(p => !existingNames.has(p.name));

        if (newProducts.length === 0) {
            console.log('No new products to import.');
            return;
        }

        console.log(`Importing ${newProducts.length} new products...`);

        const { data, error } = await supabase
            .from('products')
            .insert(newProducts)
            .select();

        if (error) {
            console.error('Error during import:', error);
        } else {
            console.log(`Successfully imported ${data?.length} products!`);
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

importProducts();
