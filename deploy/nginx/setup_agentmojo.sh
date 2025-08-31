#!/usr/bin/env bash
set -euo pipefail

# Quick Nginx setup for agentmojo.sixtyoneeighty.com
# - Installs Nginx, Certbot, helpers
# - Installs ready-to-use site + WebSocket map
# - Optionally runs Certbot if ADMIN_EMAIL is set
# - Optionally enables Basic Auth if BASIC_AUTH_USER and BASIC_AUTH_PASSWORD are set

DOMAIN="agentmojo.sixtyoneeighty.com"

echo "[1/5] Installing nginx, certbot, and tools..."
if command -v apt-get >/dev/null 2>&1; then
  sudo apt-get update -y
  sudo apt-get install -y nginx certbot python3-certbot-nginx apache2-utils
else
  echo "This script currently supports apt-based systems. Install nginx+certbot manually if using a different distro."
fi

echo "[2/5] Installing Nginx config files..."
sudo cp "$(dirname "$0")/websocket.conf" /etc/nginx/conf.d/websocket.conf
sudo cp "$(dirname "$0")/agentmojo.sixtyoneeighty.com.conf" \
  /etc/nginx/sites-available/agentmojo.sixtyoneeighty.com

if [ ! -e "/etc/nginx/sites-enabled/agentmojo.sixtyoneeighty.com" ]; then
  sudo ln -s /etc/nginx/sites-available/agentmojo.sixtyoneeighty.com \
    /etc/nginx/sites-enabled/
fi

sudo nginx -t
sudo systemctl reload nginx

echo "[3/5] Obtaining/renewing TLS cert (if ADMIN_EMAIL is set)..."
ADMIN_EMAIL=${ADMIN_EMAIL:-}
if [ -n "$ADMIN_EMAIL" ]; then
  sudo certbot --nginx -d "$DOMAIN" --redirect -m "$ADMIN_EMAIL" --agree-tos || true
else
  echo "ADMIN_EMAIL not set; skipping certbot. To run manually:"
  echo "  sudo certbot --nginx -d $DOMAIN --redirect -m you@example.com --agree-tos"
fi

echo "[4/5] Basic Auth setup (enabled by default)..."

# Ensure auth_basic lines are present (file ships with them enabled, this is just defensive)
sudo sed -i 's/^\s*#\s*auth_basic /auth_basic /' /etc/nginx/sites-available/agentmojo.sixtyoneeighty.com || true
sudo sed -i 's/^\s*#\s*auth_basic_user_file /auth_basic_user_file /' /etc/nginx/sites-available/agentmojo.sixtyoneeighty.com || true

BASIC_AUTH_USER=${BASIC_AUTH_USER:-admin}
# Default password per request; override by exporting BASIC_AUTH_PASSWORD
# Note: for security, rotate this in production.
BASIC_AUTH_PASSWORD=${BASIC_AUTH_PASSWORD:-'Eth@n0511!'}

if [ -f /etc/nginx/.htpasswd ]; then
  sudo htpasswd -B -b /etc/nginx/.htpasswd "$BASIC_AUTH_USER" "$BASIC_AUTH_PASSWORD"
else
  sudo htpasswd -B -b -c /etc/nginx/.htpasswd "$BASIC_AUTH_USER" "$BASIC_AUTH_PASSWORD"
fi
echo "Basic Auth credentials set for user '$BASIC_AUTH_USER'"

sudo nginx -t
sudo systemctl reload nginx

echo "[5/5] Done. Verify HTTPS at: https://$DOMAIN"
