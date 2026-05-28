import { getFooterSettings } from '@/app/actions/settings-admin'
import FooterSettingsForm from './footer-settings-form'

export const metadata = {
    title: 'Lábléc beállítások | FolkFest Admin',
}

export default async function FooterSettingsPage() {
    const settings = await getFooterSettings()

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Lábléc beállítások</h1>
            <FooterSettingsForm initialSettings={settings} />
        </div>
    )
}
