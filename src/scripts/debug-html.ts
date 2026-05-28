import * as fs from 'fs';

async function main() {
    const url = "https://artists.landr.com/800739242050";
    console.log(`Fetching ${url}...`);
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
        }
    });
    const html = await response.text();
    fs.writeFileSync('landr-debug.html', html);
    console.log("HTML saved to landr-debug.html");
}

main();
