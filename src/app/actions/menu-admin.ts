'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getMenuItems() {
    return await prisma.menuItem.findMany({
        orderBy: { order: 'asc' },
        where: { isVisible: true }
    })
}

// Admin only: Fetch all including hidden
export async function getAllMenuItems() {
    return await prisma.menuItem.findMany({
        orderBy: { order: 'asc' }
    })
}

import { translateText } from '@/lib/translate'

export async function autoTranslateMenuAction(text: string) {
    return await translateText(text, 'en')
}

export async function createMenuItem(formData: FormData) {
    const label = formData.get('label') as string
    let labelEn = formData.get('labelEn') as string
    if (!labelEn && label) labelEn = await translateText(label, 'en')
    const path = formData.get('path') as string
    const target = formData.get('target') as string || '_self'

    // Auto calculate order: last + 10
    const lastItem = await prisma.menuItem.findFirst({
        orderBy: { order: 'desc' }
    })
    const order = lastItem ? lastItem.order + 10 : 10

    await prisma.menuItem.create({
        data: {
            label,
            labelEn: labelEn || null,
            path,
            order,
            target
        }
    })

    revalidatePath('/')
    revalidatePath('/admin/menu')
    return { success: true }
}

export async function updateMenuItem(id: string, formData: FormData) {
    const label = formData.get('label') as string
    let labelEn = formData.get('labelEn') as string
    if (!labelEn && label) labelEn = await translateText(label, 'en')
    const path = formData.get('path') as string
    const order = parseInt(formData.get('order') as string)
    const isVisible = formData.get('isVisible') === 'true'
    const target = formData.get('target') as string

    await prisma.menuItem.update({
        where: { id },
        data: {
            label,
            labelEn: labelEn || null,
            path,
            order,
            isVisible,
            target
        }
    })

    revalidatePath('/')
    revalidatePath('/admin/menu')
    return { success: true }
}

export async function deleteMenuItem(id: string) {
    await prisma.menuItem.delete({
        where: { id }
    })
    revalidatePath('/')
    revalidatePath('/admin/menu')
    return { success: true }
}

export async function reorderMenu(ids: string[]) {
    // Transaction to update all orders
    // Simply set order based on index * 10

    // Prisma transactions are tricky with async mapping if not using queryRaw or batch
    // We will loop for now, it's small data.

    for (let i = 0; i < ids.length; i++) {
        await prisma.menuItem.update({
            where: { id: ids[i] },
            data: { order: (i + 1) * 10 }
        })
    }

    revalidatePath('/')
    revalidatePath('/admin/menu')
    return { success: true }
}
