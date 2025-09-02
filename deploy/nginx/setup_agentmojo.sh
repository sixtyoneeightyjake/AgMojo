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

echo "[4/5] Basic Auth (opt-in via ENABLE_BASIC_AUTH=true)..."
if [ "${ENABLE_BASIC_AUTH:-false}" = "true" ]; then
  echo "Enabling Basic Auth..."
  BASIC_AUTH_USER=${BASIC_AUTH_USER:-admin}
  BASIC_AUTH_PASSWORD=${BASIC_AUTH_PASSWORD:-$(tr -dc A-Za-z0-9 </dev/urandom | head -c 20)}

  # Insert auth directives into server block if not present
  if ! grep -q "auth_basic" /etc/nginx/sites-available/agentmojo.sixtyoneeighty.com; then
    sudo awk '
      BEGIN {in_srv=0}
      /server\s*\{/ {in_srv=1}
      {print}
      in_srv && /location\s*\/\s*\{/ && !done {
        print "\n    # Basic Auth (added by setup script)";
        print "    auth_basic \"Restricted\";";
        print "    auth_basic_user_file /etc/nginx/.htpasswd;";
        done=1
      }
      /\}/ && in_srv {in_srv=0}
    ' /etc/nginx/sites-available/agentmojo.sixtyoneeighty.com | sudo tee /etc/nginx/sites-available/agentmojo.sixtyoneeighty.com >/dev/null
  fi

  if [ -f /etc/nginx/.htpasswd ]; then
    sudo htpasswd -B -b /etc/nginx/.htpasswd "$BASIC_AUTH_USER" "$BASIC_AUTH_PASSWORD"
  else
    sudo htpasswd -B -b -c /etc/nginx/.htpasswd "$BASIC_AUTH_USER" "$BASIC_AUTH_PASSWORD"
  fi
  echo "Basic Auth enabled for user '$BASIC_AUTH_USER'"

  sudo nginx -t
  sudo systemctl reload nginx
else
  echo "Skipping Basic Auth (ENABLE_BASIC_AUTH not set to true)."
fi

echo "[5/5] Done. Verify HTTPS at: https://$DOMAIN"
