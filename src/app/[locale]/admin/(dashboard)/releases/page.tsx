import { getReleases } from '@/app/actions/release'
import { getTranslationFiles } from '@/app/actions/translations-admin'
import { ReleaseList } from './release-list'

export const dynamic = 'force-dynamic';

export default async function ReleasesAdminPage() {
    const [{ releases }, { hu, en }] = await Promise.all([
        getReleases(),
        getTranslationFiles(),
    ]);

    const pageStrings = {
        huTitle: (hu as any)?.releases?.title || '',
        huSubtitle: (hu as any)?.releases?.subtitle || '',
        enTitle: (en as any)?.releases?.title || '',
        enSubtitle: (en as any)?.releases?.subtitle || '',
    };

    return <ReleaseList initialReleases={releases || []} pageStrings={pageStrings} />;
}
