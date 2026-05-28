import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // 1. Handle Admin Protection
    if (path.includes('/admin') && !path.includes('/admin/login')) {
        const cookie = request.cookies.get('session')?.value
        const session = cookie ? await decrypt(cookie) : null

        if (!session) {
            // Determine if we need a locale prefix for the redirect
            const locale = request.nextUrl.locale || 'hu';
            return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url))
        }
    }

    // 2. Run i18n middleware for all routes
    return intlMiddleware(request);
}

export const config = {
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_static (inside /public)
    // - /favicon.ico, /logo.png, etc. (static files)
    matcher: ['/((?!api|_next|_static|_vercel|.*\\..*).*)']
};
