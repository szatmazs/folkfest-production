'use server'

import { promises as fs } from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'

const messagesDir = path.join(process.cwd(), 'messages')

export async function getTranslationFiles() {
    const [huRaw, enRaw] = await Promise.all([
        fs.readFile(path.join(messagesDir, 'hu.json'), 'utf-8'),
        fs.readFile(path.join(messagesDir, 'en.json'), 'utf-8'),
    ])
    return {
        hu: JSON.parse(huRaw),
        en: JSON.parse(enRaw),
    }
}

export async function saveTranslationFiles(hu: object, en: object) {
    await Promise.all([
        fs.writeFile(path.join(messagesDir, 'hu.json'), JSON.stringify(hu, null, 2), 'utf-8'),
        fs.writeFile(path.join(messagesDir, 'en.json'), JSON.stringify(en, null, 2), 'utf-8'),
    ])
    revalidatePath('/', 'layout')
    return { success: true }
}
