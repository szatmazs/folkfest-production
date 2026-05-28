import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'

const SECRET_KEY = process.env.JWT_SECRET || 'dev-secret-key-change-this'
const key = new TextEncoder().encode(SECRET_KEY)

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key)
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        })
        return payload
    } catch {
        return null
    }
}

export async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    if (!session) return null
    return await decrypt(session)
}
