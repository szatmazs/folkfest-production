
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedMenu() {
    console.log('Seeding menu...');

    // Check if empty
    const count = await prisma.menuItem.count();
    if (count > 0) {
        console.log('Menu already seeded.');
        return;
    }

    const items = [
        { label: 'Rólunk', path: '/about', order: 10 },
        { label: 'Projektek', path: '/projects', order: 20 },
        { label: 'Események', path: '/events', order: 30 },
        { label: 'Kapcsolat', path: '/contact', order: 40 },
        { label: 'Hírek', path: '#news', order: 50 }, // Anchor to news section or separate page
        { label: 'Videók', path: '/videos', order: 60 },
    ];

    for (const item of items) {
        await prisma.menuItem.create({ data: item });
    }

    console.log('Menu seeded.');
}

seedMenu()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
