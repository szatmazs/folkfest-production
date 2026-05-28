import Image from 'next/image'
import Link from 'next/link'
import { logoutAction } from '@/app/actions/auth'
import {
    LayoutDashboard,
    FileText,
    Video,
    Settings,
    Facebook,
    LogOut,
    Menu,
    Image as ImageIcon,
    Disc,
    Users,
    Mail,
    PanelBottom,
    Languages
} from 'lucide-react'

const navItems = [
    { href: '/admin', label: 'Admin kezdőlap', icon: LayoutDashboard },
    { href: '/admin/projects', label: 'Projektek', icon: ImageIcon },
    { href: '/admin/pages', label: 'Oldalak', icon: FileText },
    { href: '/admin/releases', label: 'Kiadványok', icon: Disc },
    { href: '/admin/partners', label: 'Partnerek', icon: Users },
    { href: '/admin/videos', label: 'Videók', icon: Video },
    { href: '/admin/facebook', label: 'Facebook Hírek', icon: Facebook },
    { href: '/admin/menu', label: 'Menü', icon: Menu },
    { href: '/admin/contact', label: 'Kapcsolat', icon: Mail },
    { href: '/admin/settings', label: 'Főoldal', icon: Settings },
    { href: '/admin/sliders', label: 'Kezdőlap Slider', icon: ImageIcon },
    { href: '/admin/settings/footer', label: 'Lábléc', icon: PanelBottom },
    { href: '/admin/translations', label: 'Fordítások', icon: Languages },
    { href: '/admin/account', label: 'Admin Fiók', icon: Users },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-gray-100 text-gray-900">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-10 w-64 bg-white shadow-lg flex flex-col">
                <div className="flex h-16 shrink-0 items-center justify-center border-b px-6 gap-3">
                    <Image src="/logo.png" alt="FolkFest Logo" width={32} height={32} className="object-contain" />
                    <h1 className="text-xl font-bold uppercase tracking-wider text-gray-800">Admin</h1>
                </div>
                <nav className="flex-1 overflow-y-auto mt-6 flex flex-col gap-1 px-4 pb-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}

                    <div className="my-4 border-t border-gray-200"></div>

                    <form action={logoutAction}>
                        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700">
                            <LogOut className="h-5 w-5 shrink-0" />
                            <span className="font-medium">Kijelentkezés</span>
                        </button>
                    </form>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8 overflow-y-auto">
                <div className="mx-auto max-w-6xl">
                    {children}
                </div>
            </main>
        </div>
    )
}
