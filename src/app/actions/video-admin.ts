'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getVideos() {
    return await prisma.video.findMany({
        orderBy: { publishedAt: 'desc' },
    })
}

import { translateText } from '@/lib/translate'

export async function autoTranslateVideoAction(text: string) {
    return await translateText(text, 'en')
}

export async function createVideo(formData: FormData) {
    const title = formData.get('title') as string
    let titleEn = formData.get('titleEn') as string
    const videoUrl = formData.get('videoUrl') as string
    const description = formData.get('description') as string
    let descriptionEn = formData.get('descriptionEn') as string

    if (!title || !videoUrl) {
        return { error: 'Cím és Videó URL kötelező!' }
    }

    // Auto-translate if missing
    if (!titleEn && title) titleEn = await translateText(title, 'en')
    if (!descriptionEn && description) descriptionEn = await translateText(description, 'en')

    // Auto-fetch thumbnail if possible
    let thumbnailUrl = null
    try {
        const meta = await getVideoMetadata(videoUrl)
        if (meta.thumbnail) thumbnailUrl = meta.thumbnail
    } catch { }

    await prisma.video.create({
        data: {
            title,
            titleEn: titleEn || null,
            videoUrl,
            description,
            descriptionEn: descriptionEn || null,
            thumbnailUrl
        },
    })

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function updateVideo(id: string, formData: FormData) {
    const title = formData.get('title') as string
    let titleEn = formData.get('titleEn') as string
    const videoUrl = formData.get('videoUrl') as string
    const description = formData.get('description') as string
    let descriptionEn = formData.get('descriptionEn') as string

    // Auto-translate if missing
    if (!titleEn && title) titleEn = await translateText(title, 'en')
    if (!descriptionEn && description) descriptionEn = await translateText(description, 'en')

    // Auto-fetch thumb if url changed or missing? 
    let thumbnailUrl = undefined
    try {
        const meta = await getVideoMetadata(videoUrl)
        if (meta.thumbnail) thumbnailUrl = meta.thumbnail
    } catch { }

    await prisma.video.update({
        where: { id },
        data: {
            title,
            titleEn: titleEn || null,
            videoUrl,
            description,
            descriptionEn: descriptionEn || null,
            ...(thumbnailUrl ? { thumbnailUrl } : {})
        },
    })

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function deleteVideo(id: string) {
    try {
        await prisma.video.delete({
            where: { id },
        })
        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error: any) {
        console.error("Error deleting video:", error)
        return { success: false, error: error.message }
    }
}

export async function getVideoMetadata(url: string) {
    if (!url) return { error: 'Üres URL' }
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        return { error: 'Csak YouTube linkek támogatottak.' }
    }

    try {
        // 1. Fetch Page Content for Description (and fallback Title)
        // We use a User-Agent to act like a bot/browser
        const pageRes = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { revalidate: 3600 }
        })

        let title = ''
        let description = ''
        let thumbnail = ''

        if (pageRes.ok) {
            const html = await pageRes.text()

            // Extract OG tags
            const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]*)"/)
            const ogDescMatch = html.match(/<meta property="og:description" content="([^"]*)"/)
            const descMatch = html.match(/<meta name="description" content="([^"]*)"/)
            const ogImageMatch = html.match(/<meta property="og:image" content="([^"]*)"/)

            title = ogTitleMatch?.[1] || ''
            description = ogDescMatch?.[1] || descMatch?.[1] || ''
            thumbnail = ogImageMatch?.[1] || ''
        }

        // 2. If scraping failed to get Title, try oEmbed as backup
        if (!title) {
            const oembedRes = await fetch(`https://noembed.com/embed?url=${url}`)
            const oembedData = await oembedRes.json()
            if (oembedData.title) title = oembedData.title
            if (oembedData.thumbnail_url && !thumbnail) thumbnail = oembedData.thumbnail_url
        }

        return { title, description, thumbnail }

    } catch (e) {
        console.error("Video Fetch Error:", e)
        return { error: 'Nem sikerült letölteni az adatokat.' }
    }
}

export async function toggleVideoFeatured(id: string, featured: boolean) {
    await prisma.video.update({
        where: { id },
        data: { featured },
    })
    revalidatePath('/', 'layout')
    return { success: true }
}

