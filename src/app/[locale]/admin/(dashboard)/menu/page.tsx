import { getAllMenuItems } from "@/app/actions/menu-admin";
import { MenuList } from "./menu-list";

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
    const items = await getAllMenuItems();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold uppercase tracking-wide text-gray-800">Menü Kezelése</h1>
            <p className="text-gray-500">Itt állíthatod be a navigációs menü elemeit és sorrendjét.</p>

            <MenuList initialItems={items} />
        </div>
    );
}
