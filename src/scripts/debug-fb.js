const fs = require('fs');
const path = require('path');

function loadEnv(filename) {
    try {
        const content = fs.readFileSync(path.resolve(process.cwd(), filename), 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                process.env[key] = value;
            }
        });
    } catch (e) {
        console.log("Could not load " + filename);
    }
}

loadEnv('.env');
loadEnv('.env.local');

const pageId = process.env.FACEBOOK_PAGE_ID;
const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

async function debugFacebook() {
    if (!pageId || !accessToken) {
        console.error("Missing Env Vars");
        return;
    }

    console.log("Fetching posts for Page ID:", pageId);

    const fields = "id,message,created_time,full_picture,permalink_url,likes.summary(true),status_type,attachments{title,description,url,type,media,target}";
    const postsUrl = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=${fields}&access_token=${accessToken}&limit=100`;

    try {
        const res = await fetch(postsUrl);
        const data = await res.json();

        if (data.error) {
            console.error("Facebook API Error:", data.error);
            return;
        }

        const posts = data.data || [];
        console.log(`Fetched ${posts.length} posts.`);

        if (posts.length > 0) {
            console.log("Latest Post:", posts[0]);
            console.log("Oldest Post:", posts[posts.length - 1].created_time);

            // Log Dates of top 5
            console.log("Top 5 dates:");
            posts.slice(0, 5).forEach(p => console.log(`- ${p.created_time} (ID: ${p.id})`));
        }

    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

debugFacebook();
