'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

import { uploadImage } from '@/lib/upload'

export async function getHomeSettings() {
    return await prisma.homeSettings.findFirst({
        where: { id: 1 }
    })
}

import { translateText } from '@/lib/translate'

export async function autoTranslateSettingsAction(text: string) {
    return await translateText(text, 'en')
}

export async function updateHomeSettings(formData: FormData) {
    const data: any = {}
    const fields = [
        'heroSubtitle', 'heroTitle', 'heroTitleHighlight', 
        'heroLeftButtonLabel', 'heroRightButtonLabel', 'heroDescription',
        'missionTitle', 'missionDescription', 'activitiesTitle'
    ]

    for (const f of fields) {
        if (formData.has(f)) {
            const val = formData.get(f) as string
            let valEn = formData.get(`${f}En`) as string
            if (!valEn && val) valEn = await translateText(val, 'en')
            data[f] = val
            data[`${f}En`] = valEn || null
        }
    }

    if (formData.has('heroLeftButtonLink')) data.heroLeftButtonLink = formData.get('heroLeftButtonLink')
    if (formData.has('heroRightButtonLink')) data.heroRightButtonLink = formData.get('heroRightButtonLink')

    // Handle sections JSON
    const sectionsJson = formData.get('sections') as string;
    if (sectionsJson) {
        try {
            const sections = JSON.parse(sectionsJson)
            for (const section of sections) {
                if (section.title && !section.titleEn) {
                    section.titleEn = await translateText(section.title, 'en')
                }
                if (section.buttonLabel && !section.buttonLabelEn) {
                    section.buttonLabelEn = await translateText(section.buttonLabel, 'en')
                }
            }
            data.sections = JSON.stringify(sections);
        } catch (e) {
            data.sections = sectionsJson;
        }
    }

    try {
        await prisma.homeSettings.upsert({
            where: { id: 1 },
            create: {
                id: 1,
                ...data
            },
            update: data
        })

        revalidatePath('/')
        revalidatePath('/admin/settings')
        return { success: true }
    } catch (error: any) {
        console.error('Home settings update error:', error)
        return { success: false, error: error.message }
    }
}

export async function getFooterSettings() {
    return await prisma.footerSettings.upsert({
        where: { id: 1 },
        update: {},
        create: { id: 1 }
    })
}

export async function updateFooterSettings(formData: FormData) {
    const fields = ['brandContent', 'contactContent', 'socialContent', 'bottomText']
    const data: any = {}

    for (const f of fields) {
        const val = formData.get(f) as string
        let valEn = formData.get(`${f}En`) as string
        if (!valEn && val) valEn = await translateText(val, 'en')
        data[f] = val
        data[`${f}En`] = valEn || null
    }

    await prisma.footerSettings.upsert({
        where: { id: 1 },
        create: {
            id: 1,
            ...data
        },
        update: data
    })

    revalidatePath('/')
    revalidatePath('/admin/settings')
    return { success: true }
}
