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

const updates = [
    {
        name: "ROGE CAVAILLES SOIN NATUREL TOILETTE INTIME EXTRA-DOUX 500ML",
        description: "Soin de toilette intime Rogé Cavaillès Extra-Doux. Formule naturelle respectueuse des muqueuses sensibles. Flacon pompe économique de 500ml."
    },
    {
        name: "ROGE CAVAILLES SOIN TOILETTE INTIME NATUREL FRAICHEUR 500ML",
        description: "Gel intime fraîcheur Rogé Cavaillès. Technologie libération continue d'extraits rafraîchissants pour un confort toute la journée. 500ml."
    },
    {
        name: "ROGÉ CAVAILLÈS SOIN INTIME MYCOLEA MUQUEUSES IRRITÉES 200 ML",
        description: "Soin intime Mycolea, spécialement conçu pour apaiser les muqueuses irritées et les démangeaisons intimes. Action calmante immédiate. 200ml."
    },
    {
        name: "ROGE CAVAILLES SOIN NATUREL TOILETTE INTIME ANTI BACTÉRIEN 500ML",
        description: "Soin intime antibactérien naturel Rogé Cavaillès. Aide à prévenir les désagréments intimes et protège contre les bactéries. 500ml."
    },
    {
        name: "Control Ribbed 3",
        description: "Préservatifs Control Ribbed avec nervures stimulantes pour des sensations accrues. Lubrifiés et testés électroniquement. Boîte de 3."
    },
    {
        name: "Eubos Lotion Intime 200 ml",
        description: "Lotion lavante intime Eubos, très douce. Nettoie, protège et restaure le film hydrolipidique naturel. Sans savon. 200ml."
    },
    {
        name: "Camomilla Gel Lavant 300ml+ Mini Gel intime + Serviette Avec Trousse",
        description: "Pack Camomilla complet : Gel lavant 300ml, mini gel intime et une serviette offerte dans une trousse pratique. Idéal pour le voyage."
    },
    {
        name: "Bioderma Sebium Mat Control Soin Hydratant 30Ml",
        description: "Bioderma Sébium Mat Control, soin hydratant matifiant longue durée. Lisse le grain de peau et réduit la brillance. Tube de 30ml."
    },
    {
        name: "Rogé Cavaillés soin Toilette intime Extra Doux 100ml",
        description: "Format voyage du soin intime Extra Doux Rogé Cavaillès. Douceur et protection naturelles partout avec vous. 100ml."
    },
    {
        name: "Biosept 5.5 Gel Nettoyant intimeTraitant 200Ml",
        description: "Gel nettoyant intime Biosept pH 5.5. Soin traitant quotidien pour maintenir l'équilibre physiologique de la zone intime. 200ml."
    },
    {
        name: "ROGE CAVAILLES SOIN NATUREL TOILETTE INTIME SÉCHERESSE 100ML",
        description: "Soin intime hydratant Rogé Cavaillès contre la sécheresse. Enrichi en agents surgras pour nourrir et apaiser. Format 100ml."
    },
    {
        name: "Rogé Cavailles Soin Toillette Intime Secheresse 250ml",
        description: "Soin Toilette Intime Spécial Sécheresse Rogé Cavaillès. Hydratation intense et confort pour les muqueuses sèches. 250ml."
    },
    {
        name: "ROGE CAVAILLES SOIN NATUREL TOILETTE INTIME EXTRA-DOUX 250ML",
        description: "Le soin iconique Extra-Doux Rogé Cavaillès en format classique. Nettoie en douceur et protège l'équilibre intime au quotidien. 250ml."
    },
    {
        name: "Rogé Cavaillès Soin Toilette Intime Secheresse 500ml",
        description: "Grand format du soin hydratant Sécheresse Rogé Cavaillès. Confort durable et hydratation des muqueuses. 500ml."
    },
    {
        name: "ROGE CAVAILLES SOIN NATUREL TOILETTE INTIME ANTI BACTÉRIEN 250ML",
        description: "Soin antibactérien Rogé Cavaillès. Protection active contre les irritations et infections mineures. Usage quotidien possible. 250ml."
    },
    {
        name: "Dermalift Phy-Int Gel Lavant hygiène Intime 200 ml",
        description: "Gel lavant hygiène intime Dermalift Phy-Int. Nettoie délicatement et respecte la sensibilité de la zone intime. 200ml."
    },
    {
        name: "ROGE CAVAILLES SOIN NATUREL TOILETTE INTIME PETITE FILLE 250ml",
        description: "Soin intime spécial Petite Fille Rogé Cavaillès. Formule ultra-douce apaisante adaptée aux muqueuses fragiles des enfants."
    },
    {
        name: "ROGE CAVAILLES SOIN TOILETTE INTIME NATUREL FRAICHEUR 250ML",
        description: "Soin intime fraîcheur Rogé Cavaillès. Sensation de bien-être et de propreté immédiate et durable. 250ml."
    },
    {
        name: "ROGE CAVAILLES SOIN NATUREL TOILETTE INTIME ANTI BACTÉRIEN 100ML",
        description: "Format nomade du soin antibactérien Rogé Cavaillès. Protection hygiénique renforcée où que vous soyez. 100ml."
    },
    {
        name: "Camomilla Blu Defence Nettoyant Intime + Gel Lavant Premier Peau",
        description: "Duo Camomilla Blu Defence : Nettoyant intime protecteur et gel lavant doux pour les peaux sensibles."
    },
    {
        name: "Camomilla Blu Lovely Girl Nettoyant Intime + Gel Lavant Premier Peau",
        description: "Kit Camomilla Blu Lovely Girl : Soin intime doux adapté aux jeunes filles et gel lavant respectueux."
    },
    {
        name: "Camomilla Blu Daily Use Nettoyant intime + Gel Lavant Premier Peau mini",
        description: "Set quotidien Camomilla Blu : Nettoyant intime usage fréquent avec mini gel lavant offert."
    },
    {
        name: "Eucerin Ecran Huile Control 50ml+ Avec Miniatures Offertes",
        description: "Protection solaire Eucerin Oil Control SPF 50+. Toucher sec anti-brillance + miniatures offertes pour une routine complète."
    },
    {
        name: "Eliderm Soin Nettoyant intime 250ml",
        description: "Soin nettoyant intime Eliderm. Formule douce pour l'hygiène quotidienne, sans paraben. 250ml."
    },
    {
        name: "ANUA - Heartleaf Pore Control Cleansing Oil - 200ml",
        description: "Huile démaquillante Anua Heartleaf Pore Control. Nettoie les pores en profondeur et élimine les points noirs. 200ml."
    },
    {
        name: "Eucerin Hyaluron-filler jour 50ml + Ecran Huile Controle 50ml Offert",
        description: "Offre Spéciale : Crème de jour Eucerin Hyaluron-Filler anti-âge + Écran solaire Oil Control 50ml OFFERT."
    },
    {
        name: "Camomilla Fleur di camomille 300ml+gel intime ech+serviette trousse",
        description: "Pack Fleur de Camomille nettoyant 300ml, incluant échantillon gel intime et serviette de toilette dans une trousse."
    },
    {
        name: "Camomilla Blu Gel Surgras 300ml + Gel Intime mini + Serviette Trousse",
        description: "Pack Surgras Camomilla Blu 300ml pour peaux sèches + mini gel intime et accessoires de toilette."
    },
    {
        name: "Eviana Forintime Creme Intime 50ml",
        description: "Crème intime Eviana Forintime. Apaise les irritations et hydrate la zone externe. Tube de 50ml."
    },
    {
        name: "NUK Biberon First Choice+ Température Control 150ml 0-6mois",
        description: "Biberon NUK First Choice+ avec indicateur de température. Tétine physiologique silicone 0-6 mois. 150ml."
    },
    {
        name: "NUK Biberon First Choice+ Température Control 300ml 0-6mois",
        description: "Grand biberon NUK First Choice+ (300ml) avec contrôle de température intégré. Idéal pour les repas de bébé 0-6 mois."
    },
    {
        name: "Roselia Pack Intime Eclaircissant",
        description: "Pack complet Roselia pour l'hygiène et l'éclaircissement des zones intimes en douceur. Soin unifiant et nettoyant."
    },
    {
        name: "HYDRALIN Créme Lavante Secheresse Intime",
        description: "Crème lavante Hydralin Spécial Sécheresse. Nettoie et hydrate intensément pour lutter contre l'inconfort intime."
    }
];

async function updateDescriptions() {
    console.log('Starting description updates for new products...');

    for (const item of updates) {
        const { error } = await supabase
            .from('products')
            .update({ description: item.description })
            .eq('name', item.name);

        if (error) {
            console.error(`Failed to update ${item.name}:`, error.message);
        } else {
            console.log(`✅ Updated: ${item.name}`);
        }
    }

    console.log('Done!');
}

updateDescriptions();
