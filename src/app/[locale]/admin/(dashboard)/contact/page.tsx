import { getContactBlocks, getContactSettings } from '@/app/actions/contact-admin'
import ContactManager from './contact-manager'

export default async function AdminContactPage() {
    const [blocks, settings] = await Promise.all([
        getContactBlocks(),
        getContactSettings()
    ])

    return (
        <ContactManager
            initialBlocks={blocks}
            initialSettings={settings}
        />
    )
}
