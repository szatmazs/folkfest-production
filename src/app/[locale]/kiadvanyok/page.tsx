import { getReleases } from "@/app/actions/release";
import { ReleaseGrid } from "@/components/features/release-grid";
import { PageHeader } from "@/components/layout/page-header";
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function ReleasesPage() {
    const { releases } = await getReleases();

    const t = await getTranslations('releases');

    return (
        <main className="min-h-screen bg-gray-50">
            <PageHeader
                title={t('title')}
                image="/kiadvanyok-bg.jpg"
            />

            <section className="container mx-auto px-4 py-20">
                <div className="max-w-7xl mx-auto">
                    <p className="text-lg text-gray-600 mb-12 text-center uppercase tracking-widest font-medium">
                        {t('subtitle')}
                    </p>
                    <ReleaseGrid releases={releases || []} />
                </div>
            </section>
        </main>
    );
}
