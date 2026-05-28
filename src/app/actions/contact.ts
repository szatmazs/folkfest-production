'use server'

import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

export async function sendContactEmail(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    // Spam protection: Cloudflare Turnstile
    const turnstileToken = formData.get('cf-turnstile-response') as string
    if (!turnstileToken) {
        return { success: false, error: 'Kérjük igazolja, hogy nem robot!' }
    }

    try {
        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`
        })
        const verifyData = await verifyRes.json()
        if (!verifyData.success) {
            return { success: false, error: 'Hibás robot-ellenőrzés. Kérjük próbálja újra!' }
        }
    } catch (e) {
        console.error('Turnstile verification error:', e)
        // We continue in case of network error to not block users, or we can fail. Let's fail for safety.
        return { success: false, error: 'A robot-ellenőrzés sikertelen volt.' }
    }

    // Secondary Spam protection (Honeypot)
    const honeypot = formData.get('website') // Hidden field
    if (honeypot) {
        console.log('Spam detected via honeypot')
        return { success: true } // Silently fail for bots
    }

    const timestamp = formData.get('timestamp') as string
    const now = Date.now()
    if (!timestamp || (now - parseInt(timestamp)) < 2000) {
        // Submitted too fast (less than 2 seconds)
        console.log('Spam detected via timestamp')
        return { success: false, error: 'Kérjük várjon egy kicsit a küldés előtt!' }
    }

    if (!name || !email || !message) {
        return { success: false, error: 'Minden csillaggal jelölt mezőt ki kell tölteni!' }
    }

    // Get contact settings
    const settings = await prisma.contactSettings.findFirst()
    if (!settings) {
        return { success: false, error: 'A kapcsolat beállítások nem találhatók.' }
    }

    const recipientEmails = settings.recipientEmails || 'info@folkfest.hu'
    const recipients = recipientEmails.split(',').map((e: string) => e.trim())

    // Check if SMTP is configured
    if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
        console.warn('SMTP is not configured in admin panel. Logging email to console instead.')
        console.log(`[LOCAL DEV LOG] Sending email to: ${recipients.join(', ')}`)
        console.log(`[LOCAL DEV LOG] From: ${name} <${email}>`)
        console.log(`[LOCAL DEV LOG] Subject: ${subject}`)
        console.log(`[LOCAL DEV LOG] Message: ${message}`)
        return { success: true }
    }

    try {
        const transporter = nodemailer.createTransport({
            host: settings.smtpHost,
            port: settings.smtpPort || 587,
            secure: settings.smtpSecure,
            auth: {
                user: settings.smtpUser,
                pass: settings.smtpPassword,
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        await transporter.sendMail({
            from: `"${settings.smtpFromName || name}" <${settings.smtpFromEmail || settings.smtpUser}>`,
            to: recipients,
            replyTo: email,
            subject: `Kapcsolat: ${subject || 'Új üzenet'}`,
            text: `Név: ${name}\nEmail: ${email}\n\nÜzenet:\n${message}`,
            html: `
                <h3>Új üzenet érkezett a weboldalról</h3>
                <p><strong>Név:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <br>
                <p><strong>Üzenet:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
            `,
        })

        return { success: true }
    } catch (error) {
        console.error('Email sending failed:', error)
        return { success: false, error: 'Hiba történt az email küldése során. Kérjük próbálja meg később!' }
    }
}
