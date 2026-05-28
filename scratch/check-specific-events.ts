import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSpecificEvents() {
    const events = await prisma.facebookEvent.findMany({
        where: { name: { contains: 'Somló FolkFest' } }
    })
    console.log(`--- SPECIFIC EVENTS: ${events.length} ---`)
    events.forEach(e => {
        console.log(`- ID: ${e.id}`)
        console.log(`  Name: ${e.name}`)
        console.log(`  NameEn: ${e.nameEn || 'N/A'}`)
        console.log(`  DescriptionEn: ${e.descriptionEn ? 'Exists' : 'N/A'}`)
    })
}

checkSpecificEvents()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
