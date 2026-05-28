import { getTranslationFiles } from '@/app/actions/translations-admin'
import { TranslationsEditor } from './translations-editor'

export default async function TranslationsPage() {
    const { hu, en } = await getTranslationFiles()

    return <TranslationsEditor initialHu={hu} initialEn={en} />
}
