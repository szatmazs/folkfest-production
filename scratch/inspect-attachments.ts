import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function inspect() {
    const posts = await prisma.facebookPost.findMany({
        where: { NOT: { attachments: null } },
        take: 5
    })
    posts.forEach(p => {
        console.log(`Post ${p.id}:`)
        console.log(`  Message: ${p.message}`)
        console.log(`  Attachments: ${p.attachments?.substring(0, 500)}...`)
        try {
            const parsed = JSON.parse(p.attachments || '{}')
            const item = parsed.data?.[0]
            if (item) {
                console.log(`    Title: ${item.title}`)
                console.log(`    Description: ${item.description}`)
            }
        } catch (e) {}
    })
}

inspect().finally(() => prisma.$disconnect())
