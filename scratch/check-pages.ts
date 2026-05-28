import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPages() {
    const pages = await prisma.page.findMany()
    console.log('--- PAGES ---')
    pages.forEach(p => {
        console.log(`- ${p.title} (Slug: ${p.slug}) (En: ${p.titleEn || 'N/A'})`)
    })
}

checkPages()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
