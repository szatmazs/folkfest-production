
async function checkOfficialOembed() {
    const url = 'https://www.youtube.com/playlist?list=PLMcThD4T-bOsWfqC4y6pXosfX7uY54Jv4';
    const oembedUrl = `https://www.youtube.com/oembed?url=${url}&format=json`;

    console.log('Checking Official YouTube oEmbed...');
    try {
        const res = await fetch(oembedUrl);
        if (!res.ok) {
            console.log('Status:', res.status);
            const txt = await res.text();
            console.log('Body:', txt);
        } else {
            const data = await res.json();
            console.log('oEmbed Data:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}

checkOfficialOembed();
