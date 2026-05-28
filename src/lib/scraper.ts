import * as cheerio from 'cheerio';

export interface ScrapedReleaseData {
    artist: string;
    title: string;
    year: number;
    coverUrl: string;
    tracklist: string[];
    streamingLinks: Record<string, string>;
}

export async function scrapeLandrRelease(url: string): Promise<ScrapedReleaseData | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
            return null;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // 1. Meta Data (OG Tags)
        const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text();
        let ogImage = $('meta[property="og:image"]').attr('content') || "";

        // Fix Cover Image Resolution/Crop
        if (ogImage && ogImage.includes('artwork-')) {
            ogImage = ogImage.replace(/artwork-\d+x\d+\.(jpg|jpeg|png)/, 'artwork-440x440.$1');
        }

        // Parse Title/Artist
        let artist = "Unknown Artist";
        let title = "Unknown Title";
        if (ogTitle) {
            if (ogTitle.includes(" - Album by ")) {
                const parts = ogTitle.split(" - Album by ");
                title = parts[0].trim();
                artist = parts[1].replace(/ \|.*/, "").trim();
            } else if (ogTitle.includes(" by ")) {
                const parts = ogTitle.split(" by ");
                title = parts[0].trim();
                artist = parts[1].replace(/ \|.*/, "").trim();
            } else {
                title = ogTitle;
            }
        }

        // 2. Year
        let year = new Date().getFullYear();
        const yearMatch = html.match(/\b(20\d{2}|19\d{2})\b/);
        if (yearMatch) {
            year = parseInt(yearMatch[0]);
        }

        // 3. Tracklist from Script
        const tracks: string[] = [];

        $('script').each((i, el) => {
            const content = $(el).html();
            if (content && (content.includes('window.linkfire') || content.includes('tracks:'))) {
                const match = content.match(/tracks:\s*(\[[\s\S]*?\]),/);
                if (match && match[1]) {
                    try {
                        const tracksJson = match[1];
                        // Match "track": "Title" (most common on linkfire) or "name"/"title"
                        const propertyMatch = tracksJson.matchAll(/"?(name|title|track)"?\s*:\s*"([^"]+)"/g);
                        for (const m of propertyMatch) {
                            let val = m[2];
                            try {
                                // Unescape unicode like \u00e1
                                val = JSON.parse(`"${val}"`);
                            } catch (e) { }

                            if (!tracks.includes(val)) {
                                tracks.push(val);
                            }
                        }
                    } catch (e) {
                        console.error("Error parsing tracklist script", e);
                    }
                }
            }
        });

        // 4. Streaming Links
        const streamingLinks: Record<string, string> = {};
        $('a').each((_, el) => {
            const link = $(el).attr('href');
            const ariaLabel = $(el).attr('aria-label')?.toLowerCase() || "";
            const text = $(el).text().toLowerCase();

            if (!link || link.startsWith('#') || link.startsWith('/')) return;

            if (link.includes('spotify') || ariaLabel.includes('spotify')) {
                streamingLinks.spotify = link;
            } else if (link.includes('apple') || link.includes('itunes') || ariaLabel.includes('apple')) {
                streamingLinks.apple = link;
            } else if (link.includes('youtu') || ariaLabel.includes('youtube')) {
                streamingLinks.youtube = link;
            } else if (link.includes('deezer') || ariaLabel.includes('deezer')) {
                streamingLinks.deezer = link;
            } else if (link.includes('tidal') || ariaLabel.includes('tidal')) {
                streamingLinks.tidal = link;
            } else if (link.includes('amazon') || ariaLabel.includes('amazon')) {
                streamingLinks.amazon = link;
            }
        });

        return {
            artist,
            title,
            year,
            coverUrl: ogImage,
            tracklist: tracks,
            streamingLinks
        };

    } catch (error) {
        console.error("Scraper error:", error);
        return null;
    }
}
