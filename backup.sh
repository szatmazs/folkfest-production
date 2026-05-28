#!/bin/bash

# Backup konfiguráció
BACKUP_DIR="/var/backups/folkfest"
PROJECT_DIR="/var/www/vhosts/yourdomain.com/folkfest"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Színkódok
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting backup...${NC}"

# Backup könyvtár létrehozása
mkdir -p $BACKUP_DIR

# Adatbázis backup
echo -e "${YELLOW}Backing up database...${NC}"
cp $PROJECT_DIR/prisma/production.db $BACKUP_DIR/db_$DATE.db

# Feltöltött fájlok backup
echo -e "${YELLOW}Backing up uploads...${NC}"
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C $PROJECT_DIR/public uploads

# .env backup (biztonságosan, csak root olvashatja)
if [ -f "$PROJECT_DIR/.env" ]; then
    echo -e "${YELLOW}Backing up environment variables...${NC}"
    cp $PROJECT_DIR/.env $BACKUP_DIR/env_$DATE
    chmod 600 $BACKUP_DIR/env_$DATE
fi

# Régi backupok törlése
echo -e "${YELLOW}Cleaning old backups (older than $RETENTION_DAYS days)...${NC}"
find $BACKUP_DIR -name "db_*" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "uploads_*" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "env_*" -mtime +$RETENTION_DAYS -delete

# Backup mérete
BACKUP_SIZE=$(du -sh $BACKUP_DIR | cut -f1)

echo -e "${GREEN}✓ Backup completed!${NC}"
echo "Date: $DATE"
echo "Location: $BACKUP_DIR"
echo "Total size: $BACKUP_SIZE"
echo "---"
ls -lh $BACKUP_DIR | tail -5
