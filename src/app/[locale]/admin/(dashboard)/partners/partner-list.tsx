'use client'

import { useState } from 'react'
import { Partner } from '@prisma/client'
import { createPartner, deletePartner, updatePartner } from '@/app/actions/partner-admin'
import { Trash2, Edit2, Plus, ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { MediaPicker } from '@/components/admin/media/media-picker'
import Image from 'next/image'

export default function PartnerList({ initialPartners }: { initialPartners: Partner[] }) {
    const [partners, setPartners] = useState<Partner[]>(initialPartners)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        websiteUrl: '',
        logoUrl: ''
    })

    const openCreateModal = () => {
        setEditingPartner(null)
        setFormData({ name: '', websiteUrl: '', logoUrl: '' })
        setIsModalOpen(true)
    }

    const openEditModal = (partner: Partner) => {
        setEditingPartner(partner)
        setFormData({
            name: partner.name,
            websiteUrl: partner.websiteUrl || '',
            logoUrl: partner.logoUrl || ''
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const data = new FormData()
        data.append('name', formData.name)
        data.append('websiteUrl', formData.websiteUrl)
        data.append('logoUrl', formData.logoUrl)

        try {
            if (editingPartner) {
                await updatePartner(editingPartner.id, data)
            } else {
                await createPartner(data)
            }
            window.location.reload()
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
            setIsModalOpen(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Biztosan törölni szeretnéd ezt a partnert?')) return
        await deletePartner(id)
        window.location.reload()
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Partnerek Kezelése</h1>
                <Button onClick={openCreateModal} className="flex items-center gap-2 bg-black text-white hover:bg-gray-800">
                    <Plus className="w-4 h-4" /> Új Partner
                </Button>
            </div>

            <MediaPicker 
                open={isMediaPickerOpen} 
                onOpenChange={setIsMediaPickerOpen} 
                onSelect={(url) => setFormData(prev => ({ ...prev, logoUrl: url }))} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map((partner) => (
                    <div key={partner.id} className="bg-white rounded-lg shadow-sm border p-4 flex flex-col items-center">
                        <div className="relative w-full h-32 mb-4">
                            <Image
                                src={partner.logoUrl}
                                alt={partner.name}
                                fill
                                unoptimized
                                className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                            />
                        </div>
                        <h3 className="font-bold text-lg mb-1">{partner.name}</h3>
                        {partner.websiteUrl && <a href={partner.websiteUrl} target="_blank" className="text-sm text-blue-600 mb-4 truncate max-w-full hover:underline">{partner.websiteUrl}</a>}

                        <div className="flex justify-end gap-2 pt-4 border-t mt-auto w-full">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(partner)}>
                                <Edit2 className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(partner.id)} className="hover:bg-red-50">
                                <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-1">
                    <h2 className="text-xl font-bold mb-4">{editingPartner ? 'Partner Szerkesztése' : 'Új Partner'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Név</label>
                            <input
                                type="text"
                                required
                                className="w-full border rounded px-3 py-2"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Weboldal (opcionális)</label>
                            <input
                                type="url"
                                className="w-full border rounded px-3 py-2"
                                value={formData.websiteUrl}
                                onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Logó</label>
                            
                            {formData.logoUrl && (
                                <div className="h-24 w-32 rounded-lg border overflow-hidden relative group bg-gray-50 flex items-center justify-center p-2 mb-2">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={formData.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    required
                                    readOnly
                                    placeholder="Válassz ki egy logót a médiatárból"
                                    className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                                    value={formData.logoUrl}
                                />
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setIsMediaPickerOpen(true)}
                                    className="shrink-0 gap-2 border-dashed border-gray-400 hover:border-black"
                                >
                                    <ImagePlus className="w-4 h-4" />
                                    Médiatár
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Mégse</Button>
                            <Button type="submit" className="bg-black text-white hover:bg-gray-800" disabled={isLoading}>
                                {isLoading ? 'Mentés...' : 'Mentés'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    )
}
