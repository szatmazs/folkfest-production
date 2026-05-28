import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPageBlocks() {
    const page = await prisma.page.findUnique({
        where: { slug: 'somlo-folkfest' }
    })
    if (!page) {
        console.log('Page not found.')
        return
    }
    console.log(`--- BLOCKS FOR PAGE: ${page.title} ---`)
    if (page.content) {
        const blocks = JSON.parse(page.content)
        blocks.forEach((b: any, i: number) => {
            console.log(`Block ${i} (${b.type}):`)
            if (b.title) console.log(`  Title: ${b.title}`)
            if (b.content) console.log(`  Content: ${b.content.substring(0, 100)}...`)
            
            // Check items for lists/accordions
            if (b.items) {
                b.items.forEach((item: any, j: number) => {
                    console.log(`    Item ${j}: ${item.title || item.text || 'N/A'}`)
                    if (item.content) console.log(`      Content: ${item.content.substring(0, 100)}...`)
                })
            }
        })
    }
}

checkPageBlocks()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
