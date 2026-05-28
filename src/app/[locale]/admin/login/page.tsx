'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/actions/auth'

export default function LoginPage() {
    const [state, action, isPending] = useActionState(loginAction, undefined)

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form action={action} className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
                <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Admin Belépés</h1>

                <div className="mb-4">
                    <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="username">
                        Felhasználónév
                    </label>
                    <input
                        className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none"
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Felhasználónév"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="password">
                        Jelszó
                    </label>
                    <input
                        className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none"
                        id="password"
                        name="password"
                        type="password"
                        placeholder="******************"
                        required
                    />
                </div>

                {state?.error && (
                    <div className="mb-4 rounded bg-red-100 p-2 text-center text-sm text-red-700">
                        {state.error}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <button
                        className="focus:shadow-outline w-full rounded bg-black px-4 py-2 font-bold text-white hover:bg-gray-800 focus:outline-none disabled:opacity-50"
                        type="submit"
                        disabled={isPending}
                    >
                        {isPending ? 'Belépés...' : 'Belépés'}
                    </button>
                </div>
            </form>
        </div>
    )
}
