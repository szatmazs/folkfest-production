const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting about page content synchronization...');

    // 1. Find the beautiful, modern "folkfest-kulturalis-egyesulet" page
    const sourcePage = await prisma.page.findFirst({
        where: { slug: 'folkfest-kulturalis-egyesulet' }
    });

    if (!sourcePage) {
        console.error('Error: Source page with slug "folkfest-kulturalis-egyesulet" not found!');
        return;
    }

    console.log('Found source page:', sourcePage.title);

    // 2. Upsert or update the "about" page with all the modern block layout fields
    const updatedAboutPage = await prisma.page.upsert({
        where: { slug: 'about' },
        update: {
            title: 'Rólunk',
            titleEn: 'About Us',
            content: sourcePage.content,
            contentEn: sourcePage.contentEn,
            heroType: sourcePage.heroType,
            heroImage: sourcePage.heroImage,
            heroTitle: sourcePage.heroTitle,
            heroTitleEn: sourcePage.heroTitleEn,
            heroSubtitle: sourcePage.heroSubtitle,
            heroSubtitleEn: sourcePage.heroSubtitleEn,
            heroLogo: sourcePage.heroLogo,
            heroLogoSize: sourcePage.heroLogoSize,
            heroShowTitle: sourcePage.heroShowTitle,
            heroButtonLabel: sourcePage.heroButtonLabel,
            heroButtonLabelEn: sourcePage.heroButtonLabelEn,
            heroButtonLink: sourcePage.heroButtonLink,
        },
        create: {
            title: 'Rólunk',
            titleEn: 'About Us',
            slug: 'about',
            slugEn: 'about',
            content: sourcePage.content,
            contentEn: sourcePage.contentEn,
            heroType: sourcePage.heroType,
            heroImage: sourcePage.heroImage,
            heroTitle: sourcePage.heroTitle,
            heroTitleEn: sourcePage.heroTitleEn,
            heroSubtitle: sourcePage.heroSubtitle,
            heroSubtitleEn: sourcePage.heroSubtitleEn,
            heroLogo: sourcePage.heroLogo,
            heroLogoSize: sourcePage.heroLogoSize,
            heroShowTitle: sourcePage.heroShowTitle,
            heroButtonLabel: sourcePage.heroButtonLabel,
            heroButtonLabelEn: sourcePage.heroButtonLabelEn,
            heroButtonLink: sourcePage.heroButtonLink,
        }
    });

    console.log('Successfully updated "about" page content to match!');

    // 3. Update the menu item for "Rólunk" to point to the clean "/about" slug instead of the long one
    const updatedMenu = await prisma.menuItem.updateMany({
        where: {
            path: '/folkfest-kulturalis-egyesulet'
        },
        data: {
            path: '/about'
        }
    });

    console.log(`Updated ${updatedMenu.count} menu item(s) to point to "/about".`);
    console.log('Synchronization completed successfully!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
