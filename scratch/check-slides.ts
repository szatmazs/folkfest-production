import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSlides() {
    const slides = await prisma.heroSlide.findMany()
    console.log('--- HERO SLIDES ---')
    slides.forEach(s => {
        console.log(`- Title: ${s.title} (${s.titleEn || 'N/A'})`)
        console.log(`  Subtitle: ${s.subtitle} (${s.subtitleEn || 'N/A'})`)
    })
}

checkSlides()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
