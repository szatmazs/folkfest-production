import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSomloEn() {
    const page = await prisma.page.findUnique({
        where: { slug: 'somlo-folkfest' }
    })
    if (!page) return
    console.log(`--- ENGLISH BLOCKS FOR: ${page.title} ---`)
    if (page.contentEn) {
        const blocks = JSON.parse(page.contentEn)
        blocks.forEach((b: any, i: number) => {
            console.log(`Block ${i} (${b.type}):`)
            if (b.title) console.log(`  Title: ${b.title}`)
            if (b.content) console.log(`  Content: ${b.content.substring(0, 200)}...`)
        })
    } else {
        console.log('No contentEn found.')
    }
}

checkSomloEn()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
