import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditPosts() {
    const posts = await prisma.facebookPost.findMany({
        where: { isVisible: true }
    })
    console.log(`--- VISIBLE POST AUDIT: ${posts.length} posts ---`)
    let untranslated = 0
    posts.forEach(p => {
        const needs = !p.messageEn && p.message
        if (needs || p.messageEn === p.message) {
            console.log(`- Post ${p.id}: UNTRANSLATED`)
            console.log(`  HU: ${p.message?.substring(0, 50)}...`)
            console.log(`  Has Attachments: ${!!p.attachments}`)
            if (p.attachments) {
                const parsed = JSON.parse(p.attachments);
                console.log(`    Attachment Title: ${parsed.data?.[0]?.title}`)
            }
            untranslated++
        }
    })
    console.log(`Total untranslated: ${untranslated}`)
}

auditPosts()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
