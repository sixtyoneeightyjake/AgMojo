#!/bin/bash

# Script to disable Nginx basic authentication on AgentMojo server
# Run this script on the server as root

set -euo pipefail

DOMAIN="agentmojo.sixtyoneeighty.com"
SITE_CONF="/etc/nginx/sites-available/$DOMAIN"

echo "Disabling basic authentication for $DOMAIN..."

# Check if the site config exists
if [[ ! -f "$SITE_CONF" ]]; then
    echo "Error: Nginx site configuration not found at $SITE_CONF"
    exit 1
fi

# Comment out auth_basic lines
echo "Commenting out auth_basic directives..."
sed -i 's/^[[:space:]]*auth_basic /    # auth_basic /' "$SITE_CONF"
sed -i 's/^[[:space:]]*auth_basic_user_file /    # auth_basic_user_file /' "$SITE_CONF"

# Test nginx configuration
echo "Testing Nginx configuration..."
nginx -t

if [[ $? -eq 0 ]]; then
    echo "Reloading Nginx..."
    systemctl reload nginx
    echo "Basic authentication has been disabled successfully!"
    
    # Optionally remove the .htpasswd file
    if [[ -f "/etc/nginx/.htpasswd" ]]; then
        echo "Removing .htpasswd file..."
        rm -f /etc/nginx/.htpasswd
    fi
    
    echo "Done! Basic authentication is now disabled."
else
    echo "Error: Nginx configuration test failed. Please check the configuration manually."
    exit 1
fi

# Show the current configuration
echo "\nCurrent auth_basic configuration:"
grep -n "auth_basic" "$SITE_CONF" || echo "No auth_basic directives found (good!)"