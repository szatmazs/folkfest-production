'use server'

import { prisma } from '@/lib/prisma'
import { uploadImage } from '@/lib/upload'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Project } from '@prisma/client'
import { slugify } from '@/lib/slugify'

export async function getProjects() {
    return await prisma.project.findMany({
        orderBy: { startDate: 'desc' },
    })
}

export async function getProject(id: string) {
    return await prisma.project.findUnique({
        where: { id },
        include: { partners: true, results: true }
    })
}

async function processRelations(formData: FormData) {
    // Partners
    const partners = []
    let pIdx = 0
    while (formData.has(`partners[${pIdx}][name]`)) {
        const logoFile = formData.get(`partners[${pIdx}][logo]`)
        const existingLogo = formData.get(`partners[${pIdx}][existingLogo]`)
        let logoUrl = (typeof existingLogo === 'string') ? existingLogo : null

        if (logoFile instanceof File && logoFile.size > 0) {
            const uploaded = await uploadImage(logoFile, 'partners')
            if (uploaded) logoUrl = uploaded
        }

        const name = formData.get(`partners[${pIdx}][name]`)
        if (typeof name === 'string' && name.trim()) {
            partners.push({
                name: name.trim(),
                link: formData.get(`partners[${pIdx}][link]`) as string || null,
                country: formData.get(`partners[${pIdx}][country]`) as string || null,
                logoUrl
            })
        }
        pIdx++
    }

    // Results
    const results = []
    let rIdx = 0
    while (formData.has(`results[${rIdx}][type]`)) {
        const type = formData.get(`results[${rIdx}][type]`) as string
        const label = formData.get(`results[${rIdx}][label]`) as string
        const labelEn = formData.get(`results[${rIdx}][labelEn]`) as string
        const existingContent = formData.get(`results[${rIdx}][content]`) as string
        const existingContentEn = formData.get(`results[${rIdx}][contentEn]`) as string
        let content = existingContent || ''
        let contentEn = existingContentEn || ''

        const file = formData.get(`results[${rIdx}][file]`)
        if (type === 'file' && file instanceof File && file.size > 0) {
            const uploaded = await uploadImage(file, 'results')
            if (uploaded) content = uploaded
        } else if (type === 'gallery') {
            // Get existing gallery URLs
            const existingGalleryRaw = formData.get(`results[${rIdx}][existingGallery]`) as string
            let existingUrls: string[] = []
            try { existingUrls = JSON.parse(existingGalleryRaw || '[]') } catch {}

            // Upload new gallery files
            const galleryFiles = formData.getAll(`results[${rIdx}][galleryFiles]`)
            const newUrls: string[] = []
            for (const gf of galleryFiles) {
                if (gf instanceof File && gf.size > 0) {
                    const uploaded = await uploadImage(gf, 'gallery')
                    if (uploaded) newUrls.push(uploaded)
                }
            }

            content = JSON.stringify([...existingUrls, ...newUrls])
        }

        results.push({ 
            type, 
            label, 
            labelEn: labelEn || (label ? await translateText(label, 'en') : null), 
            content, 
            contentEn: contentEn || (type === 'text' && content ? await translateText(content, 'en') : null) 
        })
        rIdx++
    }

    return { partners: partners as any[], results: results as any[] }
}

export async function createProject(formData: FormData) {
    const title = formData.get('title') as string
    let titleEn = formData.get('titleEn') as string
    if (!titleEn && title) titleEn = await translateText(title, 'en')

    const description = formData.get('description') as string
    let descriptionEn = formData.get('descriptionEn') as string
    if (!descriptionEn && description && description !== '[]') descriptionEn = await translateText(description, 'en')

    const projectData = formData.get('projectData') as string
    // Note: maybe we don't auto-translate rich text projectData here or we do?
    // Let's stick to the main blocks for now.

    let contentEn = formData.get('contentEn') as string
    // if (!contentEn && content) contentEn = await translateText(content, 'en')

    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const imageFile = formData.get('image') as File
    const sponsorLogoFile = formData.get('sponsorLogoFile') as File
    const sponsorLogoEnFile = formData.get('sponsorLogoEnFile') as File

    if (!title) {
        console.error("Missing title")
        return
    }

    let slug = slugify(title)
    let slugEn = slugify(titleEn || title)

    // Ensure unique slug
    let suffix = 0
    let uniqueSlug = slug
    while (await prisma.project.count({ where: { slug: uniqueSlug } }) > 0) {
        suffix++
        uniqueSlug = `${slug}-${suffix}`
    }
    slug = uniqueSlug

    // Ensure unique slugEn
    let suffixEn = 0
    let uniqueSlugEn = slugEn
    while (await prisma.project.count({ where: { slugEn: uniqueSlugEn } }) > 0) {
        suffixEn++
        uniqueSlugEn = `${slugEn}-${suffixEn}`
    }
    slugEn = uniqueSlugEn

    try {
        let mainImage = null
        if (imageFile instanceof File && imageFile.size > 0) {
            mainImage = await uploadImage(imageFile, 'projects')
        }

        let sponsorLogo = null
        if (sponsorLogoFile instanceof File && sponsorLogoFile.size > 0) {
            sponsorLogo = await uploadImage(sponsorLogoFile, 'projects')
        }

        let sponsorLogoEn = null
        if (sponsorLogoEnFile instanceof File && sponsorLogoEnFile.size > 0) {
            sponsorLogoEn = await uploadImage(sponsorLogoEnFile, 'projects')
        }

        const { partners, results } = await processRelations(formData)

        const parsedStartDate = startDate ? new Date(startDate) : null
        const finalStartDate = (parsedStartDate && !isNaN(parsedStartDate.getTime())) ? parsedStartDate : new Date()

        const parsedEndDate = endDate ? new Date(endDate) : null
        const finalEndDate = (parsedEndDate && !isNaN(parsedEndDate.getTime())) ? parsedEndDate : null

        await prisma.project.create({
            data: {
                title,
                titleEn: titleEn || null,
                slug,
                slugEn: slugEn || null,
                description: description || null,
                descriptionEn: descriptionEn || null,
                projectData: projectData || null,
                contentEn: contentEn || null,
                startDate: finalStartDate,
                endDate: finalEndDate,
                mainImage,
                sponsorLogo,
                sponsorLogoEn,
                partners: { create: partners },
                results: { create: results }
            },
        })
    } catch (error) {
        console.error("Create Project Error:", error)
        throw new Error(error instanceof Error ? error.message : "Hiba történt a projekt létrehozása során")
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function updateProject(id: string, formData: FormData) {
    const title = formData.get('title') as string
    let titleEn = formData.get('titleEn') as string
    if (!titleEn && title) titleEn = await translateText(title, 'en')

    const description = formData.get('description') as string
    let descriptionEn = formData.get('descriptionEn') as string
    if (!descriptionEn && description && description !== '[]') descriptionEn = await translateText(description, 'en')

    const projectData = formData.get('projectData') as string
    let contentEn = formData.get('contentEn') as string
    
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const imageFile = formData.get('image') as File
    const sponsorLogoFile = formData.get('sponsorLogoFile') as File
    const sponsorLogoEnFile = formData.get('sponsorLogoEnFile') as File

    let slug = slugify(title)
    let slugEn = slugify(titleEn || title)

    // Ensure unique slug (excluding current project)
    let suffix = 0
    let uniqueSlug = slug
    while (await prisma.project.count({ where: { slug: uniqueSlug, id: { not: id } } }) > 0) {
        suffix++
        uniqueSlug = `${slug}-${suffix}`
    }
    slug = uniqueSlug

    // Ensure unique slugEn (excluding current project)
    let suffixEn = 0
    let uniqueSlugEn = slugEn
    while (await prisma.project.count({ where: { slugEn: uniqueSlugEn, id: { not: id } } }) > 0) {
        suffixEn++
        uniqueSlugEn = `${slugEn}-${suffixEn}`
    }
    slugEn = uniqueSlugEn

    try {
        const parsedStartDate = startDate ? new Date(startDate) : null
        const finalStartDate = (parsedStartDate && !isNaN(parsedStartDate.getTime())) ? parsedStartDate : undefined

        const parsedEndDate = endDate ? new Date(endDate) : null
        const finalEndDate = (parsedEndDate && !isNaN(parsedEndDate.getTime())) ? parsedEndDate : null

        const data: any = {
            title,
            titleEn: titleEn || null,
            slug,
            slugEn: slugEn || null,
            description,
            descriptionEn: descriptionEn || null,
            projectData,
            contentEn: contentEn || null,
            startDate: finalStartDate,
            endDate: finalEndDate
        }

        if (imageFile instanceof File && imageFile.size > 0) {
            const imagePath = await uploadImage(imageFile, 'projects')
            if (imagePath) data.mainImage = imagePath
        }

        if (sponsorLogoFile instanceof File && sponsorLogoFile.size > 0) {
            const sponsorPath = await uploadImage(sponsorLogoFile, 'projects')
            if (sponsorPath) data.sponsorLogo = sponsorPath
        }

        if (sponsorLogoEnFile instanceof File && sponsorLogoEnFile.size > 0) {
            const sponsorPathEn = await uploadImage(sponsorLogoEnFile, 'projects')
            if (sponsorPathEn) data.sponsorLogoEn = sponsorPathEn
        }

        const { partners, results } = await processRelations(formData)

        await prisma.project.update({
            where: { id },
            data: {
                ...data,
                partners: {
                    deleteMany: {},
                    create: partners
                },
                results: {
                    deleteMany: {},
                    create: results
                }
            }
        })
    } catch (error) {
        console.error("Update Project Error:", error)
        throw new Error(error instanceof Error ? error.message : "Hiba történt a projekt frissítése során")
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function deleteProject(id: string) {
    await prisma.project.delete({
        where: { id },
    })
    revalidatePath('/', 'layout')
    return { success: true }
}

import { translateText } from '@/lib/translate'

export async function autoTranslateProjectAction(text: string) {
    return await translateText(text, 'en')
}
