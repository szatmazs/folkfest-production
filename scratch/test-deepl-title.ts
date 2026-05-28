import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testTranslate(text: string) {
    const deeplKey = process.env.DEEPL_API_KEY;
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
            'Authorization': `DeepL-Auth-Key ${deeplKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            text,
            target_lang: 'EN-US',
        }),
    });
    const data = await response.json();
    console.log(`Input: ${text}`)
    console.log(`Output: ${data.translations[0].text}`)
}

async function run() {
    await testTranslate('VI. Somló FolkFest')
    await testTranslate('Somló FolkFest V. // Vujicsics 50, Batyu-Borbély Duó')
}

run().catch(console.error)
