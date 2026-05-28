import { NextResponse } from 'next/server';
import { syncFacebookData } from '@/app/actions/facebook-admin';

export const dynamic = 'force-dynamic'; // Ensure it's not cached

export async function GET(request: Request) {
    try {
        // Simple security check (optional: add secret token)
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const result = await syncFacebookData();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Sync failed' }, { status: 500 });
    }
}
