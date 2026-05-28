
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restorePlaylist() {
    const url = 'https://www.youtube.com/playlist?list=PLnDE7yx0FeTBzvaRWS9YCWqn-akbqn3n0';
    const title = 'Mihó Attila és barátai // Útfélen // 2022';

    // Scrape thumb again
    let thumb = null;
    try {
        const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await pageRes.text();
        const m = html.match(/<meta property="og:image" content="([^"]*)"/);
        if (m?.[1]) thumb = m[1];
    } catch (e) { console.error(e); }

    console.log(`Re-creating playlist video... Thumb: ${thumb}`);

    await prisma.video.create({
        data: {
            title,
            videoUrl: url,
            thumbnailUrl: thumb,
            publishedAt: new Date(), // Now
        }
    });

    console.log('Restored.');
}

restorePlaylist()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
