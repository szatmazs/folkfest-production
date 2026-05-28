'use client'

import { Project } from '@prisma/client'
import { deleteProject } from '@/app/actions/project-admin'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, Calendar, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ProjectList({ initialProjects }: { initialProjects: Project[] }) {
    const router = useRouter()
    const [projects, setProjects] = useState(initialProjects) // Ideally useOptimistic

    const handleDelete = async (id: string) => {
        if (!confirm('Biztosan törölni szeretnéd ezt a projektet?')) return
        await deleteProject(id)
        router.refresh()
        // Simple local update
        setProjects(projects.filter(p => p.id !== id))
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Projektek</h1>
                <Link href="/admin/projects/new">
                    <Button className="flex items-center gap-2 bg-black text-white hover:bg-gray-800">
                        <Plus className="w-4 h-4" /> Új Projekt
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {projects.map((project) => (
                    <div key={project.id} className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                            {project.mainImage ? (
                                <img src={project.mainImage} alt={project.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-gray-300">
                                    <ImageIcon className="w-6 h-6" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-grow min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{project.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(project.startDate).toLocaleDateString('hu-HU')}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Link href={`/admin/projects/${project.id}`}>
                                <Button variant="outline" size="sm" className="h-9 px-3">
                                    <Edit2 className="w-4 h-4 text-blue-600" />
                                </Button>
                            </Link>
                            <Button variant="outline" size="sm" className="h-9 px-3 hover:bg-red-50" onClick={() => handleDelete(project.id)}>
                                <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                        </div>
                    </div>
                ))}

                {projects.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                        Még nincs feltöltött projekt.
                    </div>
                )}
            </div>
        </div>
    )
}
