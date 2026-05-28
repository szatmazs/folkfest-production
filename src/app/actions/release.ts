"use server"

import { prisma } from "@/lib/prisma"

export async function getReleases() {
    try {
        const releases = await prisma.release.findMany({
            orderBy: {
                year: 'desc'
            }
        });
        return { success: true, releases };
    } catch (error) {
        console.error("Failed to fetch releases:", error);
        return { success: false, error: "Failed to fetch releases" };
    }
}
