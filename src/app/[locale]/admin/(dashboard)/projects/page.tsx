import { getProjects } from '@/app/actions/project-admin'
import { ProjectList } from './project-list'

export default async function ProjectsPage() {
    const projects = await getProjects()

    return <ProjectList initialProjects={projects} />
}
