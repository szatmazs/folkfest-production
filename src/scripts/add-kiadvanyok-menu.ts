import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const label = "Kiadványok";
    const path = "/kiadvanyok";

    const existing = await prisma.menuItem.findFirst({
        where: { path }
    });

    if (existing) {
        console.log(`Menu item '${label}' at '${path}' already exists.`);
        return;
    }

    // Find the highest order to append
    const lastItem = await prisma.menuItem.findFirst({
        orderBy: { order: 'desc' }
    });

    const nextOrder = (lastItem?.order ?? 0) + 1;

    await prisma.menuItem.create({
        data: {
            label,
            path,
            order: nextOrder,
            isVisible: true
        }
    })

    console.log(`Added '${label}' menu item with order ${nextOrder}.`);
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
