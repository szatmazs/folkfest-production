import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 1920;

async function walk(dir: string): Promise<string[]> {
    let files: string[] = [];
    const list = await fs.promises.readdir(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = await fs.promises.stat(fullPath);
        if (stat && stat.isDirectory()) {
            files = files.concat(await walk(fullPath));
        } else {
            files.push(fullPath);
        }
    }
    return files;
}

async function resizeImage(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return;

    try {
        const metadata = await sharp(filePath).metadata();
        if (!metadata.width || !metadata.height) return;

        if (metadata.width > MAX_SIZE || metadata.height > MAX_SIZE) {
            console.log(`Resizing: ${filePath} (${metadata.width}x${metadata.height})`);
            const buffer = await sharp(filePath)
                .resize(MAX_SIZE, MAX_SIZE, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toBuffer();
            
            await fs.promises.writeFile(filePath, buffer);
            console.log(`Done: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
}

async function main() {
    console.log('Starting image resize process...');
    const allFiles = await walk(UPLOADS_DIR);
    console.log(`Found ${allFiles.length} files. Processing...`);

    for (const file of allFiles) {
        await resizeImage(file);
    }
    console.log('Resize process finished.');
}

main().catch(console.error);
