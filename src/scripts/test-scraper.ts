import { scrapeLandrRelease } from "../lib/scraper";

async function main() {
    const url = "https://artists.landr.com/800739242050";
    console.log(`Scraping ${url}...`);
    const data = await scrapeLandrRelease(url);
    console.log("Result:", JSON.stringify(data, null, 2));
}

main();
