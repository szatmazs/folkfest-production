import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    
    // Resolve the path to the physical public/uploads directory
    const filePath = join(process.cwd(), 'public', 'uploads', ...pathSegments);
    
    // Read the file from disk dynamically
    const fileBuffer = await readFile(filePath);
    
    // Determine the content-type based on the extension
    const filename = pathSegments[pathSegments.length - 1];
    const ext = filename.split('.').pop()?.toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (ext === 'png') contentType = 'image/png';
    else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    else if (ext === 'gif') contentType = 'image/gif';
    else if (ext === 'svg') contentType = 'image/svg+xml';
    else if (ext === 'webp') contentType = 'image/webp';
    else if (ext === 'avif') contentType = 'image/avif';
    
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('[Uploads Route] Dynamic file serving failed:', error.message || error);
    return new Response('File Not Found', { status: 404 });
  }
}
