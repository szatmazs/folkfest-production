import { prisma } from "@/lib/prisma"
import PartnerList from "./partner-list"

export const dynamic = 'force-dynamic'

export default async function PartnersPage() {
    const partners = await prisma.partner.findMany({
        orderBy: { createdAt: 'desc' },
    })

    return <PartnerList initialPartners={partners} />
}
