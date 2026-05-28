import { NextResponse } from 'next/server';
import { uploadImage } from '@/lib/upload';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const files = formData.getAll('file') as File[];
        
        if (files.length === 0) {
            return NextResponse.json({ error: 'Nem található fájl' }, { status: 400 });
        }

        const paths: string[] = [];
        for (const file of files) {
            const path = await uploadImage(file, 'pages');
            if (path) paths.push(path);
        }

        if (paths.length === 1 && files.length === 1) {
            return NextResponse.json({ path: paths[0] });
        }

        return NextResponse.json({ paths });
    } catch (error) {
        console.error('API Upload error:', error);
        return NextResponse.json({ error: 'Hiba a feltöltés során' }, { status: 500 });
    }
}
