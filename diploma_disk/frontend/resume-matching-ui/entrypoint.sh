#!/bin/sh
# ── запускаем Next.js на фоне ──────────────────────────────
npm run start &

# ── стартуем Nginx (в foreground) ─────────────────────────
exec nginx -g 'daemon off;'
