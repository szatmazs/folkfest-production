
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVideos() {
    console.log('Checking videos in DB...');
    const videos = await prisma.video.findMany();

    videos.forEach(v => {
        console.log(`\nID: ${v.id}`);
        console.log(`Title: ${v.title}`);
        console.log(`URL: ${v.videoUrl}`);
        console.log(`Thumbnail: ${v.thumbnailUrl || 'NULL'}`);
    });
}

checkVideos()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
