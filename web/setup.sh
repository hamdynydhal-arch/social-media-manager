#!/usr/bin/env bash
# Spear5 — One-command setup script
# Usage: bash setup.sh
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Spear5 Web Platform Setup      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
  echo -e "${YELLOW}⚠ .env already exists — skipping generation${NC}"
else
  echo -e "${GREEN}▶ Generating secure keys...${NC}"
  ENCRYPTION_KEY=$(openssl rand -hex 32)
  NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -d '\n')

  cat > .env << EOF
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/spear5"

NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
NEXTAUTH_URL="https://YOUR-DOMAIN.vercel.app"

GOOGLE_CLIENT_ID="YOUR-GOOGLE-CLIENT-ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR-GOOGLE-CLIENT-SECRET"

ENCRYPTION_KEY="${ENCRYPTION_KEY}"

RESEND_API_KEY="re_YOUR_RESEND_KEY"
EMAIL_FROM="noreply@spear5.io"

INITIAL_SUPER_ADMIN_EMAIL="hamdynydhal@gmail.com"
EOF
  echo -e "${GREEN}✔ .env created with auto-generated ENCRYPTION_KEY and NEXTAUTH_SECRET${NC}"
  echo -e "${YELLOW}  → Edit DATABASE_URL, GOOGLE_*, RESEND_API_KEY, and NEXTAUTH_URL${NC}"
fi

echo ""
echo -e "${GREEN}▶ Installing dependencies...${NC}"
npm install

echo ""
echo -e "${GREEN}▶ Generating Prisma Client...${NC}"
npx prisma generate

echo ""
echo -e "${GREEN}▶ Pushing schema to database...${NC}"
npx prisma db push

echo ""
echo -e "${GREEN}▶ Building application...${NC}"
npm run build

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            Setup Complete! ✓          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "  Run: ${BLUE}npm start${NC}  →  http://localhost:3000"
echo ""
