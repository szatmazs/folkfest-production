import { PrismaClient } from '@prisma/client'
import { translateText } from '../src/lib/translate'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const prisma = new PrismaClient()
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function translateEverything() {
    // 1. Projects
    const projects = await prisma.project.findMany()
    for (const p of projects) {
        console.log(`Translating Project: ${p.title}`)
        const titleEn = await translateText(p.title, 'en')
        const descriptionEn = p.description ? await translateText(p.description, 'en') : null
        // projectData (rich text) → contentEn (EN version of Project Details field)
        const contentEn = p.projectData ? await translateText(p.projectData, 'en') : null
        await prisma.project.update({
            where: { id: p.id },
            data: { titleEn, descriptionEn, contentEn }
        })
        await sleep(1500)
    }

    // 2. Releases — titles are NOT translated (kept in original language)
    // skipped intentionally


    // 3. Videos — titles and descriptions are NOT translated (kept in original language)
    // skipped intentionally


    // 4. Facebook Events
    const events = await prisma.facebookEvent.findMany()
    for (const e of events) {
        console.log(`Translating Facebook Event: ${e.name}`)
        const nameEn = e.name ? await translateText(e.name, 'en') : null
        const descriptionEn = e.description ? await translateText(e.description, 'en') : null
        const placeEn = e.place ? await translateText(e.place, 'en') : null
        await prisma.facebookEvent.update({
            where: { id: e.id },
            data: { nameEn, descriptionEn, placeEn }
        })
        await sleep(1500)
    }
}

translateEverything()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
