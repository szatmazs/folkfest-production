import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await hash('admin', 12)

    // Create default admin user
    const admin = await prisma.adminUser.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password,
        },
    })
    console.log('Created admin user:', admin.username)

    // Initialize HomeSettings
    const homeSettings = await prisma.homeSettings.upsert({
        where: { id: 1 },
        update: {}, // Keep existing if valid
        create: {
            heroSubtitle: 'Kulturális Egyesület',
            heroTitle: 'Hagyomány',
            heroTitleHighlight: 'Modern Formában',
            heroDescription: 'A FolkFest Kulturális Egyesület célja a Kárpát-medencei népi kultúra megőrzése és népszerűsítése.',
            missionTitle: 'Küldetésünk',
            missionDescription: 'Az egyesület célja a tehetséggondozás, a Kárpát-medencei népi kultúra népszerűsítése és a népművészeti értékek megőrzése. Kiemelt figyelmet fordítunk a fiatal generációk bevonására és a határon túli kapcsolatok ápolására.',
            activitiesTitle: 'Tevékenységek',
        },
    })
    console.log('Initialized Home Settings')

    // Initialize Menu Items
    const menuItems = [
        { label: 'Hírek', path: '/hirek', order: 1 },
        { label: 'Események', path: '/events', order: 2 },
        { label: 'Projektek', path: '/projects', order: 3 },
        { label: 'Kiadványok', path: '/kiadvanyok', order: 4 },
        { label: 'Rólunk', path: '/about', order: 5 },
        { label: 'Somló FolkFest', path: '/somlo-folkfest', order: 6 },
        { label: 'Kapcsolat', path: '/contact', order: 7 },
    ]

    for (const item of menuItems) {
        const existing = await prisma.menuItem.findFirst({ where: { path: item.path } })
        if (!existing) {
            await prisma.menuItem.create({ data: item })
        }
    }
    console.log('Initialized Menu Items')

    // Initialize Pages
    // 1. Somló FolkFest
    // Initialize Pages
    // 2. About Page (Rólunk)
    await prisma.page.upsert({
        where: { slug: 'about' },
        update: {},
        create: {
            title: 'Rólunk',
            slug: 'about',
            content: '[]'
        }
    })

    // Initialize Releases (Kiadványok)
    const releases = [
        {
            artist: 'FolkFest Band',
            title: 'Hagyományok Útján',
            year: 2024,
            coverUrl: '/releases/cover1.jpg',
            tracklist: '["Nyitány", "Somogyi táncok", "Kalotaszegi legényes", "Esti dal"]',
            streamingLinks: '{"spotify": "https://spotify.com", "apple": "https://apple.com"}'
        },
        {
            artist: 'Ifjú Tehetségek',
            title: 'Jövő Zenéje',
            year: 2023,
            coverUrl: '/releases/cover2.jpg',
            tracklist: '["Moldvai dallamok", "Széki lassú", "Friss csárdás"]',
            streamingLinks: '{"spotify": "https://spotify.com"}'
        }
    ]

    for (const release of releases) {
        // Simple check to avoid duplicates based on title
        const existing = await prisma.release.findFirst({ where: { title: release.title } })
        if (!existing) {
            await prisma.release.create({ data: release })
        }
    }
    console.log('Initialized Releases')

    // Initialize Partners (Partnerek)
    const partners = [
        { name: 'Nemzeti Kulturális Alap', logoUrl: '/partners/nka.png', websiteUrl: 'https://nka.hu' },
        { name: 'Csoóri Sándor Alap', logoUrl: '/partners/csoori.png', websiteUrl: 'https://csoorisandoralap.hu' },
        { name: 'Hagyományok Háza', logoUrl: '/partners/hagyomanyokhaza.png', websiteUrl: 'https://hagyomanyokhaza.hu' },
        { name: 'Bethlen Gábor Alap', logoUrl: '/partners/bga.png', websiteUrl: 'https://bgazrt.hu' }
    ]

    for (const partner of partners) {
        const existing = await prisma.partner.findFirst({ where: { name: partner.name } })
        if (!existing) {
            await prisma.partner.create({ data: partner })
        }
    }
    console.log('Initialized Partners')

    // Initialize Projects
    if ((await prisma.project.count()) === 0) {
        await prisma.project.create({
            data: {
                title: 'Népzenei Tehetséggondozás',
                slug: 'nepzenei-tehetseggondozas',
                description: 'Fiatal zenészek támogatása és képzése.',
                projectData: '<p>Részletes leírás a projektről...</p>',
                startDate: new Date(),
                mainImage: null
            }
        })
        console.log('Initialized Projects')
    }

    // Initialize Videos
    const videos = [
        {
            title: 'FolkFest 2023 Összefoglaló',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
            thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            description: 'A tavalyi év legjobb pillanatai.',
            featured: true
        },
        {
            title: 'Koncert a hegyen',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
            thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            description: 'Különleges koncertélmény.',
            featured: true
        },
        {
            title: 'Táncház',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
            thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            description: 'Hajnalig tartó mulatság.',
            featured: true
        }
    ]

    for (const video of videos) {
        const existing = await prisma.video.findFirst({ where: { title: video.title } })
        if (!existing) {
            await prisma.video.create({ data: video })
        }
    }
    console.log('Initialized Videos')


}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
