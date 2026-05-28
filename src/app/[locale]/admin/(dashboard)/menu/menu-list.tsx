'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash, Edit, Save, ArrowUp, ArrowDown, Sparkles, Loader2 } from 'lucide-react';
import { createMenuItem, updateMenuItem, deleteMenuItem, reorderMenu, autoTranslateMenuAction } from '@/app/actions/menu-admin';
import { Modal } from '@/components/ui/modal';

interface MenuItem {
    id: string;
    label: string;
    labelEn: string | null;
    path: string;
    order: number;
    isVisible: boolean;
    target: string;
}

export function MenuList({ initialItems }: { initialItems: MenuItem[] }) {
    const [items, setItems] = useState(initialItems);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [activeTab, setActiveTab] = useState<'hu' | 'en'>('hu');
    const [isTranslating, setIsTranslating] = useState(false);

    // Form state for editing/creating
    const [currentLabel, setCurrentLabel] = useState('');
    const [currentLabelEn, setCurrentLabelEn] = useState('');

    const openCreate = () => {
        setCurrentLabel('');
        setCurrentLabelEn('');
        setActiveTab('hu');
        setIsCreateOpen(true);
    };

    const openEdit = (item: MenuItem) => {
        setEditingItem(item);
        setCurrentLabel(item.label);
        setCurrentLabelEn(item.labelEn || '');
        setActiveTab('hu');
    };

    const handleTranslate = async () => {
        if (!currentLabel) return;
        setIsTranslating(true);
        try {
            const res = await autoTranslateMenuAction(currentLabel);
            setCurrentLabelEn(res);
        } catch (e) {
            console.error(e);
        } finally {
            setIsTranslating(false);
        }
    };

    const move = async (index: number, direction: 'up' | 'down') => {
        const newItems = [...items];
        if (direction === 'up' && index > 0) {
            [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
        } else if (direction === 'down' && index < newItems.length - 1) {
            [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
        } else {
            return;
        }
        setItems(newItems);
        await reorderMenu(newItems.map(i => i.id));
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Biztosan törlöd?')) return;
        setItems(items.filter(i => i.id !== id));
        await deleteMenuItem(id);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
                <h2 className="text-2xl font-bold text-gray-800">Menü Elemek</h2>
                <Button onClick={openCreate} className="flex gap-2 bg-black text-white hover:bg-gray-800">
                    <Plus className="w-4 h-4" /> Új Elem
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Címke (HU / EN)</th>
                            <th className="px-6 py-4">Útvonal</th>
                            <th className="px-6 py-4 text-center">Sorrend</th>
                            <th className="px-6 py-4 text-right">Műveletek</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {items.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{item.label}</div>
                                    {item.labelEn && <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">{item.labelEn}</div>}
                                </td>
                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{item.path}</td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(index, 'up')} disabled={index === 0}>
                                            <ArrowUp className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(index, 'down')} disabled={index === items.length - 1}>
                                            <ArrowDown className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <Button variant="outline" size="sm" className="h-8" onClick={() => openEdit(item)}>
                                        <Edit className="w-4 h-4 text-blue-600" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                                        <Trash className="w-4 h-4 text-red-600" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr><td colSpan={4} className="text-center py-12 text-gray-400 italic">Nincs még menüpont létrehozva.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Új Menüpont">
                <form action={async (fd) => {
                    fd.set('label', currentLabel);
                    fd.set('labelEn', currentLabelEn);
                    await createMenuItem(fd);
                    setIsCreateOpen(false);
                    window.location.reload();
                }} className="space-y-6">
                    <div className="flex bg-gray-100 p-1 rounded-lg border w-fit">
                        <button type="button" onClick={() => setActiveTab('hu')} className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${activeTab === 'hu' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>MAGYAR</button>
                        <button type="button" onClick={() => setActiveTab('en')} className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${activeTab === 'en' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>ENGLISH</button>
                    </div>

                    <div className={activeTab === 'hu' ? 'space-y-4' : 'hidden'}>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Címke (HU)</label>
                            <Input value={currentLabel} onChange={e => setCurrentLabel(e.target.value)} required placeholder="Pl. Rólunk" />
                        </div>
                    </div>

                    <div className={activeTab === 'en' ? 'space-y-4 animate-in fade-in slide-in-from-bottom-2' : 'hidden'}>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase">Label (EN)</label>
                                <button type="button" onClick={handleTranslate} disabled={isTranslating || !currentLabel} className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1">
                                    {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Fordítás
                                </button>
                            </div>
                            <Input value={currentLabelEn} onChange={e => setCurrentLabelEn(e.target.value)} placeholder="Pl. About Us" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Útvonal</label>
                            <Input name="path" required placeholder="Pl. /about" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cél (Target)</label>
                            <select name="target" className="w-full border rounded-md p-2 text-sm bg-white">
                                <option value="_self">Azonos lapon (_self)</option>
                                <option value="_blank">Új lapon (_blank)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Mégse</Button>
                        <Button type="submit" className="bg-black text-white px-8">Létrehozás</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="Menüpont Szerkesztése">
                {editingItem && (
                    <form action={async (fd) => {
                        fd.set('label', currentLabel);
                        fd.set('labelEn', currentLabelEn);
                        await updateMenuItem(editingItem.id, fd);
                        setEditingItem(null);
                        window.location.reload();
                    }} className="space-y-6">
                        <input type="hidden" name="order" value={editingItem.order} />
                        
                        <div className="flex bg-gray-100 p-1 rounded-lg border w-fit">
                            <button type="button" onClick={() => setActiveTab('hu')} className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${activeTab === 'hu' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>MAGYAR</button>
                            <button type="button" onClick={() => setActiveTab('en')} className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${activeTab === 'en' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>ENGLISH</button>
                        </div>

                        <div className={activeTab === 'hu' ? 'space-y-4' : 'hidden'}>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Címke (HU)</label>
                                <Input value={currentLabel} onChange={e => setCurrentLabel(e.target.value)} required />
                            </div>
                        </div>

                        <div className={activeTab === 'en' ? 'space-y-4 animate-in fade-in slide-in-from-bottom-2' : 'hidden'}>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Label (EN)</label>
                                    <button type="button" onClick={handleTranslate} disabled={isTranslating || !currentLabel} className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1">
                                        {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Fordítás
                                    </button>
                                </div>
                                <Input value={currentLabelEn} onChange={e => setCurrentLabelEn(e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Útvonal</label>
                                <Input name="path" defaultValue={editingItem.path} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cél</label>
                                <select name="target" defaultValue={editingItem.target} className="w-full border rounded-md p-2 text-sm bg-white">
                                    <option value="_self">Azonos lapon (_self)</option>
                                    <option value="_blank">Új lapon (_blank)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border">
                            <input type="checkbox" name="isVisible" id="isVisible" defaultChecked={editingItem.isVisible} value="true" className="w-4 h-4" />
                            <label htmlFor="isVisible" className="text-xs font-bold text-gray-700 uppercase cursor-pointer">Látható a weboldalon</label>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button type="button" variant="ghost" onClick={() => setEditingItem(null)}>Mégse</Button>
                            <Button type="submit" className="bg-black text-white px-8">Mentés</Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
