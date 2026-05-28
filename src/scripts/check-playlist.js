
async function checkPlaylist() {
    // A sample playlist URL (YouTube's own "Popular Music Videos")
    // Or a random one found online if that fails.
    const url = 'https://www.youtube.com/playlist?list=PLMcThD4T-bOsWfqC4y6pXosfX7uY54Jv4';
    const oembedUrl = `https://noembed.com/embed?url=${url}`;

    console.log('Checking oEmbed for Playlist...');
    try {
        const res = await fetch(oembedUrl);
        const data = await res.json();
        console.log('oEmbed Data:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }

    console.log('Checking Meta Tags...');
    try {
        const pageRes = await fetch(url);
        const html = await pageRes.text();

        const titleMatch = html.match(/<meta property="og:title" content="(.*?)">/);
        const descMatch = html.match(/<meta property="og:description" content="(.*?)">/);

        console.log('Meta Title:', titleMatch ? titleMatch[1] : 'Not found');
        console.log('Meta Desc:', descMatch ? descMatch[1] : 'Not found');
    } catch (e) {
        console.error(e);
    }
}

checkPlaylist();
