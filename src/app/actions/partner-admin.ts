'use server'

import { prisma } from '@/lib/prisma'
import { uploadImage } from '@/lib/upload'
import { revalidatePath } from 'next/cache'

export async function getPartners() {
    const partners = await prisma.partner.findMany()
    return partners.sort((a, b) => a.name.localeCompare(b.name, 'hu', { sensitivity: 'base' }))
}

export async function createPartner(formData: FormData) {
    const name = formData.get('name') as string
    const websiteUrl = formData.get('websiteUrl') as string
    const logoUrlInput = formData.get('logoUrl') as string
    const logoFile = formData.get('logo') as File

    if (!name) {
        return { error: 'Név kötelező!' }
    }

    let logoUrl = logoUrlInput || ''
    if (logoFile && logoFile.size > 0) {
        const uploadedUrl = await uploadImage(logoFile, 'partners')
        if (uploadedUrl) logoUrl = uploadedUrl
    }

    if (!logoUrl) {
        return { error: 'Logó kötelező!' }
    }

    await prisma.partner.create({
        data: {
            name,
            websiteUrl,
            logoUrl
        },
    })

    revalidatePath('/')
    revalidatePath('/admin/partners')
    return { success: true }
}

export async function updatePartner(id: string, formData: FormData) {
    const name = formData.get('name') as string
    const websiteUrl = formData.get('websiteUrl') as string
    const logoUrlInput = formData.get('logoUrl') as string
    const logoFile = formData.get('logo') as File

    const data: any = {
        name,
        websiteUrl
    }

    if (logoUrlInput) {
        data.logoUrl = logoUrlInput
    }

    if (logoFile && logoFile.size > 0) {
        const uploadedUrl = await uploadImage(logoFile, 'partners')
        if (uploadedUrl) data.logoUrl = uploadedUrl
    }

    await prisma.partner.update({
        where: { id },
        data,
    })

    revalidatePath('/')
    revalidatePath('/admin/partners')
    return { success: true }
}

export async function deletePartner(id: string) {
    await prisma.partner.delete({
        where: { id },
    })
    revalidatePath('/')
    revalidatePath('/admin/partners')
    return { success: true }
}
