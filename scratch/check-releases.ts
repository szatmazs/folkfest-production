import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkReleases() {
    const releases = await prisma.release.findMany()
    console.log('--- RELEASES ---')
    releases.forEach(r => {
        console.log(`- ${r.title} (${r.titleEn || 'N/A'})`)
    })
}

checkReleases()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
