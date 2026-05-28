---
description: Next.js projekt telepítése IONOS Ubuntu szerverre Plesk panellel
---

# IONOS Deployment Útmutató

## Előkészületek (Helyi gépen)

### 1. Production Build Tesztelése
```bash
npm run build
npm start
```
Ellenőrizd, hogy minden működik-e production módban (localhost:3000).

### 2. Adatbázis Előkészítése
```bash
# Adatbázis mentése
cp prisma/dev.db prisma/production.db

# Vagy új, üres adatbázis seed-elése
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

### 3. Projekt Csomagolása
```bash
# Git repository inicializálása (ha még nincs)
git init
git add .
git commit -m "Production ready"

# Vagy ZIP fájl készítése (Plesk File Manager-hez)
# Kizárva: node_modules, .next, .git
zip -r folkfest-deploy.zip . -x "node_modules/*" ".next/*" ".git/*" "*.log"
```

---

## Szerver Előkészítése (IONOS/Plesk)

### 1. Node.js Telepítése a Plesk-ben

**Plesk Panel → Tools & Settings → Updates**
- Telepítsd a "Node.js" extension-t, ha még nincs

**Vagy SSH-n keresztül:**
```bash
# Node.js 20.x telepítése (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Ellenőrzés
node -v  # v20.x.x
npm -v   # 10.x.x
```

### 2. PM2 Process Manager Telepítése
```bash
sudo npm install -g pm2
pm2 startup systemd
# Kövesd a megjelenő utasításokat a systemd integrációhoz
```

---

## Alkalmazás Telepítése

### 1. Domain/Subdomain Létrehozása Plesk-ben

1. **Plesk → Websites & Domains → Add Domain/Subdomain**
2. Példa: `folkfest.yourdomain.com`
3. Document root: `/var/www/vhosts/yourdomain.com/folkfest`

### 2. Fájlok Feltöltése

**Opció A: Git (ajánlott)**
```bash
# SSH-n keresztül a szerverre
ssh user@your-server-ip

cd /var/www/vhosts/yourdomain.com/folkfest

# GitHub/GitLab repository klónozása
git clone https://github.com/yourusername/folkfest.git .

# Vagy privát repo esetén deploy key-vel
```

**Opció B: Plesk File Manager**
1. Töltsd fel a `folkfest-deploy.zip` fájlt
2. Csomagold ki a domain document root-jába

### 3. Függőségek Telepítése
```bash
cd /var/www/vhosts/yourdomain.com/folkfest

# Node modulok telepítése
npm install --production

# Prisma Client generálása
npx prisma generate
```

### 4. Környezeti Változók Beállítása

Hozd létre a `.env` fájlt a szerveren:
```bash
nano .env
```

Tartalom:
```env
# Adatbázis
DATABASE_URL="file:./prisma/production.db"

# Facebook API (opcionális)
FACEBOOK_PAGE_ID="your-page-id"
FACEBOOK_ACCESS_TOKEN="your-access-token"

# Node környezet
NODE_ENV=production

# Next.js
NEXT_PUBLIC_SITE_URL=https://folkfest.yourdomain.com
```

### 5. Adatbázis Migrálás
```bash
# Migráció futtatása
npx prisma migrate deploy

# Seed (csak első telepítéskor)
npx tsx prisma/seed.ts
```

### 6. Production Build
```bash
npm run build
```

---

## PM2 Konfiguráció

### 1. PM2 Ecosystem Fájl Létrehozása

Már létezik a projektben: `ecosystem.config.js`
```javascript
module.exports = {
  apps: [{
    name: 'folkfest',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

### 2. Alkalmazás Indítása
```bash
# PM2-vel indítás
pm2 start ecosystem.config.js

# Auto-restart beállítása
pm2 save
pm2 startup

# Státusz ellenőrzése
pm2 status
pm2 logs folkfest
```

---

## Nginx Reverse Proxy Beállítása (Plesk)

### 1. Plesk Panel Beállítások

**Plesk → Domains → folkfest.yourdomain.com → Apache & nginx Settings**

**Nginx Additional directives:**
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}

# Static fájlok közvetlen kiszolgálása
location /_next/static {
    alias /var/www/vhosts/yourdomain.com/folkfest/.next/static;
    expires 1y;
    access_log off;
}

location /uploads {
    alias /var/www/vhosts/yourdomain.com/folkfest/public/uploads;
    expires 30d;
    access_log off;
}
```

### 2. SSL Tanúsítvány (Let's Encrypt)

**Plesk → Domains → folkfest.yourdomain.com → SSL/TLS Certificates**
- "Install a free basic certificate provided by Let's Encrypt"
- "Redirect from HTTP to HTTPS" beállítása

---

## Fájl Jogosultságok

```bash
# Tulajdonos beállítása (Plesk user)
sudo chown -R plesk-user:psacln /var/www/vhosts/yourdomain.com/folkfest

# Írható mappák
chmod -R 755 /var/www/vhosts/yourdomain.com/folkfest
chmod -R 775 /var/www/vhosts/yourdomain.com/folkfest/public/uploads
chmod -R 775 /var/www/vhosts/yourdomain.com/folkfest/prisma

# Adatbázis fájl
chmod 664 /var/www/vhosts/yourdomain.com/folkfest/prisma/production.db
```

---

## Frissítés / Újratelepítés

### Git Pull + Restart
```bash
cd /var/www/vhosts/yourdomain.com/folkfest

# Legújabb verzió letöltése
git pull origin main

# Függőségek frissítése
npm install --production

# Prisma frissítése
npx prisma generate
npx prisma migrate deploy

# Build
npm run build

# Restart
pm2 restart folkfest
pm2 save
```

### Egyszerű Script (deploy.sh)
```bash
#!/bin/bash
cd /var/www/vhosts/yourdomain.com/folkfest
git pull
npm install --production
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart folkfest
pm2 save
echo "Deployment completed!"
```

Használat:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Troubleshooting

### PM2 Logs Ellenőrzése
```bash
pm2 logs folkfest --lines 100
pm2 logs folkfest --err  # Csak hibák
```

### Port Foglaltság
```bash
sudo lsof -i :3000
# Ha foglalt:
sudo kill -9 <PID>
```

### Nginx Újraindítás
```bash
sudo systemctl restart nginx
# Vagy Plesk-ben:
sudo /usr/local/psa/admin/bin/nginxmng --restart
```

### Adatbázis Jogosultságok
```bash
# Ha "database is locked" hiba:
sudo chmod 664 prisma/production.db
sudo chown plesk-user:psacln prisma/production.db
```

### Memory Issues
```bash
# PM2 memory limit növelése (ecosystem.config.js)
max_memory_restart: '1G'

pm2 restart folkfest
```

---

## Monitoring & Maintenance

### PM2 Monitoring
```bash
pm2 monit  # Interaktív monitor
pm2 status # Státusz
```

### Logok Rotálása
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Backup Script
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/var/backups/folkfest"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Adatbázis
cp prisma/production.db $BACKUP_DIR/db_$DATE.db

# Feltöltött fájlok
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz public/uploads

# Régi backupok törlése (30 napnál régebbiek)
find $BACKUP_DIR -mtime +30 -delete

echo "Backup completed: $DATE"
```

Cron job beállítása (napi backup):
```bash
crontab -e
# Hozzáadás:
0 2 * * * /var/www/vhosts/yourdomain.com/folkfest/backup.sh
```

---

## Biztonsági Javaslatok

1. **Firewall**: Csak 80, 443, 22 portok legyenek nyitva
2. **SSH Key**: Jelszó helyett SSH kulcs használata
3. **Node.js frissítések**: Rendszeres biztonsági frissítések
4. **.env védelem**: Ne commitold git-be, .gitignore-ban legyen
5. **Rate limiting**: Nginx-ben vagy Next.js middleware-ben
6. **HTTPS only**: HTTP → HTTPS redirect mindig bekapcsolva

---

## Hasznos Parancsok

```bash
# PM2
pm2 list              # Futó alkalmazások
pm2 restart folkfest  # Újraindítás
pm2 stop folkfest     # Leállítás
pm2 delete folkfest   # Törlés PM2-ből
pm2 save              # Mentés

# Nginx
sudo nginx -t         # Config teszt
sudo systemctl reload nginx

# Rendszer
df -h                 # Disk használat
free -h               # Memória
htop                  # Process monitor

# Node.js
node -v
npm -v
npx prisma studio     # Adatbázis UI (localhost:5555)
```
