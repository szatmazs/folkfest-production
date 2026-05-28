'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { translateText } from '@/lib/translate'

export async function getContactBlocks() {
    return await prisma.contactBlock.findMany({
        orderBy: { order: 'asc' },
    })
}

export async function addContactBlock(data: any) {
    if (!data.titleEn && data.title) data.titleEn = await translateText(data.title, 'en')
    if (!data.contentEn && data.content) data.contentEn = await translateText(data.content, 'en')

    const block = await prisma.contactBlock.create({
        data
    })
    revalidatePath('/', 'layout')
    return block
}

export async function updateContactBlock(id: string, data: any) {
    if (!data.titleEn && data.title) data.titleEn = await translateText(data.title, 'en')
    if (!data.contentEn && data.content) data.contentEn = await translateText(data.content, 'en')

    const block = await prisma.contactBlock.update({
        where: { id },
        data
    })
    revalidatePath('/', 'layout')
    return block
}

export async function deleteContactBlock(id: string) {
    await prisma.contactBlock.delete({
        where: { id }
    })
    revalidatePath('/', 'layout')
}

export async function getContactSettings() {
    let settings = await prisma.contactSettings.findFirst()
    if (!settings) {
        settings = await prisma.contactSettings.create({
            data: {
                id: 1,
                recipientEmails: 'info@folkfest.hu',
                footerInfo: '<p><strong>Adószám:</strong> 19038113-1-41</p><p><strong>Számlaszám:</strong> 12345678-12345678-12345678</p>'
            }
        })
    }
    return settings
}

export async function updateContactSettings(data: any) {
    if (!data.heroTitleEn && data.heroTitle) data.heroTitleEn = await translateText(data.heroTitle, 'en')
    if (!data.heroSubtitleEn && data.heroSubtitle) data.heroSubtitleEn = await translateText(data.heroSubtitle, 'en')
    if (!data.footerInfoEn && data.footerInfo) data.footerInfoEn = await translateText(data.footerInfo, 'en')

    const settings = await prisma.contactSettings.upsert({
        where: { id: 1 },
        create: {
            id: 1,
            ...data
        },
        update: data
    })
    revalidatePath('/', 'layout')
    return settings
}
