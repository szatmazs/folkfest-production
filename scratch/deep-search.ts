import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deepSearch() {
    const query = 'Somló FolkFest'
    console.log(`Deep searching for "${query}"...`)

    // 1. Projects
    const projects = await prisma.project.findMany({
        where: { OR: [{ title: { contains: query } }, { projectData: { contains: query } }] }
    })
    console.log(`Projects: ${projects.length}`)
    projects.forEach(p => console.log(`  - Project: ${p.title}`))

    // 2. Facebook Posts
    const posts = await prisma.facebookPost.findMany({
        where: { OR: [{ message: { contains: query } }, { customTitle: { contains: query } }] }
    })
    console.log(`Facebook Posts: ${posts.length}`)

    // 3. Facebook Events
    const events = await prisma.facebookEvent.findMany({
        where: { OR: [{ name: { contains: query } }, { description: { contains: query } }] }
    })
    console.log(`Facebook Events: ${events.length}`)
    events.forEach(e => console.log(`  - Event: ${e.name}`))

    // 4. Releases
    const releases = await prisma.release.findMany({
        where: { title: { contains: query } }
    })
    console.log(`Releases: ${releases.length}`)

    // 5. Pages
    const pages = await prisma.page.findMany({
        where: { OR: [{ title: { contains: query } }, { content: { contains: query } }] }
    })
    console.log(`Pages: ${pages.length}`)

    // 6. Project Results
    const results = await prisma.projectResult.findMany({
        where: { OR: [{ label: { contains: query } }, { content: { contains: query } }] }
    })
    console.log(`Project Results: ${results.length}`)
    results.forEach(r => console.log(`  - Result: ${r.label} (Content: ${r.content?.substring(0,30)})`))

    // 7. Hero Slides
    const slides = await prisma.heroSlide.findMany({
        where: { OR: [{ title: { contains: query } }, { subtitle: { contains: query } }] }
    })
    console.log(`Hero Slides: ${slides.length}`)
}

deepSearch()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
