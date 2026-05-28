import { getHomeSettings } from '@/app/actions/settings-admin'
import SettingsForm from './settings-form'

export default async function SettingsPage() {
    const settings = await getHomeSettings()

    return <SettingsForm initialSettings={settings} />
}
