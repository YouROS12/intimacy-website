import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getEnvVars() {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envFile.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim().replace(/['"]/g, '');
                env[key] = value;
            }
        });
        return env;
    } catch (error) {
        return process.env;
    }
}

const env = getEnvVars();
const supabaseUrl = env.VITE_SUPABASE_URL;
// Use service role key to ensure we can read everything and update later if needed
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findMissingDescriptions() {
    const { data, error } = await supabase
        .from('products')
        .select('id, name, description')
        .or('description.is.null,description.eq.""');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(`Found ${data.length} products with missing descriptions:`);
    console.log(JSON.stringify(data, null, 2));
}

findMissingDescriptions();
