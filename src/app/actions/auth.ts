'use server'

import { SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { compare, hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { encrypt, getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function loginAction(prevState: any, formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    if (!username || !password) {
        return { error: 'Kérlek töltsd ki az összes mezőt!' }
    }

    const user = await prisma.adminUser.findUnique({
        where: { username },
    })

    // Verify password
    if (!user || !(await compare(password, user.password))) {
        return { error: 'Hibás felhasználónév vagy jelszó.' }
    }

    // Create session
    const session = await encrypt({ userId: user.id, username: user.username })

    const cookieStore = await cookies()
    cookieStore.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        path: '/',
    })

    redirect('/admin')
}

export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    redirect('/login')
}

export async function updatePasswordAction(formData: FormData) {
    const session = await getSession()
    if (!session) throw new Error('Nem vagy bejelentkezve')

    const oldPassword = formData.get('oldPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
        throw new Error('Az új jelszavak nem egyeznek')
    }

    if (newPassword.length < 6) {
        throw new Error('A jelszónak legalább 6 karakternek kell lennie')
    }

    const user = await prisma.adminUser.findUnique({
        where: { id: session.userId }
    })

    if (!user || !(await compare(oldPassword, user.password))) {
        throw new Error('A jelenlegi jelszó hibás')
    }

    const hashedPassword = await hash(newPassword, 12)

    await prisma.adminUser.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    })

    revalidatePath('/admin/account')
    return { success: true }
}
