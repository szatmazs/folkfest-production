import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const posts = await prisma.facebookPost.count()
    const events = await prisma.facebookEvent.count()
    console.log(`Posts: ${posts}, Events: ${events}`)

    const event = await prisma.facebookEvent.findFirst()
    console.log('First Event in DB:', event)

    const post = await prisma.facebookPost.findFirst()
    console.log('First Post in DB:', post)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
