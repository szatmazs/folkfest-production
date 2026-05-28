import fs from 'fs/promises';
import path from 'path';

export async function downloadFacebookImage(url: string, id: string, subfolder: string): Promise<string | null> {
    if (!url) return null;

    try {
        const publicDir = path.join(process.cwd(), 'public');
        const uploadDir = path.join(publicDir, 'uploads', subfolder);

        // Ensure dir exists
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
        }

        // Determine extension, default to .jpg
        // Facebook URLs: .../something.jpg?stp=...
        let extension = '.jpg';
        if (url.includes('.png')) extension = '.png';

        const filename = `${id}${extension}`;
        const filepath = path.join(uploadDir, filename);
        const relativePath = `/uploads/${subfolder}/${filename}`;

        // Check if exists
        try {
            await fs.access(filepath);
            return relativePath;
        } catch {
            // File doesn't exist, proceed to download
        }

        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Failed to fetch image: ${res.statusText} (${url})`);
            return null;
        }

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await fs.writeFile(filepath, buffer);

        return relativePath;
    } catch (error) {
        console.error(`Error downloading image for ${id}:`, error);
        return null;
    }
}
