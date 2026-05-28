'use server'

import { uploadImage } from '@/lib/upload'

export async function uploadMedia(formData: FormData) {
    try {
        const files = formData.getAll('file') as File[]
        if (files.length === 0) return { error: 'Nem található fájl' }

        if (files.length === 1) {
            const path = await uploadImage(files[0], 'pages')
            return { path }
        }

        const paths: string[] = []
        for (const file of files) {
            const path = await uploadImage(file, 'pages')
            if (path) paths.push(path)
        }
        
        return { paths }
    } catch (error) {
        console.error('Upload error:', error)
        return { error: 'Hiba a feltöltés során' }
    }
}
