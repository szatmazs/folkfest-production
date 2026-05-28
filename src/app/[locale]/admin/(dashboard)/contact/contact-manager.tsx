'use client'

import { useState } from 'react'
import { ContactBlock, ContactSettings } from '@prisma/client'
import {
    addContactBlock,
    updateContactBlock,
    deleteContactBlock,
    updateContactSettings
} from '@/app/actions/contact-admin'
import { uploadMedia } from '@/app/actions/media-upload'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    MapPin, Mail, Phone, Globe, Clock,
    Facebook, Instagram, Youtube, Twitter,
    Plus, Trash2, Edit2, Check, X, GripVertical,
    Settings, Layout
} from 'lucide-react'

const AVAILABLE_ICONS = {
    MapPin: MapPin,
    Mail: Mail,
    Phone: Phone,
    Globe: Globe,
    Clock: Clock,
    Facebook: Facebook,
    Instagram: Instagram,
    Youtube: Youtube,
    Twitter: Twitter,
}

interface ContactManagerProps {
    initialBlocks: ContactBlock[]
    initialSettings: ContactSettings
}

export default function ContactManager({ initialBlocks, initialSettings }: ContactManagerProps) {
    const [blocks, setBlocks] = useState<ContactBlock[]>(initialBlocks)
    const [settings, setSettings] = useState<ContactSettings>(initialSettings)
    const [isSavingSettings, setIsSavingSettings] = useState(false)
    const [activeTab, setActiveTab] = useState<'hu' | 'en'>('hu')

    // Block editing state
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
    const [newBlock, setNewBlock] = useState({
        title: '',
        icon: 'MapPin',
        content: '',
        order: blocks.length
    })

    const handleSaveSettings = async () => {
        setIsSavingSettings(true)
        try {
            await updateContactSettings({
                recipientEmails: settings.recipientEmails || '',
                footerInfo: settings.footerInfo || '',
                footerInfoEn: settings.footerInfoEn || '',
                heroImage: settings.heroImage || '',
                heroTitle: settings.heroTitle || '',
                heroTitleEn: settings.heroTitleEn || '',
                heroSubtitle: settings.heroSubtitle || '',
                heroSubtitleEn: settings.heroSubtitleEn || '',
                smtpHost: settings.smtpHost || '',
                smtpPort: settings.smtpPort || 587,
                smtpUser: settings.smtpUser || '',
                smtpPassword: settings.smtpPassword || '',
                smtpSecure: settings.smtpSecure,
                smtpFromEmail: settings.smtpFromEmail || '',
                smtpFromName: settings.smtpFromName || ''
            })
            alert('Beállítások elmentve!')
        } catch (error) {
            console.error(error)
            alert('Hiba történt a mentés során.')
        } finally {
            setIsSavingSettings(false)
        }
    }

    const handleAddBlock = async () => {
        try {
            const block = await addContactBlock(newBlock)
            setBlocks([...blocks, block])
            setNewBlock({
                title: '',
                icon: 'MapPin',
                content: '',
                order: blocks.length + 1
            })
        } catch (error) {
            console.error(error)
            alert('Hiba történt a blokk hozzáadása során.')
        }
    }

    const handleDeleteBlock = async (id: string) => {
        if (!confirm('Biztosan törölni szeretné ezt a blokkot?')) return
        try {
            await deleteContactBlock(id)
            setBlocks(blocks.filter(b => b.id !== id))
        } catch (error) {
            console.error(error)
            alert('Hiba történt a törlés során.')
        }
    }

    const handleUpdateBlock = async (id: string, data: any) => {
        try {
            await updateContactBlock(id, data)
            setBlocks(blocks.map(b => b.id === id ? { ...b, ...data } : b))
            setEditingBlockId(null)
        } catch (error) {
            console.error(error)
            alert('Hiba történt a módosítás során.')
        }
    }

    return (
        <div className="space-y-12 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Kapcsolat kezelése</h1>
                    <p className="text-gray-600">Elérhetőségek és kapcsolatfelvételi űrlap beállításai.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SETTINGS SECTION */}
                <div className="lg:col-span-1 space-y-6">
                    {/* LANGUAGE SWITCHER */}
                    <div className="flex bg-white p-1 rounded-lg border shadow-sm w-full">
                        <button
                            type="button"
                            onClick={() => setActiveTab('hu')}
                            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'hu' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            Magyar (HU)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('en')}
                            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'en' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            English (EN)
                        </button>
                    </div>

                    <section className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Layout className="w-5 h-5" /> Oldal fejléce
                        </h2>

                        <div className="space-y-4">
                            {activeTab === 'hu' ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="heroTitle">Főcím (HU)</Label>
                                        <Input
                                            id="heroTitle"
                                            value={settings.heroTitle || ''}
                                            onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                                            placeholder="Kapcsolat"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="heroSubtitle">Alcím (HU)</Label>
                                        <Input
                                            id="heroSubtitle"
                                            value={settings.heroSubtitle || ''}
                                            onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                                            placeholder="Kérdése van? Lépjen velünk kapcsolatba!"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2 animate-in fade-in">
                                        <Label htmlFor="heroTitleEn">Főcím (EN)</Label>
                                        <Input
                                            id="heroTitleEn"
                                            value={settings.heroTitleEn || ''}
                                            onChange={(e) => setSettings({ ...settings, heroTitleEn: e.target.value })}
                                            placeholder="Contact"
                                        />
                                    </div>

                                    <div className="space-y-2 animate-in fade-in">
                                        <Label htmlFor="heroSubtitleEn">Alcím (EN)</Label>
                                        <Input
                                            id="heroSubtitleEn"
                                            value={settings.heroSubtitleEn || ''}
                                            onChange={(e) => setSettings({ ...settings, heroSubtitleEn: e.target.value })}
                                            placeholder="Have a question? Get in touch with us!"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="heroImage">Fejléckép</Label>
                                {settings.heroImage && (
                                    <div className="relative aspect-video rounded-lg overflow-hidden border mb-2">
                                        <img src={settings.heroImage} alt="Header" className="object-cover w-full h-full" />
                                        <button
                                            onClick={() => setSettings({ ...settings, heroImage: '' })}
                                            className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-full transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Input
                                        id="heroImage"
                                        value={settings.heroImage || ''}
                                        onChange={(e) => setSettings({ ...settings, heroImage: e.target.value })}
                                        placeholder="/images/header.jpg"
                                    />
                                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors flex items-center">
                                        <Plus className="w-4 h-4" />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    const formData = new FormData()
                                                    formData.append('file', file)
                                                    const res = await uploadMedia(formData)
                                                    if (res.path) {
                                                        setSettings({ ...settings, heroImage: res.path })
                                                    } else {
                                                        alert(res.error || 'Hiba a feltöltés során')
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Settings className="w-5 h-5" /> Általános beállítások
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="emails">Recipient Emails (vesszővel elválasztva)</Label>
                                <Input
                                    id="emails"
                                    value={settings.recipientEmails || ''}
                                    onChange={(e) => setSettings({ ...settings, recipientEmails: e.target.value })}
                                    placeholder="email1@info.hu, email2@info.hu"
                                />
                                <p className="text-xs text-gray-500">Erre az email címre (címekre) érkeznek az üzenetek a weboldalról.</p>
                            </div>

                            {activeTab === 'hu' ? (
                                <div className="space-y-2">
                                    <Label>Adatok (Lábjegyzet/Extra info - HU)</Label>
                                    <RichTextEditor
                                        content={settings.footerInfo || ''}
                                        onChange={(html) => setSettings({ ...settings, footerInfo: html })}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2 animate-in fade-in">
                                    <Label>Adatok (Lábjegyzet/Extra info - EN)</Label>
                                    <RichTextEditor
                                        content={settings.footerInfoEn || ''}
                                        onChange={(html) => setSettings({ ...settings, footerInfoEn: html })}
                                    />
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Mail className="w-5 h-5" /> SMTP Beállítások
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="smtpHost">SMTP Host</Label>
                                <Input
                                    id="smtpHost"
                                    value={settings.smtpHost || ''}
                                    onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                                    placeholder="smtp.example.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="smtpPort">SMTP Port</Label>
                                    <Input
                                        id="smtpPort"
                                        type="number"
                                        value={settings.smtpPort || ''}
                                        onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) || 0 })}
                                        placeholder="587"
                                    />
                                </div>
                                <div className="space-y-2 flex flex-col justify-end">
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="checkbox"
                                            id="smtpSecure"
                                            checked={settings.smtpSecure}
                                            onChange={(e) => setSettings({ ...settings, smtpSecure: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <Label htmlFor="smtpSecure" className="cursor-pointer">SSL/TLS (Secure)</Label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="smtpUser">SMTP User / Username</Label>
                                <Input
                                    id="smtpUser"
                                    value={settings.smtpUser || ''}
                                    onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                                    placeholder="user@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="smtpPassword">SMTP Password</Label>
                                <Input
                                    id="smtpPassword"
                                    type="password"
                                    value={settings.smtpPassword || ''}
                                    onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="border-t pt-4 mt-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="smtpFromEmail">Feladó Email (From)</Label>
                                    <Input
                                        id="smtpFromEmail"
                                        value={settings.smtpFromEmail || ''}
                                        onChange={(e) => setSettings({ ...settings, smtpFromEmail: e.target.value })}
                                        placeholder="noreply@folkfest.hu"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpFromName">Feladó Neve</Label>
                                    <Input
                                        id="smtpFromName"
                                        value={settings.smtpFromName || ''}
                                        onChange={(e) => setSettings({ ...settings, smtpFromName: e.target.value })}
                                        placeholder="FolkFest Hungary"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleSaveSettings}
                                className="w-full bg-black text-white"
                                disabled={isSavingSettings}
                            >
                                {isSavingSettings ? 'Mentés...' : 'Összes beállítás mentése'}
                            </Button>
                        </div>
                    </section>
                </div>

                {/* BLOCKS SECTION */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white p-6 rounded-xl border shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Edit2 className="w-5 h-5" /> Elérhetőség blokkok
                        </h2>

                        <div className="space-y-4 mb-8">
                            {blocks.map((block) => (
                                <div key={block.id} className="p-4 border rounded-lg bg-gray-50 flex items-start gap-4 group">
                                    <div className="p-2 bg-white border rounded">
                                        {AVAILABLE_ICONS[block.icon as keyof typeof AVAILABLE_ICONS] ? (
                                            (() => {
                                                const Icon = AVAILABLE_ICONS[block.icon as keyof typeof AVAILABLE_ICONS]
                                                return <Icon className="w-6 h-6 text-gray-600" />
                                            })()
                                        ) : <Globe className="w-6 h-6 text-gray-600" />}
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold">{block.title}</h3>
                                        <div className="text-sm text-gray-600 prose-sm line-clamp-2" dangerouslySetInnerHTML={{ __html: block.content }} />
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" onClick={() => setEditingBlockId(block.id)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteBlock(block.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ADD NEW BLOCK FORM */}
                        <div className="p-6 border-2 border-dashed rounded-xl bg-gray-50/50">
                            <h3 className="font-bold mb-4 uppercase tracking-widest text-xs text-gray-500">Új blokk hozzáadása</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                    <Label>Cím</Label>
                                    <Input
                                        value={newBlock.title}
                                        onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                                        placeholder="pl. Címünk"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ikon</Label>
                                    <select
                                        className="w-full p-2 border rounded-md bg-white h-10"
                                        value={newBlock.icon}
                                        onChange={(e) => setNewBlock({ ...newBlock, icon: e.target.value })}
                                    >
                                        {Object.keys(AVAILABLE_ICONS).map(iconName => (
                                            <option key={iconName} value={iconName}>{iconName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2 mb-4">
                                <Label>Tartalom (WYSYWIG)</Label>
                                <RichTextEditor
                                    content={newBlock.content}
                                    onChange={(html) => setNewBlock({ ...newBlock, content: html })}
                                />
                            </div>
                            <Button onClick={handleAddBlock} className="bg-gray-800 text-white flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Blokk hozzáadása
                            </Button>
                        </div>
                    </section>
                </div>
            </div>

            {/* BLOCK EDIT MODAL (Simplified as inline overlay) */}
            {editingBlockId && (() => {
                const block = blocks.find(b => b.id === editingBlockId)
                if (!block) return null
                return (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-2xl rounded-2xl p-8 shadow-2xl space-y-6">
                            <h2 className="text-2xl font-bold">Blokk szerkesztése</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Cím</Label>
                                    <Input
                                        defaultValue={block.title}
                                        id="edit-title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ikon</Label>
                                    <select
                                        id="edit-icon"
                                        className="w-full p-2 border rounded-md bg-white h-10"
                                        defaultValue={block.icon}
                                    >
                                        {Object.keys(AVAILABLE_ICONS).map(iconName => (
                                            <option key={iconName} value={iconName}>{iconName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Tartalom</Label>
                                <RichTextEditor
                                    content={block.content}
                                    onChange={(html) => {
                                        // We'll collect this on save
                                        (window as any)._temp_html = html
                                    }}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t">
                                <Button variant="outline" onClick={() => setEditingBlockId(null)}>Mégse</Button>
                                <Button className="bg-black text-white" onClick={() => {
                                    const titleInput = document.getElementById('edit-title') as HTMLInputElement
                                    const iconInput = document.getElementById('edit-icon') as HTMLSelectElement
                                    const content = (window as any)._temp_html || block.content
                                    handleUpdateBlock(block.id, {
                                        title: titleInput.value,
                                        icon: iconInput.value,
                                        content: content,
                                        order: block.order
                                    })
                                }}>Mentés</Button>
                            </div>
                        </div>
                    </div>
                )
            })()}
        </div>
    )
}
