import { prisma } from "@/lib/prisma"
import SliderList from "./slider-list"

export const dynamic = 'force-dynamic'

export default async function SlidersPage() {
    const slides = await prisma.heroSlide.findMany({
        orderBy: { order: 'asc' },
    })

    return <SliderList initialSlides={slides} />
}
