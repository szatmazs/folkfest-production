import { translateText } from '../src/lib/translate'
import * as dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testTranslate() {
    console.log('API KEY from env:', process.env.DEEPL_API_KEY ? 'FOUND' : 'MISSING')
    
    try {
        const result = await translateText('Hírek', 'en')
        console.log('Result for "Hírek":', result)
        if (result === 'Hírek') {
            console.log('FAIL: Translation returned original text.')
        } else {
            console.log('SUCCESS: Translation worked!')
        }
    } catch (e) {
        console.error('CRITICAL ERROR:', e)
    }
}

testTranslate()
