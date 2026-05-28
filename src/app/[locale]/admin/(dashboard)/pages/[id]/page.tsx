import { getPage } from '@/app/actions/page-admin'
import { PageForm } from '../page-form'
import { notFound } from 'next/navigation'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const page = await getPage(id)

    if (!page) return notFound()

    return <PageForm page={page} />
}
