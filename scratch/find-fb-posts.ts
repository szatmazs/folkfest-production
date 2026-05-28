import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findPosts() {
    const posts = await prisma.facebookPost.findMany({
        where: {
            OR: [
                { message: { contains: 'Somló FolkFest' } },
                { customTitle: { contains: 'Somló FolkFest' } }
            ]
        }
    })
    console.log(`Found ${posts.length} matching posts.`)
    posts.forEach(p => {
        console.log(`- ID: ${p.id.substring(0,8)}`)
        console.log(`  Message: ${p.message?.substring(0,100)}`)
        console.log(`  MessageEn: ${p.messageEn?.substring(0,100)}`)
        console.log(`  CustomTitle: ${p.customTitle}`)
        console.log(`  CustomTitleEn: ${p.customTitleEn}`)
    })
}

findPosts()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
