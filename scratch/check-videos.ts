import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkVideos() {
    const videos = await prisma.video.findMany()
    console.log('--- VIDEOS ---')
    videos.forEach(v => {
        console.log(`- ${v.title} (${v.titleEn || 'N/A'})`)
    })
}

checkVideos()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
