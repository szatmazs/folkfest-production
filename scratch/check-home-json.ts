import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkHome() {
    const home = await prisma.homeSettings.findFirst()
    if (!home) {
        console.log('No home settings.')
        return
    }
    console.log('--- HOME SECTIONS ---')
    if (home.sections) {
        const sections = JSON.parse(home.sections)
        sections.forEach((s: any, i: number) => {
            console.log(`Section ${i}: ${s.title} (${s.titleEn || 'N/A'})`)
            if (s.content) console.log(`  Content: ${s.content.substring(0, 50)}...`)
            if (s.contentEn) console.log(`  ContentEn: ${s.contentEn.substring(0, 50)}...`)
        })
    }
}

checkHome()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
