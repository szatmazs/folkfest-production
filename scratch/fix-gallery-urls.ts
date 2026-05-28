import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const prisma = new PrismaClient()

// Fixes corrupted image URLs in gallery blocks where the ordinal converter
// turned e.g. "image.6.jpg" into "image.6thjpg"
function fixCorruptedImageUrls(jsonStr: string): { fixed: string, changed: boolean } {
    try {
        const blocks = JSON.parse(jsonStr)
        if (!Array.isArray(blocks)) return { fixed: jsonStr, changed: false }
        
        let changed = false
        const fixedBlocks = blocks.map((block: any) => {
            if (block.type === 'gallery' && Array.isArray(block.images)) {
                const fixedImages = block.images.map((url: string) => {
                    // Fix patterns like "filename123thjpg" → "filename123.jpg"
                    // Also "filename123ndjpg" → "filename123.jpg" etc.
                    const fixed = url
                        .replace(/(\d+)(st|nd|rd|th)(jpg|jpeg|png|webp|gif)$/i, '$1.$3')
                        .replace(/(\d+)(st|nd|rd|th)\.(jpg|jpeg|png|webp|gif)$/i, '$1.$3')
                    if (fixed !== url) {
                        console.log(`  Fixed URL: ${url} → ${fixed}`)
                        changed = true
                    }
                    return fixed
                })
                return { ...block, images: fixedImages }
            }
            return block
        })
        
        return { fixed: JSON.stringify(fixedBlocks), changed }
    } catch {
        return { fixed: jsonStr, changed: false }
    }
}

async function repairGalleryUrls() {
    console.log('=== Repairing corrupted gallery image URLs ===\n')
    
    // Fix projects
    const projects = await prisma.project.findMany({
        select: { id: true, title: true, descriptionEn: true }
    })
    
    for (const p of projects) {
        if (!p.descriptionEn) continue
        const { fixed, changed } = fixCorruptedImageUrls(p.descriptionEn)
        if (changed) {
            console.log(`Project: ${p.title}`)
            await prisma.project.update({
                where: { id: p.id },
                data: { descriptionEn: fixed }
            })
            console.log('  ✓ Updated\n')
        }
    }
    
    // Fix pages (they also use blocks)
    const pages = await prisma.page.findMany({
        select: { id: true, title: true, contentEn: true }
    })
    
    for (const pg of pages) {
        if (!pg.contentEn) continue
        const { fixed, changed } = fixCorruptedImageUrls(pg.contentEn)
        if (changed) {
            console.log(`Page: ${pg.title}`)
            await prisma.page.update({
                where: { id: pg.id },
                data: { contentEn: fixed }
            })
            console.log('  ✓ Updated\n')
        }
    }
    
    console.log('=== Done ===')
}

repairGalleryUrls()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
