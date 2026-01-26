import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
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

async function deleteFromExcel() {
    try {
        // 1. Read the exact file used for import
        const filePath = path.resolve(__dirname, '../sexual_wellness_missing_only.xlsx');
        console.log(`Reading file: ${filePath}`);

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const products = XLSX.utils.sheet_to_json(worksheet);

        // 2. Extract Names
        const namesToDelete = products.map(p => p.name);
        console.log(`Found ${namesToDelete.length} names in Excel file to remove.`);

        if (namesToDelete.length === 0) {
            console.log("No products found in Excel.");
            return;
        }

        // 3. Delete in batches (Supabase filter limit safety)
        const batchSize = 100;
        for (let i = 0; i < namesToDelete.length; i += batchSize) {
            const batch = namesToDelete.slice(i, i + batchSize);
            console.log(`Deleting batch ${i / batchSize + 1}... (${batch.length} items)`);

            const { error, count } = await supabase
                .from('products')
                .delete()
                .in('name', batch)
                .select(); // selecting returns the rows confirming deletion

            if (error) {
                console.error('Error deleting batch:', error);
            } else {
                console.log(`Deleted ${count !== null ? count : 'entries'} this batch.`); // Note: count might be null if using older supabase-js without preferring count
            }
        }

        console.log("Cleanup complete.");

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

deleteFromExcel();
