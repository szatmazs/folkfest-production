import { Link } from "@/i18n/routing";
import { getMenuItems } from "@/app/actions/menu-admin";
import { MainNav } from "./main-nav";
import { NavbarShell } from "./navbar-shell";
import { NavbarLogo } from "./navbar-logo";
import { NavbarActions } from "./navbar-actions";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export async function Navbar({ locale }: { locale: string }) {
    const rawMenuItems = await getMenuItems();
    const t = await getTranslations('navigation');
    const isEn = locale === 'en';

    // Map paths dynamically to their localized slugs if they point to dynamic Pages or Projects
    const menuItems = await Promise.all(rawMenuItems.map(async (item) => {
        if (item.path.startsWith('/') && !['/kiadvanyok', '/videos', '/videok', '/events', '/esemenyek', '/hirek', '/news', '/contact', '/kapcsolat', '/projects'].includes(item.path)) {
            const slug = item.path.substring(1);
            
            // Check Page table
            const page = await prisma.page.findFirst({
                where: {
                    OR: [
                        { slug },
                        { slugEn: slug }
                    ]
                },
                select: { slug: true, slugEn: true }
            });
            if (page) {
                return {
                    ...item,
                    path: isEn ? `/${page.slugEn || page.slug}` : `/${page.slug}`
                };
            }

            // Check Project table
            const project = await prisma.project.findFirst({
                where: {
                    OR: [
                        { slug },
                        { slugEn: slug }
                    ]
                },
                select: { slug: true, slugEn: true }
            });
            if (project) {
                return {
                    ...item,
                    path: isEn ? `/projects/${project.slugEn || project.slug}` : `/projektek/${project.slug}`
                };
            }
        }
        return item;
    }));

    return (
        <NavbarShell>
            <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-2 lg:gap-4">
                <Link href="/" className="flex-shrink-0">
                    <NavbarLogo />
                </Link>

                <div className="flex items-center justify-end flex-grow gap-2 lg:gap-6">
                    <MainNav items={menuItems} locale={locale} />
                    <NavbarActions locale={locale} supportLabel={t('support')} />
                </div>
            </div>
        </NavbarShell>
    );
}
