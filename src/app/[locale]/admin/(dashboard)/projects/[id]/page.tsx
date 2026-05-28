import { getProject } from '@/app/actions/project-admin'
import { ProjectForm } from '../project-form'
import { notFound } from 'next/navigation'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = await getProject(id)

    if (!project) return notFound()

    return <ProjectForm project={project} />
}
