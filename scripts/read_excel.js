import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function readExcel() {
    try {
        const filePath = path.resolve(__dirname, '../sexual_wellness_products_v4.xlsx');
        // Read the file
        const workbook = XLSX.readFile(filePath);
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Convert to JSON
        const data = XLSX.utils.sheet_to_json(worksheet);

        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error reading excel file:', error);
    }
}

readExcel();
