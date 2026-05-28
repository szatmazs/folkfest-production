import { prisma } from "@/lib/prisma";
import { ReleaseForm } from "../release-form";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditReleasePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const release = await prisma.release.findUnique({
        where: { id }
    });

    if (!release) return notFound();

    return <ReleaseForm initialData={release} />
}
