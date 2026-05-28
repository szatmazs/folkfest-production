import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function uploadImage(file: File, folder: string): Promise<string | null> {
    if (!file || file.size === 0) {
        console.log('[Upload] No file or empty file provided.');
        return null;
    }

    try {
        const bytes = await file.arrayBuffer();
        let buffer: any = Buffer.from(bytes);

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
            } catch (error: any) {
                console.error('[Upload] Sharp resize error (falling back to original buffer):', error.message || error);
            }
        }

        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = file.name.split('.').pop() || 'png';
        const filename = `${uniqueSuffix}.${ext}`;

        // Ensure directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
        console.log('[Upload] Target upload directory:', uploadDir);
        
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e: any) {
            console.warn('[Upload] Mkdir warning (ignored if directory exists):', e.message || e);
        }

        const relativePath = `/uploads/${folder}/${filename}`;
        const fullPath = join(uploadDir, filename);

        console.log('[Upload] Writing file to:', fullPath);
        await writeFile(fullPath, buffer);
        console.log('[Upload] File written successfully! Path:', relativePath);
        
        return relativePath;
    } catch (globalError: any) {
        console.error('[Upload] Critical upload error:', globalError.message || globalError);
        return null;
    }
}
