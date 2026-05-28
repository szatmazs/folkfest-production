#!/bin/bash

# Színkódok
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment...${NC}"

# Git pull
echo -e "${YELLOW}Pulling latest changes...${NC}"
git pull origin main || { echo -e "${RED}Git pull failed${NC}"; exit 1; }

# Dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install --production || { echo -e "${RED}npm install failed${NC}"; exit 1; }

# Prisma
echo -e "${YELLOW}Generating Prisma Client...${NC}"
npx prisma generate || { echo -e "${RED}Prisma generate failed${NC}"; exit 1; }

echo -e "${YELLOW}Running database migrations...${NC}"
npx prisma migrate deploy || { echo -e "${RED}Migration failed${NC}"; exit 1; }

# Build
echo -e "${YELLOW}Building application...${NC}"
npm run build || { echo -e "${RED}Build failed${NC}"; exit 1; }

# Restart PM2
echo -e "${YELLOW}Restarting application...${NC}"
pm2 restart folkfest || { echo -e "${RED}PM2 restart failed${NC}"; exit 1; }
pm2 save

echo -e "${GREEN}✓ Deployment completed successfully!${NC}"

# Show status
pm2 status folkfest
