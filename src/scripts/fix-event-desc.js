
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envLocal = path.resolve(__dirname, '../../.env.local');
if (fs.existsSync(envLocal)) {
    const envConfig = dotenv.parse(fs.readFileSync(envLocal));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function fixEventDesc() {
    const postId = '106971394411813_818886163988261'; // The event post
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    console.log(`Fixing post ${postId}...`);

    const post = await prisma.facebookPost.findUnique({ where: { id: postId } });
    if (!post) {
        console.error('Post not found in DB');
        return;
    }

    if (!post.attachments) {
        console.error('No attachments in post');
        return;
    }

    const attachments = JSON.parse(post.attachments);
    const first = attachments.data?.[0];

    if (!first?.target?.id) {
        console.error('No target ID in attachment');
        return;
    }

    console.log(`Fetching event ${first.target.id} from Facebook...`);
    const res = await fetch(`https://graph.facebook.com/v19.0/${first.target.id}?fields=description&access_token=${accessToken}`, { cache: 'no-store' });

    if (!res.ok) {
        console.error('Failed to fetch event:', res.status, res.statusText);
        const txt = await res.text();
        console.error(txt);
        return;
    }

    const eventData = await res.json();
    if (!eventData.description) {
        console.error('No description in event data');
        console.log(eventData);
        return;
    }

    console.log('New Description:', eventData.description.substring(0, 50) + '...');

    // Update attachments
    attachments.data[0].description = eventData.description;

    // Save to DB
    console.log('Updating DB...');
    await prisma.facebookPost.update({
        where: { id: postId },
        data: {
            attachments: JSON.stringify(attachments)
        }
    });

    console.log('Done.');
}

fixEventDesc()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
