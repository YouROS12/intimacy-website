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
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixLast() {
    const name = "ROGE CAVAILLES SOIN NATUREL TOILETTE INTIME ANTI BACTÉRIEN 250ML";
    const description = "Soin antibactérien Rogé Cavaillès. Protection active contre les irritations et infections mineures. Usage quotidien possible. 250ml.";

    console.log(`Fixing: ${name}`);
    const { error } = await supabase
        .from('products')
        .update({ description })
        .eq('name', name); // Try exact match first

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Success! (Exact match)");
    }
}

fixLast();
