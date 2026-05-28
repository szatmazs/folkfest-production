
async function checkOembed() {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll for testing
    const oembedUrl = `https://noembed.com/embed?url=${url}`;

    console.log('Checking oEmbed...');
    const res = await fetch(oembedUrl);
    const data = await res.json();
    console.log('oEmbed Data:', JSON.stringify(data, null, 2));

    console.log('Checking Meta Tags...');
    const pageRes = await fetch(url);
    const html = await pageRes.text();

    const titleMatch = html.match(/<meta name="title" content="(.*?)">/);
    const descMatch = html.match(/<meta name="description" content="(.*?)">/);
    const ogDescMatch = html.match(/<meta property="og:description" content="(.*?)">/);

    console.log('Meta Title:', titleMatch ? titleMatch[1] : 'Not found');
    console.log('Meta Desc:', descMatch ? descMatch[1] : 'Not found');
    console.log('OG Desc:', ogDescMatch ? ogDescMatch[1] : 'Not found');
}

checkOembed();
