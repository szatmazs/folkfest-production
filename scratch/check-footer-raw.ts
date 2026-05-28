import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkFooter() {
    console.log('--- RAW FOOTER SETTINGS ---')
    const footer = await prisma.footerSettings.findFirst()
    if (!footer) {
        console.log('No footer settings found.')
        return
    }

    console.log('Brand Content (HU):', footer.brandContent)
    console.log('Brand Content (EN):', footer.brandContentEn)
    console.log('---')
    console.log('Contact Content (HU):', footer.contactContent)
    console.log('Contact Content (EN):', footer.contactContentEn)
}

checkFooter()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
