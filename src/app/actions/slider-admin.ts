"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { translateText } from "@/lib/translate";

export async function getSlides() {
    try {
        const slides = await prisma.heroSlide.findMany({
            orderBy: { order: 'asc' }
        });
        return { success: true, slides };
    } catch (error) {
        console.error("Error fetching slides:", error);
        return { success: false, error: "Nem sikerült a betöltés" };
    }
}

export async function getSlide(id: string) {
    try {
        const slide = await prisma.heroSlide.findUnique({
            where: { id }
        });
        return { success: true, slide };
    } catch (error) {
        console.error("Error fetching slide:", error);
        return { success: false, error: "Nem sikerült a betöltés" };
    }
}

export async function saveSlide(formData: FormData) {
    try {
        const id = formData.get("id") as string;
        const isActive = formData.get("isActive") === "true";
        const backgroundType = formData.get("backgroundType") as string;
        const imageUrl = formData.get("imageUrl") as string;
        const videoUrl = formData.get("videoUrl") as string;
        const youtubeUrl = formData.get("youtubeUrl") as string;
        const youtubeStart = parseInt(formData.get("youtubeStart") as string) || 0;
        const youtubeEnd = parseInt(formData.get("youtubeEnd") as string) || 0;

        const title = formData.get("title") as string;
        let titleEn = formData.get("titleEn") as string;
        if (!titleEn && title) titleEn = await translateText(title, 'en');

        const subtitle = formData.get("subtitle") as string;
        let subtitleEn = formData.get("subtitleEn") as string;
        if (!subtitleEn && subtitle) subtitleEn = await translateText(subtitle, 'en');

        const titleHighlight = formData.get("titleHighlight") as string;
        let titleHighlightEn = formData.get("titleHighlightEn") as string;
        if (!titleHighlightEn && titleHighlight) titleHighlightEn = await translateText(titleHighlight, 'en');

        const leftButtonLabel = formData.get("leftButtonLabel") as string;
        let leftButtonLabelEn = formData.get("leftButtonLabelEn") as string;
        if (!leftButtonLabelEn && leftButtonLabel) leftButtonLabelEn = await translateText(leftButtonLabel, 'en');

        const leftButtonLink = formData.get("leftButtonLink") as string;
        const leftButtonIcon = formData.get("leftButtonIcon") as string;

        const rightButtonLabel = formData.get("rightButtonLabel") as string;
        let rightButtonLabelEn = formData.get("rightButtonLabelEn") as string;
        if (!rightButtonLabelEn && rightButtonLabel) rightButtonLabelEn = await translateText(rightButtonLabel, 'en');

        const rightButtonLink = formData.get("rightButtonLink") as string;
        const rightButtonIcon = formData.get("rightButtonIcon") as string;
        const logoUrl = formData.get("logoUrl") as string;
        const logoUrlEn = formData.get("logoUrlEn") as string;

        const data = {
            isActive,
            backgroundType,
            imageUrl: imageUrl || null,
            videoUrl: videoUrl || null,
            youtubeUrl: youtubeUrl || null,
            youtubeStart,
            youtubeEnd,
            logoUrl: logoUrl || null,
            logoUrlEn: logoUrlEn || null,
            title: title || null,
            titleEn: titleEn || null,
            subtitle: subtitle || null,
            subtitleEn: subtitleEn || null,
            titleHighlight: titleHighlight || null,
            titleHighlightEn: titleHighlightEn || null,
            leftButtonLabel: leftButtonLabel || null,
            leftButtonLabelEn: leftButtonLabelEn || null,
            leftButtonLink: leftButtonLink || null,
            leftButtonIcon: leftButtonIcon || null,
            rightButtonLabel: rightButtonLabel || null,
            rightButtonLabelEn: rightButtonLabelEn || null,
            rightButtonLink: rightButtonLink || null,
            rightButtonIcon: rightButtonIcon || null,
        };

        if (id) {
            await prisma.heroSlide.update({
                where: { id },
                data
            });
        } else {
            // Get highest order
            const lastSlide = await prisma.heroSlide.findFirst({
                orderBy: { order: 'desc' }
            });
            const newOrder = lastSlide ? lastSlide.order + 1 : 0;

            await prisma.heroSlide.create({
                data: {
                    ...data,
                    order: newOrder
                }
            });
        }

        revalidatePath('/');
        revalidatePath('/admin/sliders');
        
        return { success: true };
    } catch (error) {
        console.error("Error saving slide:", error);
        return { success: false, error: "Mentés sikertelen" };
    }
}

export async function deleteSlide(id: string) {
    try {
        await prisma.heroSlide.delete({
            where: { id }
        });
        revalidatePath('/');
        revalidatePath('/admin/sliders');
        return { success: true };
    } catch (error) {
        console.error("Error deleting slide:", error);
        return { success: false, error: "Törlés sikertelen" };
    }
}

export async function reorderSlides(slideIds: string[]) {
    try {
        await prisma.$transaction(
            slideIds.map((id, index) => 
                prisma.heroSlide.update({
                    where: { id },
                    data: { order: index }
                })
            )
        );
        revalidatePath('/');
        revalidatePath('/admin/sliders');
        return { success: true };
    } catch (error) {
        console.error("Error reordering slides:", error);
        return { success: false, error: "Sorrend mentése sikertelen" };
    }
}

export async function autoTranslateSliderAction(text: string) {
    return await translateText(text, 'en');
}
