import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMenu() {
    console.log('--- DETAILED MENU ITEMS ---')
    const menuItems = await prisma.menuItem.findMany()
    menuItems.forEach(item => {
        console.log(`ID: ${item.id}`)
        console.log(`  Label: [${item.label}] (length: ${item.label.length})`)
        console.log(`  LabelEn: [${item.labelEn}] (length: ${item.labelEn?.length || 0}, type: ${typeof item.labelEn})`)
        console.log(`  Identical?: ${item.label === item.labelEn}`)
    })
}

checkMenu()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
