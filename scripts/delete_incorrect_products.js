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

const productsToRemove = [
    "ROGE CAVAILLES SOIN NATUREL TOILETTE INTIME EXTRA-DOUX 500ML",
    "ROGE CAVAILLES SOIN TOILETTE INTIME NATUREL FRAICHEUR 500ML",
    "ROGÉ CAVAILLÈS SOIN INTIME MYCOLEA MUQUEUSES IRRITÉES 200 ML",
    "ROGE CAVAILLES SOIN NATUREL TOILETTE INTIME ANTI BACTÉRIEN 500ML",
    "Control Ribbed 3",
    "Eubos Lotion Intime 200 ml",
    "Camomilla Gel Lavant 300ml+ Mini Gel intime + Serviette Avec Trousse",
    "Bioderma Sebium Mat Control Soin Hydratant 30Ml",
    "Rogé Cavaillés soin Toilette intime Extra Doux 100ml",
    "Biosept 5.5 Gel Nettoyant intimeTraitant 200Ml",
    "ROGE CAVAILLES SOIN NATUREL TOILETTE INTIME SÉCHERESSE 100ML",
    "Rogé Cavailles Soin Toillette Intime Secheresse 250ml",
    "ROGE CAVAILLES SOIN NATUREL TOILETTE INTIME EXTRA-DOUX 250ML",
    "Rogé Cavaillès Soin Toilette Intime Secheresse 500ml",
    "ROGE CAVAILLES SOIN NATUREL TOILETTE INTIME ANTI BACTÉRIEN 250ML",
    "Dermalift Phy-Int Gel Lavant hygiène Intime 200 ml",
    "ROGE CAVAILLES SOIN NATUREL TOILETTE INTIME PETITE FILLE 250ml",
    "ROGE CAVAILLES SOIN TOILETTE INTIME NATUREL FRAICHEUR 250ML",
    "ROGE CAVAILLES SOIN NATUREL TOILETTE INTIME ANTI BACTÉRIEN 100ML",
    "Camomilla Blu Defence Nettoyant Intime + Gel Lavant Premier Peau",
    "Camomilla Blu Lovely Girl Nettoyant Intime + Gel Lavant Premier Peau",
    "Camomilla Blu Daily Use Nettoyant intime + Gel Lavant Premier Peau mini",
    "Eucerin Ecran Huile Control 50ml+ Avec Miniatures Offertes",
    "Eliderm Soin Nettoyant intime 250ml",
    "ANUA - Heartleaf Pore Control Cleansing Oil - 200ml",
    "Eucerin Hyaluron-filler jour 50ml + Ecran Huile Controle 50ml Offert",
    "Camomilla Fleur di camomille 300ml+gel intime ech+serviette trousse",
    "Camomilla Blu Gel Surgras 300ml + Gel Intime mini + Serviette Trousse",
    "Eviana Forintime Creme Intime 50ml",
    "NUK Biberon First Choice+ Température Control 150ml 0-6mois",
    "NUK Biberon First Choice+ Température Control 300ml 0-6mois",
    "Roselia Pack Intime Eclaircissant",
    "HYDRALIN Créme Lavante Secheresse Intime"
];

async function deleteProducts() {
    console.log(`Attempting to delete ${productsToRemove.length} products...`);

    const { error, count } = await supabase
        .from('products')
        .delete()
        .in('name', productsToRemove);

    if (error) {
        console.error('Delete Error:', error);
    } else {
        console.log('Success! Deleted products.');
    }
}

deleteProducts();
