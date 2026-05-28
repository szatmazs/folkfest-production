'use client'

import { Page } from '@prisma/client'
import { deletePage } from '@/app/actions/page-admin'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, FileText } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PageList({ initialPages }: { initialPages: Page[] }) {
    const router = useRouter()
    const [pages, setPages] = useState(initialPages)

    const handleDelete = async (id: string) => {
        if (!confirm('Biztosan törölni szeretnéd ezt az oldalt?')) return
        await deletePage(id)
        router.refresh()
        setPages(pages.filter(p => p.id !== id))
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Oldalak</h1>
                <Link href="/admin/pages/new">
                    <Button className="flex items-center gap-2 bg-black text-white hover:bg-gray-800">
                        <Plus className="w-4 h-4" /> Új Oldal
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {pages.map((page) => (
                    <div key={page.id} className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-50 rounded flex items-center justify-center text-purple-600">
                            <FileText className="w-6 h-6" />
                        </div>

                        <div className="flex-grow min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{page.title}</h3>
                            <p className="text-sm text-gray-500">/{page.slug}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link href={`/admin/pages/${page.id}`}>
                                <Button variant="outline" size="sm" className="h-9 px-3">
                                    <Edit2 className="w-4 h-4 text-blue-600" />
                                </Button>
                            </Link>
                            <Button variant="outline" size="sm" className="h-9 px-3 hover:bg-red-50" onClick={() => handleDelete(page.id)}>
                                <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
