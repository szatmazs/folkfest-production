import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
    ['image/jpeg', 'jpg'],
    ['image/png', 'png'],
    ['image/webp', 'webp'],
    ['image/gif', 'gif'],
]);

export async function uploadImage(file: File, folder: string): Promise<string | null> {
    if (!file || file.size === 0) {
        console.log('[Upload] No file or empty file provided.');
        return null;
    }

    if (file.size > MAX_UPLOAD_SIZE || !ALLOWED_TYPES.has(file.type)) {
        console.warn('[Upload] Rejected file:', file.name, file.type, file.size);
        return null;
    }
    if (!/^[a-z0-9_-]+$/i.test(folder)) return null;

    try {
        const bytes = await file.arrayBuffer();
        let buffer: Buffer = Buffer.from(bytes);

        // Resize image if it's an image and too large
        if (file.type.startsWith('image/')) {
            try {
                // Dynamically import sharp to prevent crashes if sharp binaries are missing/broken on the server
                const sharp = (await import('sharp')).default;
                buffer = await sharp(buffer)
                    .resize(1920, 1920, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .toBuffer();
                console.log('[Upload] Image successfully resized using sharp.');
            } catch (error: unknown) {
                console.error('[Upload] Invalid image data:', error instanceof Error ? error.message : error);
                return null;
            }
        }

        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = ALLOWED_TYPES.get(file.type)!;
        const filename = `${uniqueSuffix}.${ext}`;

        // Ensure directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
        console.log('[Upload] Target upload directory:', uploadDir);
        
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e: unknown) {
            console.warn('[Upload] Mkdir warning (ignored if directory exists):', e instanceof Error ? e.message : e);
        }

        const relativePath = `/uploads/${folder}/${filename}`;
        const fullPath = join(uploadDir, filename);

        console.log('[Upload] Writing file to:', fullPath);
        await writeFile(fullPath, buffer);
        console.log('[Upload] File written successfully! Path:', relativePath);
        
        return relativePath;
    } catch (globalError: unknown) {
        console.error('[Upload] Critical upload error:', globalError instanceof Error ? globalError.message : globalError);
        return null;
    }
}
