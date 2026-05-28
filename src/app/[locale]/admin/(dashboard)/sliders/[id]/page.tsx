import { getSlide } from "@/app/actions/slider-admin"
import SliderForm from "../slider-form"
import { notFound } from "next/navigation"

export default async function EditSlidePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    // Await params to support both Next.js 14 and Next.js 15+ promise-based params
    const resolvedParams = await Promise.resolve(params);

    if (resolvedParams.id === 'new') {
        return <SliderForm />
    }

    const res = await getSlide(resolvedParams.id)
    if (!res.success || !res.slide) {
        notFound()
    }

    return <SliderForm slide={res.slide} />
}
