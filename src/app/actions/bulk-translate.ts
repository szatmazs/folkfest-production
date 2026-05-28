'use server'

import { prisma } from '@/lib/prisma'
import { translateText, translateJsonBlocks } from '@/lib/translate'
import { revalidatePath } from 'next/cache'

export async function bulkTranslateAction() {
    console.log('[BulkTranslate] Starting bulk translation...')
    
    const counts = {
        pages: 0,
        projects: 0,
        results: 0,
        videos: 0,
        posts: 0,
        events: 0,
        menu: 0,
        releases: 0,
        slides: 0,
        settings: 0
    }

    try {
        console.log('[BulkTranslate] Starting sequential translation...')

        // 1. Menu Items (Critical)
        const menuItems = await prisma.menuItem.findMany()
        for (const item of menuItems) {
            try {
                if ((!item.labelEn || item.labelEn === item.label) && item.label) {
                    const translated = await translateText(item.label, 'en')
                    await prisma.menuItem.update({
                        where: { id: item.id },
                        data: { labelEn: translated }
                    })
                    counts.menu++
                    console.log(`[BulkTranslate] Translated menu: ${item.label} -> ${translated}`)
                }
            } catch (e) { console.error(`Failed to translate menu ${item.id}:`, e) }
        }

        // 2. Settings (Critical)
        const [homeSettings, contactSettings, footerSettings] = await Promise.all([
            prisma.homeSettings.findFirst(),
            prisma.contactSettings.findFirst(),
            prisma.footerSettings.findFirst()
        ])

        if (homeSettings) {
            const updates: any = {}
            const fields = ['heroSubtitle', 'heroTitle', 'heroTitleHighlight', 'heroLeftButtonLabel', 'heroRightButtonLabel', 'heroDescription', 'missionTitle', 'missionDescription', 'activitiesTitle']
            for (const f of fields) {
                const val = (homeSettings as any)[f]
                const valEn = (homeSettings as any)[`${f}En`]
                if (!valEn || valEn === val) {
                    if (val) updates[`${f}En`] = await translateText(val, 'en')
                }
            }
            if (homeSettings.sections) {
                try {
                    const sections = JSON.parse(homeSettings.sections)
                    let modified = false
                    for (const section of sections) {
                        if (section.title && (!section.titleEn || section.titleEn === section.title)) {
                            section.titleEn = await translateText(section.title, 'en')
                            modified = true
                        }
                        if (section.buttonLabel && (!section.buttonLabelEn || section.buttonLabelEn === section.buttonLabel)) {
                            section.buttonLabelEn = await translateText(section.buttonLabel, 'en')
                            modified = true
                        }
                    }
                    if (modified) updates.sections = JSON.stringify(sections)
                } catch (e) { console.error('Failed to translate home sections:', e) }
            }
            if (Object.keys(updates).length > 0) {
                await prisma.homeSettings.update({ where: { id: homeSettings.id }, data: updates })
                counts.settings++
            }
        }

        if (contactSettings) {
            const updates: any = {}
            const needsTranslate = (valEn: any, valHu: any) => !valEn || valEn === valHu;
            if (needsTranslate(contactSettings.footerInfoEn, contactSettings.footerInfo) && contactSettings.footerInfo) updates.footerInfoEn = await translateText(contactSettings.footerInfo, 'en')
            if (needsTranslate(contactSettings.heroTitleEn, contactSettings.heroTitle) && contactSettings.heroTitle) updates.heroTitleEn = await translateText(contactSettings.heroTitle, 'en')
            if (needsTranslate(contactSettings.heroSubtitleEn, contactSettings.heroSubtitle) && contactSettings.heroSubtitle) updates.heroSubtitleEn = await translateText(contactSettings.heroSubtitle, 'en')
            if (Object.keys(updates).length > 0) {
                await prisma.contactSettings.update({ where: { id: contactSettings.id }, data: updates })
                counts.settings++
            }
        }

        if (footerSettings) {
            const updates: any = {}
            const needsTranslate = (valEn: any, valHu: any) => !valEn || valEn === valHu || (typeof valEn === 'string' && valEn.includes('&quot;'));
            if (needsTranslate(footerSettings.brandContentEn, footerSettings.brandContent) && footerSettings.brandContent) updates.brandContentEn = await translateJsonBlocks(footerSettings.brandContent, 'en')
            if (needsTranslate(footerSettings.contactContentEn, footerSettings.contactContent) && footerSettings.contactContent) updates.contactContentEn = await translateJsonBlocks(footerSettings.contactContent, 'en')
            if (needsTranslate(footerSettings.socialContentEn, footerSettings.socialContent) && footerSettings.socialContent) updates.socialContentEn = await translateJsonBlocks(footerSettings.socialContent, 'en')
            if (needsTranslate(footerSettings.bottomTextEn, footerSettings.bottomText) && footerSettings.bottomText) updates.bottomTextEn = await translateText(footerSettings.bottomText, 'en')
            if (Object.keys(updates).length > 0) {
                await prisma.footerSettings.update({ where: { id: footerSettings.id }, data: updates })
                counts.settings++
            }
        }

        // 3. Projects
        const projects = await prisma.project.findMany()
        for (const project of projects) {
            try {
                const updates: any = {}
                const needsTranslate = (valEn: any, valHu: any) => !valEn || valEn === valHu || (typeof valEn === 'string' && valEn.includes('&quot;'));
                if (needsTranslate(project.titleEn, project.title) && project.title) updates.titleEn = await translateText(project.title, 'en')
                if (needsTranslate(project.descriptionEn, project.description) && project.description && project.description !== '[]') updates.descriptionEn = await translateJsonBlocks(project.description, 'en')
                if (needsTranslate(project.contentEn, project.projectData) && project.projectData) updates.contentEn = await translateText(project.projectData, 'en')
                if (Object.keys(updates).length > 0) {
                    await prisma.project.update({ where: { id: project.id }, data: updates })
                    counts.projects++
                }
            } catch (e) { console.error(`Failed to translate project ${project.id}:`, e) }
        }

        // 4. Pages
        const pages = await prisma.page.findMany()
        for (const page of pages) {
            try {
                const updates: any = {}
                const needsTranslate = (valEn: any, valHu: any) => !valEn || valEn === valHu || (typeof valEn === 'string' && valEn.includes('&quot;'));
                if (needsTranslate(page.titleEn, page.title) && page.title) updates.titleEn = await translateText(page.title, 'en')
                if (needsTranslate(page.contentEn, page.content) && page.content && page.content !== '[]') updates.contentEn = await translateJsonBlocks(page.content, 'en')
                if (needsTranslate(page.heroTitleEn, page.heroTitle) && page.heroTitle) updates.heroTitleEn = await translateText(page.heroTitle, 'en')
                if (needsTranslate(page.heroSubtitleEn, page.heroSubtitle) && page.heroSubtitle) updates.heroSubtitleEn = await translateText(page.heroSubtitle, 'en')
                if (needsTranslate(page.heroButtonLabelEn, page.heroButtonLabel) && page.heroButtonLabel) updates.heroButtonLabelEn = await translateText(page.heroButtonLabel, 'en')
                if (Object.keys(updates).length > 0) {
                    await prisma.page.update({ where: { id: page.id }, data: updates })
                    counts.pages++
                }
            } catch (e) { console.error(`Failed to translate page ${page.id}:`, e) }
        }

        // 5. Videos — titles and descriptions are NOT translated (kept in original language)
        // const videos = await prisma.video.findMany()
        // ... skipped intentionally

        // 6. Project Results
        const results = await prisma.projectResult.findMany()
        for (const res of results) {
            try {
                const updates: any = {}
                const needsTranslate = (valEn: any, valHu: any) => !valEn || valEn === valHu;
                if (needsTranslate(res.labelEn, res.label) && res.label) updates.labelEn = await translateText(res.label, 'en')
                if (needsTranslate(res.contentEn, res.content) && res.content && res.type === 'text') updates.contentEn = await translateText(res.content, 'en')
                if (Object.keys(updates).length > 0) {
                    await prisma.projectResult.update({ where: { id: res.id }, data: updates })
                    counts.results++
                }
            } catch (e) { console.error(`Failed to translate project result ${res.id}:`, e) }
        }

        // 7. Releases — titles are NOT translated (kept in original language)
        // const releases = await prisma.release.findMany()
        // ... skipped intentionally

        // 8. Slider
        const slides = await prisma.heroSlide.findMany()
        for (const slide of slides) {
            try {
                const updates: any = {}
                const needsTranslate = (valEn: any, valHu: any) => !valEn || valEn === valHu;
                if (needsTranslate(slide.titleEn, slide.title) && slide.title) updates.titleEn = await translateText(slide.title, 'en')
                if (needsTranslate(slide.subtitleEn, slide.subtitle) && slide.subtitle) updates.subtitleEn = await translateText(slide.subtitle, 'en')
                if (needsTranslate(slide.titleHighlightEn, slide.titleHighlight) && slide.titleHighlight) updates.titleHighlightEn = await translateText(slide.titleHighlight, 'en')
                if (needsTranslate(slide.leftButtonLabelEn, slide.leftButtonLabel) && slide.leftButtonLabel) updates.leftButtonLabelEn = await translateText(slide.leftButtonLabel, 'en')
                if (needsTranslate(slide.rightButtonLabelEn, slide.rightButtonLabel) && slide.rightButtonLabel) updates.rightButtonLabelEn = await translateText(slide.rightButtonLabel, 'en')
                if (Object.keys(updates).length > 0) {
                    await prisma.heroSlide.update({ where: { id: slide.id }, data: updates })
                    counts.slides++
                }
            } catch (e) { }
        }

        // 9. Facebook Events
        const fbEvents = await prisma.facebookEvent.findMany()
        for (const event of fbEvents) {
            try {
                const updates: any = {}
                const needsTranslate = (valEn: any, valHu: any) => !valEn || valEn === valHu;
                if (needsTranslate(event.nameEn, event.name) && event.name) updates.nameEn = await translateText(event.name, 'en')
                if (needsTranslate(event.descriptionEn, event.description) && event.description) updates.descriptionEn = await translateText(event.description, 'en')
                if (needsTranslate(event.placeEn, event.place) && event.place) updates.placeEn = await translateText(event.place, 'en')
                if (Object.keys(updates).length > 0) {
                    await prisma.facebookEvent.update({ where: { id: event.id }, data: updates })
                    counts.events++
                }
            } catch (e) { console.error(`Failed to translate event ${event.id}:`, e) }
        }

        // 10. Facebook Posts (LAST - heaviest)
        const posts = await prisma.facebookPost.findMany({
            orderBy: { createdTime: 'desc' },
            take: 50 // Only last 50 to fit in timeout
        })
        for (const post of posts) {
            try {
                const updates: any = {}
                const needsTranslate = (valEn: any, valHu: any) => !valEn || valEn === valHu;
                if (needsTranslate(post.messageEn, post.message) && post.message) updates.messageEn = await translateText(post.message, 'en')
                if (needsTranslate(post.customTitleEn, post.customTitle) && post.customTitle) updates.customTitleEn = await translateText(post.customTitle, 'en')
                if (Object.keys(updates).length > 0) {
                    await prisma.facebookPost.update({ where: { id: post.id }, data: updates })
                    counts.posts++
                }
            } catch (e) { console.error(`Failed to translate post ${post.id}:`, e) }
        }

        revalidatePath('/', 'layout')
        console.log('[BulkTranslate] Bulk translation finished successfully. Counts:', counts)
        return { success: true, counts }
    } catch (error) {
        console.error('[BulkTranslate] Error:', error)
        return { success: false, error: String(error) }
    }
}
