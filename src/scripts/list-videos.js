
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listVideos() {
    const videos = await prisma.video.findMany({
        orderBy: { publishedAt: 'desc' }
    });

    console.log(`Found ${videos.length} videos.`);
    videos.forEach((v, i) => {
        console.log(`[${i}] Title: ${v.title}`);
        console.log(`    URL: ${v.videoUrl}`);
    });
}

listVideos()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
