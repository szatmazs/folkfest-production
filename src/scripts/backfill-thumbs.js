
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Minimal scraping helper since we can't easily import server action in script
async function scrapeThumb(url) {
    try {
        const pageRes = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (pageRes.ok) {
            const html = await pageRes.text();
            const ogImageMatch = html.match(/<meta property="og:image" content="([^"]*)"/);
            if (ogImageMatch?.[1]) return ogImageMatch[1];
        }

        // Fallback noembed
        const oembedRes = await fetch(`https://noembed.com/embed?url=${url}`);
        const data = await oembedRes.json();
        if (data.thumbnail_url) return data.thumbnail_url;

    } catch (e) {
        console.error(e);
    }
    return null;
}

async function backfillThumbs() {
    const videos = await prisma.video.findMany();
    console.log(`Processing ${videos.length} videos...`);

    for (const v of videos) {
        console.log(`Checking ${v.title}...`);
        if (v.thumbnailUrl) {
            console.log('Skipping, already has thumb.');
            continue;
        }

        const thumb = await scrapeThumb(v.videoUrl);
        if (thumb) {
            console.log(`Found thumb: ${thumb}`);
            await prisma.video.update({
                where: { id: v.id },
                data: { thumbnailUrl: thumb }
            });
        } else {
            console.log('No thumb found.');
        }
    }
    console.log('Done.');
}

backfillThumbs()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
