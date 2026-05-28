import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkEvents() {
    const events = await prisma.facebookEvent.findMany()
    console.log('--- EVENTS ---')
    events.forEach(e => {
        console.log(`- ${e.name} (${e.nameEn || 'N/A'})`)
    })
}

checkEvents()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
