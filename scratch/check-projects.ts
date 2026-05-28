import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProjects() {
    const projects = await prisma.project.findMany()
    console.log('--- PROJECTS ---')
    projects.forEach(p => {
        console.log(`- ${p.title} (${p.titleEn || 'N/A'})`)
        console.log(`  ContentEn exists: ${!!p.contentEn}`)
        console.log(`  DescriptionEn exists: ${!!p.descriptionEn}`)
    })
}

checkProjects()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
