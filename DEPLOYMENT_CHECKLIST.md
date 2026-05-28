# IONOS Deployment Checklist

## Telepítés Előtt (Helyi Gépen)

- [ ] `npm run build` sikeres
- [ ] `npm start` működik (localhost:3000)
- [ ] Adatbázis seed működik: `npx tsx prisma/seed.ts`
- [ ] .env fájl frissítve production adatokkal
- [ ] Git repository frissítve / ZIP készítve
- [ ] Facebook API kulcsok ellenőrizve (ha használod)

## Szerver Előkészítés

- [ ] Node.js 20.x telepítve
- [ ] PM2 telepítve globálisan
- [ ] Domain/subdomain létrehozva Plesk-ben
- [ ] SSH hozzáférés működik
- [ ] Firewall beállítva (80, 443, 22)

## Fájlok Feltöltése

- [ ] Projekt fájlok feltöltve (git clone vagy ZIP)
- [ ] .env fájl létrehozva a szerveren
- [ ] `npm install --production` lefutott
- [ ] `npx prisma generate` lefutott
- [ ] `npx prisma migrate deploy` lefutott
- [ ] Adatbázis seed (ha szükséges)

## Build & Deploy

- [ ] `npm run build` sikeres
- [ ] PM2 konfigurálva: `pm2 start ecosystem.config.js`
- [ ] `pm2 save` futtatva
- [ ] `pm2 startup` beállítva
- [ ] Alkalmazás fut: `pm2 status`

## Nginx / Plesk Konfiguráció

- [ ] Nginx reverse proxy beállítva (port 3000)
- [ ] SSL tanúsítvány telepítve (Let's Encrypt)
- [ ] HTTP -> HTTPS redirect aktív
- [ ] Static fájlok kiszolgálása beállítva
- [ ] Nginx reload: `sudo systemctl reload nginx`

## Fájl Jogosultságok

- [ ] Projekt mappák tulajdonosa helyes (plesk-user)
- [ ] public/uploads írható (775)
- [ ] prisma/ mappa írható (775)
- [ ] production.db írható (664)

## Tesztelés

- [ ] Domain vagy IP cím elérhető böngészőből
- [ ] HTTPS működik (zöld lakat)
- [ ] Homepage betölt
- [ ] Admin felület elérhető (/admin)
- [ ] Bejelentkezés működik
- [ ] Kép feltöltés működik
- [ ] Facebook hírek betöltése (ha van API)
- [ ] PM2 logok tiszták: `pm2 logs folkfest`

## Backup & Monitoring

- [ ] backup.sh script beállítva
- [ ] Cron job létrehozva napi backuphoz:
      `0 2 * * * /var/www/vhosts/.../backup.sh`
- [ ] PM2 log rotáció beállítva
- [ ] Monitoring beállítva (opcionális)

## Frissítés Folyamata

- [ ] deploy.sh előkészítve és futtatható
- [ ] Git pull tesztelve
- [ ] Build + restart folyamat működik

## Biztonság

- [ ] .env nem commitolva git-be
- [ ] SSH csak kulccsal (jelszó letiltva)
- [ ] Node.js naprakész
- [ ] Admin jelszavak erősek
- [ ] Plesk tűzfal aktív
- [ ] Fail2ban telepítve (opcionális)

## Support Információk

**Fontos URL-ek:**
- Weboldal: https://yourdomain.com
- Admin: https://yourdomain.com/admin
- Plesk: https://server-ip:8443

**Parancsok:**
```bash
# Státusz
pm2 status
pm2 logs folkfest

# Újraindítás
pm2 restart folkfest

# Deploy
./deploy.sh

# Backup
./backup.sh
```

**Hibaelhárítás:**
- PM2 logok: `pm2 logs folkfest --err`
- Nginx teszt: `sudo nginx -t`
- Port check: `sudo lsof -i :3000`
- Disk space: `df -h`
- Memory: `free -h`
