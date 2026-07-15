'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getFacebookPosts, getFacebookEvents } from '@/actions/facebook'

function revalidateContent() {
    revalidatePath('/')
    revalidatePath('/hirek')
    revalidatePath('/events')
    revalidatePath('/admin/facebook')
    revalidatePath('/admin/facebook/events')
}

export async function getAdminFacebookPosts() {
    return await prisma.facebookPost.findMany({
        orderBy: { createdTime: 'desc' },
    })
}

export async function getAdminFacebookEvents() {
    return await prisma.facebookEvent.findMany({
        orderBy: { startTime: 'desc' },
    })
}

export async function toggleEventVisibility(id: string) {
    const event = await prisma.facebookEvent.findUnique({ where: { id } })
    if (!event) return

    await prisma.facebookEvent.update({
        where: { id },
        data: { isVisible: !event.isVisible },
    })
    revalidateContent()
}

export async function updateEventDetails(id: string, nameEn: string, descriptionEn: string, placeEn: string) {
    await prisma.facebookEvent.update({
        where: { id },
        data: { nameEn, descriptionEn, placeEn },
    })
    revalidateContent()
}

export async function deleteEvent(id: string) {
    await prisma.facebookEvent.delete({
        where: { id }
    })
    revalidateContent()
}


export async function togglePostVisibility(id: string) {
    const post = await prisma.facebookPost.findUnique({ where: { id } })
    if (!post) return

    await prisma.facebookPost.update({
        where: { id },
        data: { isVisible: !post.isVisible },
    })
    revalidateContent()
}

export async function togglePostCarouselVisibility(id: string) {
    const post = await prisma.facebookPost.findUnique({ where: { id } })
    if (!post) return

    await prisma.facebookPost.update({
        where: { id },
        data: { showInCarousel: !post.showInCarousel },
    })
    revalidateContent()
}

export async function updatePostTitle(id: string, customTitle: string, customTitleEn: string) {
    await prisma.facebookPost.update({
        where: { id },
        data: { customTitle, customTitleEn },
    })
    revalidateContent()
}

export async function updatePostMessageEn(id: string, messageEn: string) {
    await prisma.facebookPost.update({
        where: { id },
        data: { messageEn },
    })
    revalidateContent()
}

export async function deletePost(id: string) {
    // Record as deleted to prevent re-sync
    await prisma.deletedFacebookPost.upsert({
        where: { id },
        create: { id },
        update: {}
    })

    await prisma.facebookPost.delete({
        where: { id }
    })
    revalidateContent()
}

export async function syncFacebookData() {
    try {
        await getFacebookPosts({ forceRefresh: true })
        await getFacebookEvents({ forceRefresh: true })
        revalidateContent()
        return { success: true }
    } catch (e) {
        console.error(e)
        return { success: false, error: 'Hiba a szinkronizálás során' }
    }
}
