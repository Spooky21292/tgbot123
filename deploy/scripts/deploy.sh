#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/var/www/finum/current"
SHARED_ENV="/var/www/finum/shared/.env"

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

sudo systemctl restart finum
sudo systemctl status finum --no-pager
