import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listMenu() {
    const items = await prisma.menuItem.findMany({
        orderBy: { order: 'asc' },
        where: { isVisible: true }
    })
    console.log('Visible Menu Items:')
    items.forEach(item => {
        console.log(`- ${item.label} (${item.labelEn || 'N/A'}) -> ${item.path}`)
    })
}

listMenu()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
