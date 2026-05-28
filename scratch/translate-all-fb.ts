import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const prisma = new PrismaClient()

import { translateText } from '../src/lib/translate'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function translateWithRetry(text: string, lang: string, maxRetries = 3): Promise<string> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await translateText(text, lang);
        } catch (e: any) {
            if (e.message?.includes('429') && i < maxRetries - 1) {
                const wait = (i + 1) * 5000; // 5s, 10s, 15s...
                console.log(`  429 detected. Retrying in ${wait/1000}s... (Attempt ${i+1}/${maxRetries})`);
                await sleep(wait);
                continue;
            }
            throw e;
        }
    }
    throw new Error('Max retries reached');
}

async function translateAll() {
    console.log('Fetching untranslated posts...')
    const posts = await prisma.facebookPost.findMany()
    
    console.log(`Checking ${posts.length} posts for translation needs...`)

    let translatedCount = 0;
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        let updates: any = {}
        
        try {
            const needsTranslate = (valEn: any, valHu: any) => {
                if (!valHu) return false;
                if (!valEn || valEn === valHu) return true;
                if (typeof valEn === 'string' && (valEn.includes('&quot;') || valEn.includes('&amp;') || valEn.includes('&lt;') || valEn.includes('&gt;') || valEn.includes('&#'))) return true;
                // Force check: if it contains Hungarian words (heuristic)
                if (typeof valEn === 'string' && (valEn.includes('és') || valEn.includes('népzene') || valEn.includes('fesztivál'))) return true;
                return false;
            };

            const isUrlOnly = (text: string | null) => {
                if (!text) return true;
                return /^(http|https):\/\/[^ "]+$/.test(text.trim());
            };

            // 1. Translate Message
            if (post.message && needsTranslate(post.messageEn, post.message)) {
                updates.messageEn = await translateWithRetry(post.message, 'en')
            }

            // 2. Translate Custom Title
            if (post.customTitle && needsTranslate(post.customTitleEn, post.customTitle)) {
                updates.customTitleEn = await translateWithRetry(post.customTitle, 'en')
            }

            // 3. Handle Attachments
            if (post.attachments) {
                try {
                    const parsed = JSON.parse(post.attachments);
                    const item = parsed.data?.[0];
                    if (item) {
                        let changed = false;
                        if (item.title && (!item.titleEn || item.titleEn === item.title)) {
                            item.titleEn = await translateWithRetry(item.title, 'en');
                            changed = true;
                        }
                        if (item.description && (!item.descriptionEn || item.descriptionEn === item.description)) {
                            item.descriptionEn = await translateWithRetry(item.description, 'en');
                            changed = true;
                        }
                        
                        if (changed) {
                            updates.attachments = JSON.stringify(parsed);
                        }

                        // ALWAYS ensure messageEn is populated if it's currently a URL or missing
                        if (isUrlOnly(post.messageEn) || !post.messageEn) {
                            const combined = `${item.titleEn || item.title || ''}\n\n${item.descriptionEn || item.description || ''}`.trim();
                            if (combined && combined !== post.messageEn) {
                                updates.messageEn = combined;
                            }
                        }
                    }
                } catch (e) {
                    console.error(`  Failed to parse/translate attachments for ${post.id}:`, e);
                }
            }

            if (Object.keys(updates).length > 0) {
                console.log(`[${i + 1}/${posts.length}] Translating post ${post.id.substring(0, 8)}...`)
                await prisma.facebookPost.update({
                    where: { id: post.id },
                    data: updates
                })
                console.log(`  Success: ${Object.keys(updates).join(', ')}`)
                translatedCount++;
                await sleep(2000); // Base delay after success
            }
        } catch (e) {
            console.error(`  Failed to translate post ${post.id}:`, e)
        }
    }

    console.log(`Translation finished. Translated ${translatedCount} posts.`)
}

translateAll()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
