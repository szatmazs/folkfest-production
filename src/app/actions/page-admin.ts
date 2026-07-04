'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { slugify } from '@/lib/slugify'

export async function getPages() {
    return await prisma.page.findMany({
        orderBy: { title: 'asc' },
    })
}

export async function getPage(id: string) {
    return await prisma.page.findUnique({
        where: { id },
    })
}

import { uploadImage } from '@/lib/upload'
import { translateText, translateTextWithPreservation } from '@/lib/translate'

export async function autoTranslatePageAction(text: string, currentEn?: string, originalHu?: string) {
    if (!text) return '';
    const trimmed = text.trim();
    const isJson = (trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'));
    
    if (isJson) {
        if (currentEn && originalHu) {
            return await translateTextWithPreservation(text, currentEn, originalHu, 'en');
        }
        return await translateText(text, 'en');
    }
    
    if (currentEn && originalHu && text === originalHu) {
        return currentEn;
    }
    return await translateText(text, 'en')
}

export async function createPage(formData: FormData) {
    const title = formData.get('title') as string
    let titleEn = formData.get('titleEn') as string
    let slug = formData.get('slug') as string
    const content = formData.get('content') as string
    let contentEn = formData.get('contentEn') as string

    // Auto-translate if missing
    if (!titleEn && title) titleEn = await translateText(title, 'en')
    if (!contentEn && content && content !== '[]') contentEn = await translateText(content, 'en')

    if (!slug && title) slug = slugify(title)
    let slugEn = slugify(titleEn || title)

    // Ensure unique slug
    let suffix = 0
    let uniqueSlug = slug
    while (await prisma.page.count({ where: { slug: uniqueSlug } }) > 0) {
        suffix++
        uniqueSlug = `${slug}-${suffix}`
    }
    slug = uniqueSlug

    // Ensure unique slugEn
    let suffixEn = 0
    let uniqueSlugEn = slugEn
    while (await prisma.page.count({ where: { slugEn: uniqueSlugEn } }) > 0) {
        suffixEn++
        uniqueSlugEn = `${slugEn}-${suffixEn}`
    }
    slugEn = uniqueSlugEn

    const heroType = (formData.get('heroType') as string) || 'small'
    const heroTitle = formData.get('heroTitle') as string
    let heroTitleEn = formData.get('heroTitleEn') as string
    if (!heroTitleEn && heroTitle) heroTitleEn = await translateText(heroTitle, 'en')

    const heroSubtitle = formData.get('heroSubtitle') as string
    let heroSubtitleEn = formData.get('heroSubtitleEn') as string
    if (!heroSubtitleEn && heroSubtitle) heroSubtitleEn = await translateText(heroSubtitle, 'en')

    const heroButtonLabel = formData.get('heroButtonLabel') as string
    let heroButtonLabelEn = formData.get('heroButtonLabelEn') as string
    if (!heroButtonLabelEn && heroButtonLabel) heroButtonLabelEn = await translateText(heroButtonLabel, 'en')

    const heroButtonLink = formData.get('heroButtonLink') as string
    const heroLogoSize = (formData.get('heroLogoSize') as string) || 'medium'
    const heroShowTitle = formData.get('heroShowTitle') === 'true'

    const heroImageFile = formData.get('heroImage') as File
    let heroImage = null
    if (heroImageFile && heroImageFile.size > 0) {
        heroImage = await uploadImage(heroImageFile, 'pages')
    }

    const heroLogoFile = formData.get('heroLogo') as File
    let heroLogo = null
    if (heroLogoFile && heroLogoFile.size > 0) {
        heroLogo = await uploadImage(heroLogoFile, 'pages')
    }

    await prisma.page.create({
        data: {
            title,
            titleEn: titleEn || null,
            slug,
            slugEn: slugEn || null,
            content,
            contentEn: contentEn || null,
            heroType,
            heroTitle: heroTitle || null,
            heroTitleEn: heroTitleEn || null,
            heroSubtitle: heroSubtitle || null,
            heroSubtitleEn: heroSubtitleEn || null,
            heroButtonLabel: heroButtonLabel || null,
            heroButtonLabelEn: heroButtonLabelEn || null,
            heroButtonLink: heroButtonLink || null,
            heroImage,
            heroLogo,
            heroLogoSize,
            heroShowTitle
        },
    })

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function updatePage(id: string, formData: FormData) {
    const title = formData.get('title') as string
    let titleEn = formData.get('titleEn') as string
    let slug = formData.get('slug') as string
    const content = formData.get('content') as string
    let contentEn = formData.get('contentEn') as string

    // Auto-translate if missing
    if (!titleEn && title) titleEn = await translateText(title, 'en')
    if (!contentEn && content && content !== '[]') contentEn = await translateText(content, 'en')

    if (!slug && title) slug = slugify(title)
    let slugEn = slugify(titleEn || title)

    // Ensure unique slug (excluding current page)
    let suffix = 0
    let uniqueSlug = slug
    while (await prisma.page.count({ where: { slug: uniqueSlug, id: { not: id } } }) > 0) {
        suffix++
        uniqueSlug = `${slug}-${suffix}`
    }
    slug = uniqueSlug

    // Ensure unique slugEn (excluding current page)
    let suffixEn = 0
    let uniqueSlugEn = slugEn
    while (await prisma.page.count({ where: { slugEn: uniqueSlugEn, id: { not: id } } }) > 0) {
        suffixEn++
        uniqueSlugEn = `${slugEn}-${suffixEn}`
    }
    slugEn = uniqueSlugEn

    const heroType = (formData.get('heroType') as string) || 'small'
    const heroTitle = formData.get('heroTitle') as string
    let heroTitleEn = formData.get('heroTitleEn') as string
    if (!heroTitleEn && heroTitle) heroTitleEn = await translateText(heroTitle, 'en')

    const heroSubtitle = formData.get('heroSubtitle') as string
    let heroSubtitleEn = formData.get('heroSubtitleEn') as string
    if (!heroSubtitleEn && heroSubtitle) heroSubtitleEn = await translateText(heroSubtitle, 'en')

    const heroButtonLabel = formData.get('heroButtonLabel') as string
    let heroButtonLabelEn = formData.get('heroButtonLabelEn') as string
    if (!heroButtonLabelEn && heroButtonLabel) heroButtonLabelEn = await translateText(heroButtonLabel, 'en')

    const heroButtonLink = formData.get('heroButtonLink') as string
    const heroLogoSize = (formData.get('heroLogoSize') as string) || 'medium'
    const heroShowTitle = formData.get('heroShowTitle') === 'true'

    const data: any = {
        title,
        titleEn: titleEn || null,
        slug,
        slugEn: slugEn || null,
        content,
        contentEn: contentEn || null,
        heroType,
        heroTitle: heroTitle || null,
        heroTitleEn: heroTitleEn || null,
        heroSubtitle: heroSubtitle || null,
        heroSubtitleEn: heroSubtitleEn || null,
        heroButtonLabel: heroButtonLabel || null,
        heroButtonLabelEn: heroButtonLabelEn || null,
        heroButtonLink: heroButtonLink || null,
        heroLogoSize,
        heroShowTitle
    }

    const heroImageFile = formData.get('heroImage') as File
    if (heroImageFile && heroImageFile.size > 0) {
        const path = await uploadImage(heroImageFile, 'pages')
        if (path) data.heroImage = path
    }

    const heroLogoFile = formData.get('heroLogo') as File
    if (heroLogoFile && heroLogoFile.size > 0) {
        const path = await uploadImage(heroLogoFile, 'pages')
        if (path) data.heroLogo = path
    }

    await prisma.page.update({
        where: { id },
        data,
    })

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function deletePage(id: string) {
    await prisma.page.delete({
        where: { id },
    })
    revalidatePath('/', 'layout')
    return { success: true }
}

export async function getAlternativeSlug(slug: string, targetLocale: string) {
    const isEn = targetLocale === 'en';

    // 1. Search Page
    const page = await prisma.page.findFirst({
        where: {
            OR: [
                { slug },
                { slugEn: slug }
            ]
        },
        select: { slug: true, slugEn: true }
    });
    if (page) {
        return isEn ? (page.slugEn || page.slug) : page.slug;
    }

    // 2. Search Project
    const project = await prisma.project.findFirst({
        where: {
            OR: [
                { slug },
                { slugEn: slug }
            ]
        },
        select: { slug: true, slugEn: true }
    });
    if (project) {
        return isEn ? (project.slugEn || project.slug) : project.slug;
    }

    return slug;
}
