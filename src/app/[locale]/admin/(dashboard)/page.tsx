import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { FileText, Calendar, Video, Layout, Settings, ArrowRight, Terminal } from 'lucide-react'
import { BulkTranslateButton } from './bulk-translate-button'
import { execSync } from 'child_process'

// Fetch stats directly in the Server Component
async function getStats() {
    'use server'
    const [postsCount, videosCount, projectsCount, pagesCount] = await Promise.all([
        prisma.facebookPost.count({ where: { isVisible: true } }),
        prisma.video.count(),
        prisma.project.count(),
        prisma.page.count()
    ])
    return { postsCount, videosCount, projectsCount, pagesCount }
}

export default async function AdminDashboard() {
    const stats = await getStats()

    let lastUpdate = 'Ismeretlen'
    try {
        // Run git log to fetch the date and time of the last commit
        const stdout = execSync('git log -1 --format="%Y-%m-%d %H:%M:%S"', { encoding: 'utf-8' })
        lastUpdate = stdout.trim()
    } catch (e) {
        lastUpdate = new Date().toLocaleString('hu-HU')
    }

    return (
        <div>
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Admin kezdőlap</h1>
                    <p className="text-gray-600">Üdvözöllek az admin felületen! Válassz a menüpontok közül a tartalom szerkesztéséhez.</p>
                </div>
                <BulkTranslateButton />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* Facebook Kártya */}
                <Link href="/admin/facebook" className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">Hírek & Események</h3>
                    </div>
                    <p className="text-gray-500 mb-4 text-sm">Facebook posztok kezelése és szinkronizálása.</p>
                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{stats.postsCount} aktív</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                {/* Videók Kártya */}
                <Link href="/admin/videos" className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                            <Video className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">Videótár</h3>
                    </div>
                    <p className="text-gray-500 mb-4 text-sm">YouTube videók feltöltése és kezelése.</p>
                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">{stats.videosCount} videó</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                {/* Projektek Kártya */}
                <Link href="/admin/projects" className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <Layout className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">Projektek</h3>
                    </div>
                    <p className="text-gray-500 mb-4 text-sm">Futó és lezárt projektek szerkesztése.</p>
                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">{stats.projectsCount} projekt</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                {/* Oldalak Kártya */}
                <Link href="/admin/pages" className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">Oldalak</h3>
                    </div>
                    <p className="text-gray-500 mb-4 text-sm">Bemutatkozás és egyéb fix oldalak.</p>
                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">{stats.pagesCount} oldal</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                {/* Beállítások Kártya */}
                <Link href="/admin/settings" className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-gray-800 group-hover:text-white transition-colors">
                            <Settings className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">Beállítások</h3>
                    </div>
                    <p className="text-gray-500 mb-4 text-sm">Kezdőlap szövegek és globális beállítások.</p>
                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">Szerkesztés</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </div>

            {/* Rendszerfrissítés jegyzet */}
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl max-w-3xl">
                <div className="flex items-center gap-2 mb-3">
                    <Terminal className="w-5 h-5 text-gray-600" />
                    <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Rendszerfrissítés & Telepítés</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                    Utolsó rendszerfrissítés időpontja: <strong className="text-black">{lastUpdate}</strong>
                </p>
                <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-xs select-all overflow-x-auto space-y-1">
                    <div>cd /var/www/vhosts/folkfest.hu/httpdocs</div>
                    <div>./deploy.sh</div>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                    Kattints a fenti sötét parancsmezőre a teljes tartalom kijelöléséhez/másolásához, majd futtasd le a szerver termináljában.
                </p>
            </div>
        </div>
    )
}
