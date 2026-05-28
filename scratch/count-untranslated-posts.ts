import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function countUntranslated() {
    const total = await prisma.facebookPost.count()
    const untranslated = await prisma.facebookPost.count({
        where: {
            OR: [
                { messageEn: null },
                { messageEn: '' },
                { 
                    AND: [
                        { NOT: { message: null } },
                        { NOT: { message: '' } },
                        { 
                            OR: [
                                { messageEn: { equals: prisma.facebookPost.fields.message } }
                            ]
                        }
                    ]
                }
            ]
        }
    })

    console.log(`Total Facebook Posts: ${total}`)
    console.log(`Untranslated or identical-to-HU: ${untranslated}`)
}

countUntranslated()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
