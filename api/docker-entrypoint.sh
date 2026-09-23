#!/bin/sh
set -e

echo "Aplicando migraciones (prisma migrate deploy)..."
npx prisma migrate deploy

exec "$@"
