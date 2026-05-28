'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { sendContactEmail } from '@/app/actions/contact'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { useTranslations } from 'next-intl'

export function ContactForm() {
    const t = useTranslations('contact.form')
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [timestamp, setTimestamp] = useState('')
    const turnstileRef = useRef<TurnstileInstance>(null)

    useEffect(() => {
        setTimestamp(Date.now().toString())
    }, [])

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setStatus(null)

        try {
            const result = await sendContactEmail(formData)
            if (result.success) {
                setStatus({ type: 'success', message: t('successMessage') })
                const form = document.getElementById('contact-form') as HTMLFormElement
                form.reset()
                turnstileRef.current?.reset()
            } else {
                setStatus({ type: 'error', message: result.error || t('errorMessage') })
                turnstileRef.current?.reset()
            }
        } catch (error) {
            setStatus({ type: 'error', message: t('networkError') })
            turnstileRef.current?.reset()
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-white p-8 border shadow-sm">
            <h2 className="text-2xl font-bold uppercase tracking-wide mb-8">{t('title')}</h2>

            {status && (
                <div className={`mb-6 p-4 rounded-none border ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    {status.message}
                </div>
            )}

            <form id="contact-form" action={handleSubmit} className="space-y-6">
                {/* Honeypot for spam */}
                <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
                <input type="hidden" name="timestamp" value={timestamp} />

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('nameLabel')} *</label>
                        <input
                            name="name"
                            type="text"
                            id="name"
                            required
                            className="w-full p-3 border bg-gray-50 focus:outline-none focus:border-black transition-colors"
                            placeholder={t('namePlaceholder')}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('emailLabel')} *</label>
                        <input
                            name="email"
                            type="email"
                            id="email"
                            required
                            className="w-full p-3 border bg-gray-50 focus:outline-none focus:border-black transition-colors"
                            placeholder="email@example.com"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('subjectLabel')}</label>
                    <input
                        name="subject"
                        type="text"
                        id="subject"
                        className="w-full p-3 border bg-gray-50 focus:outline-none focus:border-black transition-colors"
                        placeholder={t('subjectPlaceholder')}
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('messageLabel')} *</label>
                    <textarea
                        name="message"
                        id="message"
                        rows={5}
                        required
                        className="w-full p-3 border bg-gray-50 focus:outline-none focus:border-black transition-colors"
                        placeholder={t('messagePlaceholder')}
                    />
                </div>

                {/* Turnstile Widget */}
                <div className="py-2">
                    <Turnstile
                        ref={turnstileRef}
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                    />
                </div>

                <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="w-full bg-black text-white hover:bg-gray-800 uppercase font-bold tracking-widest rounded-none"
                >
                    {isLoading ? t('sending') : t('sendButton')}
                </Button>
            </form>
        </div>
    )
}
