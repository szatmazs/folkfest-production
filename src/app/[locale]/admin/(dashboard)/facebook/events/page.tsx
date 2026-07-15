import { getAdminFacebookEvents } from '@/app/actions/facebook-admin'
import { FacebookEventList } from './event-list'
import TokenDebugger from '../token-debugger'

export default async function FacebookEventsAdminPage() {
    const events = await getAdminFacebookEvents()

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Facebook Események Kezelése</h1>
            <TokenDebugger />
            <FacebookEventList events={events} />
        </div>
    )
}
