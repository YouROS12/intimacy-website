import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env manually
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
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Fetch with ANON KEY...');
console.log('URL:', supabaseUrl);
// console.log('Key:', supabaseKey); // Don't log key

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .limit(5);

        if (error) {
            console.error('❌ FETCH ERROR:', error);
        } else {
            console.log(`✅ Success! Fetched ${data.length} products.`);
            if (data.length > 0) {
                console.log('Sample product:', data[0].name);
            } else {
                console.log('⚠️  Data is empty array [] - Implies RLS blocking SELECT or table empty');
            }
        }
    } catch (err) {
        console.error('❌ UNEXPECTED ERROR:', err);
    }
}

testFetch();
