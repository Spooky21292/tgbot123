#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/var/www/finskills-pro/current"
SHARED_ENV="/var/www/finskills-pro/shared/.env"

if [ ! -f "$SHARED_ENV" ]; then
  echo "[ERROR] Missing env file: $SHARED_ENV"
  exit 1
fi

cd "$APP_ROOT"

export NODE_ENV=production
export $(grep -v '^#' "$SHARED_ENV" | xargs)

npm ci
npm run db:generate
npm run db:push
npm run build

sudo systemctl restart finskills-pro
sudo systemctl status finskills-pro --no-pager
