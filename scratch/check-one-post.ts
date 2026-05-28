import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function check() {
    const post = await prisma.facebookPost.findFirst({
        where: { id: '106971394411813_576962900745991' }
    })
    if (post) {
        console.log(`ID: ${post.id}`)
        console.log(`Message: ${post.message}`)
        console.log(`MessageEn: ${post.messageEn}`)
        console.log('Attachments:', JSON.stringify(JSON.parse(post.attachments || '{}'), null, 2))
    }
}

check().finally(() => prisma.$disconnect())
