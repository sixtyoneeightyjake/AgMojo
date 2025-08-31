#!/usr/bin/env bash
set -euo pipefail

# Run OpenHands in production mode (GUI) behind a reverse proxy
# Binds to 127.0.0.1:3000 only. Use Nginx to expose the service publicly.

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)

cd "$ROOT_DIR"
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

echo "OpenHands is running on http://127.0.0.1:3000 (local)."
echo "Expose it via Nginx at your domain (see deploy/nginx)."

