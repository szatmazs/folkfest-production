"use server";

import { prisma } from "@/lib/prisma";
import { scrapeLandrRelease } from "@/lib/scraper";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { translateText } from "@/lib/translate";
import { downloadFacebookImage } from "@/lib/download-image";

export async function autoTranslateReleaseAction(text: string) {
    return await translateText(text, 'en')
}

export async function scrapeReleaseAction(url: string) {
    if (!url) return { success: false, error: "URL is required" };
    try {
        const data = await scrapeLandrRelease(url);
        if (!data) return { success: false, error: "Failed to scrape data" };
        return { success: true, data };
    } catch (error) {
        console.error("Scrape action error:", error);
        return { success: false, error: "Failed to scrape data" };
    }
}

export async function createReleaseAction(prevState: any, formData: FormData) {
    const artist = formData.get("artist") as string;
    const title = formData.get("title") as string;
    const year = parseInt(formData.get("year") as string);
    const coverUrl = formData.get("coverUrl") as string;
    const promoLink = formData.get("promoLink") as string;

    const id = crypto.randomUUID();

    // Parse JSON fields
    let tracklist = "[]";
    let streamingLinks = "{}";

    try {
        const tracklistRaw = formData.get("tracklist") as string;
        JSON.parse(tracklistRaw);
        tracklist = tracklistRaw;
    } catch (e) {
        console.error("Invalid tracklist JSON", e);
    }

    try {
        const streamingLinksRaw = formData.get("streamingLinks") as string;
        JSON.parse(streamingLinksRaw);
        streamingLinks = streamingLinksRaw;
    } catch (e) {
        console.error("Invalid streamingLinks JSON", e);
    }

    let titleEn = formData.get("titleEn") as string;
    if (!titleEn && title) titleEn = await translateText(title, 'en');

    let finalCoverUrl = coverUrl;
    if (coverUrl && coverUrl.startsWith('http')) {
        const localPath = await downloadFacebookImage(coverUrl, id, 'covers');
        if (localPath) finalCoverUrl = localPath;
    }

    try {
        await prisma.release.create({
            data: {
                id,
                artist,
                title,
                titleEn: titleEn || null,
                year,
                coverUrl: finalCoverUrl,
                promoLink,
                tracklist,
                streamingLinks
            }
        });
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, message: "Database Error: Failed to Create Release." };
    }
}

export async function updateReleaseAction(id: string, prevState: any, formData: FormData) {
    const artist = formData.get("artist") as string;
    const title = formData.get("title") as string;
    const year = parseInt(formData.get("year") as string);
    const coverUrl = formData.get("coverUrl") as string;
    const promoLink = formData.get("promoLink") as string;

    let tracklist = "[]";
    let streamingLinks = "{}";

    try {
        tracklist = formData.get("tracklist") as string;
        JSON.parse(tracklist);
    } catch (e) { console.error("Invalid tracklist JSON", e); }

    try {
        streamingLinks = formData.get("streamingLinks") as string;
        JSON.parse(streamingLinks);
    } catch (e) { console.error("Invalid streamingLinks JSON", e); }

    let titleEn = formData.get("titleEn") as string;
    if (!titleEn && title) titleEn = await translateText(title, 'en');

    let finalCoverUrl = coverUrl;
    if (coverUrl && coverUrl.startsWith('http')) {
        const localPath = await downloadFacebookImage(coverUrl, id, 'covers');
        if (localPath) finalCoverUrl = localPath;
    }

    try {
        await prisma.release.update({
            where: { id },
            data: {
                artist,
                title,
                titleEn: titleEn || null,
                year,
                coverUrl: finalCoverUrl,
                promoLink,
                tracklist,
                streamingLinks
            }
        });
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, message: "Database Error: Failed to Update Release." };
    }
}

export async function deleteReleaseAction(id: string) {
    try {
        await prisma.release.delete({
            where: { id }
        });
        revalidatePath("/", "layout");
        return { success: true, message: "Deleted Release." };
    } catch (error) {
        return { success: false, message: "Database Error: Failed to Delete Release." };
    }
}
