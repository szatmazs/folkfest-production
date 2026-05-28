import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDb() {
    console.log('--- MENU ITEMS ---')
    const menuItems = await prisma.menuItem.findMany()
    menuItems.forEach(item => {
        console.log(`ID: ${item.id} | Label: ${item.label} | LabelEn: ${item.labelEn}`)
    })

    console.log('\n--- PROJECTS ---')
    const projects = await prisma.project.findMany()
    projects.forEach(p => {
        console.log(`ID: ${p.id} | Title: ${p.title} | projectData Length: ${p.projectData?.length || 0} | contentEn Length: ${p.contentEn?.length || 0}`)
    })
}

checkDb()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
