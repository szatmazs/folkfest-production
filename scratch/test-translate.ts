import { translateText } from '../src/lib/translate';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function run() {
    console.log('API Key:', process.env.DEEPL_API_KEY);
    try {
        console.log('Testing translation of plain text...');
        const res = await translateText('Ez egy teszt fordítás.', 'en');
        console.log('Result:', res);

        console.log('\nTesting translation of JSON blocks...');
        const jsonBlocks = JSON.stringify([
            { type: 'text', content: 'Szia világ!' },
            { type: 'text', content: 'Ez egy másik blokk.' }
        ]);
        const resJson = await translateText(jsonBlocks, 'en');
        console.log('Result JSON:', resJson);
    } catch (e) {
        console.error('Test failed with error:', e);
    }
}

run();
