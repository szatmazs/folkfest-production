import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Simple inline slugify to avoid path import issues in ts-node
function slugify(text: string | null | undefined): string {
    if (!text) return "";
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

async function main() {
    console.log("Starting slug updates...")

    // 1. Projects
    const projects = await prisma.project.findMany()
    for (const project of projects) {
        console.log(`Processing project: ${project.title}`)
        const slug = slugify(project.title)
        const slugEn = slugify(project.titleEn || project.title)

        // Ensure unique slug
        let suffix = 0
        let uniqueSlug = slug
        while (await prisma.project.count({ where: { slug: uniqueSlug, id: { not: project.id } } }) > 0) {
            suffix++
            uniqueSlug = `${slug}-${suffix}`
        }

        // Ensure unique slugEn
        let suffixEn = 0
        let uniqueSlugEn = slugEn
        while (await prisma.project.count({ where: { slugEn: uniqueSlugEn, id: { not: project.id } } }) > 0) {
            suffixEn++
            uniqueSlugEn = `${slugEn}-${suffixEn}`
        }

        await prisma.project.update({
            where: { id: project.id },
            data: {
                slug: uniqueSlug,
                slugEn: uniqueSlugEn
            }
        })
        console.log(`Updated project: ${project.title} -> slug: ${uniqueSlug}, slugEn: ${uniqueSlugEn}`)
    }

    // 2. Pages
    const pages = await prisma.page.findMany()
    for (const page of pages) {
        console.log(`Processing page: ${page.title}`)
        const slug = slugify(page.title)
        const slugEn = slugify(page.titleEn || page.title)

        // Ensure unique slug
        let suffix = 0
        let uniqueSlug = slug
        while (await prisma.page.count({ where: { slug: uniqueSlug, id: { not: page.id } } }) > 0) {
            suffix++
            uniqueSlug = `${slug}-${suffix}`
        }

        // Ensure unique slugEn
        let suffixEn = 0
        let uniqueSlugEn = slugEn
        while (await prisma.page.count({ where: { slugEn: uniqueSlugEn, id: { not: page.id } } }) > 0) {
            suffixEn++
            uniqueSlugEn = `${slugEn}-${suffixEn}`
        }

        await prisma.page.update({
            where: { id: page.id },
            data: {
                slug: uniqueSlug,
                slugEn: uniqueSlugEn
            }
        })
        console.log(`Updated page: ${page.title} -> slug: ${uniqueSlug}, slugEn: ${uniqueSlugEn}`)
    }

    console.log("Slug updates finished successfully!")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
