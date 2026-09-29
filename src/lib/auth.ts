import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'

const configuredSecret = process.env.JWT_SECRET
if (process.env.NODE_ENV === 'production' && (!configuredSecret || configuredSecret.length < 32)) {
    throw new Error('JWT_SECRET must be configured and at least 32 characters long')
}
const SECRET_KEY = configuredSecret || 'local-development-secret-only-change-me'
const key = new TextEncoder().encode(SECRET_KEY)
type SessionPayload = { userId: string; username?: string }

export async function encrypt(payload: Record<string, unknown>) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key)
}

export async function decrypt(input: string) {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        })
        return payload
    } catch {
        return null
    }
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    if (!session) return null
    const payload = await decrypt(session)
    return typeof payload?.userId === 'string'
        ? { userId: payload.userId, username: typeof payload.username === 'string' ? payload.username : undefined }
        : null
}

export async function requireSession() {
    const session = await getSession()
    if (typeof session?.userId !== 'string') throw new Error('UNAUTHORIZED')
    return session as typeof session & { userId: string }
}
