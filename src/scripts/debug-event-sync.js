
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

async function debugEventSync() {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!pageId || !accessToken) {
        console.error('Missing env vars');
        return;
    }

    const fields = "id,message,created_time,attachments{title,description,url,type,media,target{id,url}}";
    const url = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=${fields}&access_token=${accessToken}&limit=10`;

    console.log('Fetching posts...');
    const res = await fetch(url);
    const data = await res.json();

    if (!data.data) {
        console.log('No data found', data);
        return;
    }

    for (const post of data.data) {
        const attach = post.attachments?.data?.[0];
        if (attach) {
            console.log(`\nPost ${post.id} (${post.created_time})`);
            console.log(`Type: ${attach.type}`);
            console.log(`Title: ${attach.title}`);
            console.log(`Desc: ${attach.description}`);
            console.log(`Target ID: ${attach.target?.id}`);

            if (attach.target?.id) {
                console.log(`Fetching event details for ${attach.target.id}...`);
                const eventRes = await fetch(`https://graph.facebook.com/v19.0/${attach.target.id}?fields=description&access_token=${accessToken}`);
                const eventData = await eventRes.json();
                console.log('Event Data:', JSON.stringify(eventData, null, 2));
            }
        }
    }
}

debugEventSync();
