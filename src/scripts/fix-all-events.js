
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

async function fixAllEvents() {
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    if (!accessToken) {
        console.error('Missing Access Token');
        return;
    }

    console.log('Fetching all posts from DB...');
    const posts = await prisma.facebookPost.findMany();
    console.log(`Found ${posts.length} posts.`);

    let updatedCount = 0;

    for (const post of posts) {
        if (!post.attachments) continue;

        let attachments;
        try {
            attachments = JSON.parse(post.attachments);
        } catch (e) {
            continue;
        }

        const first = attachments.data?.[0];
        if (!first || !first.target || !first.target.id) continue;

        // Check if it looks like an event needing fixing
        // Valid types: event, native_templates
        // Or just if it has target.id and we suspect it's an event share
        if (first.type !== 'event' && first.type !== 'native_templates') continue;

        console.log(`Checking post ${post.id} (Target: ${first.target.id})...`);

        try {
            const res = await fetch(`https://graph.facebook.com/v19.0/${first.target.id}?fields=description&access_token=${accessToken}`, { cache: 'no-store' });
            if (!res.ok) {
                console.error(`  Failed to fetch event ${first.target.id}: ${res.status}`);
                continue;
            }

            const eventData = await res.json();
            if (eventData.description) {
                // Check if different
                if (first.description !== eventData.description) {
                    console.log(`  Updating description for ${post.id}...`);
                    console.log(`  Old: ${first.description ? first.description.substring(0, 30) : 'none'}...`);
                    console.log(`  New: ${eventData.description.substring(0, 30)}...`);

                    first.description = eventData.description;

                    await prisma.facebookPost.update({
                        where: { id: post.id },
                        data: {
                            attachments: JSON.stringify(attachments)
                        }
                    });
                    updatedCount++;
                } else {
                    console.log(`  Description already up to date.`);
                }
            } else {
                console.log(`  No description found for event.`);
            }
        } catch (e) {
            console.error(`  Error processing ${post.id}:`, e.message);
        }
    }

    console.log(`Done. Updated ${updatedCount} posts.`);
}

fixAllEvents()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
