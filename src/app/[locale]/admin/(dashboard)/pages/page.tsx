import { getPages } from '@/app/actions/page-admin'
import PageList from './page-list'

export default async function PagesPage() {
    const pages = await getPages()

    return <PageList initialPages={pages} />
}
