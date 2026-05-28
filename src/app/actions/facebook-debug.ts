'use server'

export async function debugFacebookToken() {
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!accessToken) {
        return { error: 'Nincs beállítva FACEBOOK_ACCESS_TOKEN az .env fájlban.' };
    }

    try {
        // Facebook debug_token endpoint Requires an APP ACCESS TOKEN or the token itself if it has rights
        // Actually, the simplest way to check a Page Access Token's validity is to call /me
        const res = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${accessToken}`);
        const data = await res.json();

        if (!res.ok) {
            return {
                isValid: false,
                error: data.error?.message || 'Ismeretlen hiba',
                code: data.error?.code,
                subcode: data.error?.error_subcode
            };
        }

        // To get expiration info, we need to call the debug_token endpoint
        // This usually requires an App ID and App Secret (App Access Token)
        // But we can also check the token metadata if we have one
        const debugRes = await fetch(`https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${accessToken}`);
        const debugData = await debugRes.json();

        if (debugData.data) {
            const d = debugData.data;
            let expiresText = 'Ismeretlen';
            
            if (d.expires_at === 0) {
                expiresText = 'Soha (Never expire / Long-lived Page Token)';
            } else if (d.expires_at) {
                expiresText = new Date(d.expires_at * 1000).toLocaleString('hu-HU');
            } else if (d.data_access_expires_at) {
                expiresText = new Date(d.data_access_expires_at * 1000).toLocaleString('hu-HU') + ' (Adathozzáférés lejárata)';
            }

            return {
                isValid: d.is_valid,
                type: d.type,
                application: d.application,
                expiresAt: expiresText,
                scopes: d.scopes,
                pageName: data.name
            };
        }

        return {
            isValid: true,
            pageName: data.name,
            info: 'A token érvényes, de a lejárati adatokat csak App Secret segítségével lehetne pontosabban lekérdezni.'
        };

    } catch (e) {
        return { error: 'Nem sikerült elérni a Facebook API-t.' };
    }
}
