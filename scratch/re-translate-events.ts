import { PrismaClient } from '@prisma/client'
import { translateText } from '../src/lib/translate'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const prisma = new PrismaClient()

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function reTranslateEvents() {
    console.log('Fetching events to re-translate...')
    const events = await prisma.facebookEvent.findMany()
    
    let count = 0
    for (const event of events) {
        await sleep(500); // 0.5s delay to avoid 429
        // Force re-translate even if already translated, to apply the new ordinal logic
        console.log(`Translating event: ${event.name}`)
        try {
            const nameEn = await translateText(event.name, 'en')
            const descriptionEn = event.description ? await translateText(event.description, 'en') : null
            const placeEn = event.place ? await translateText(event.place, 'en') : null
            
            await prisma.facebookEvent.update({
                where: { id: event.id },
                data: {
                    nameEn,
                    descriptionEn,
                    placeEn
                }
            })
            console.log(`  -> ${nameEn}`)
            count++
        } catch (e) {
            console.error(`  Failed: ${e}`)
        }
    }
    console.log(`Done! Re-translated ${count} events.`)
}

reTranslateEvents()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
