Remote Deployment (Docker Compose + Nginx + Cloudflare)

Prereqs
- Ubuntu 22.04+ (or similar) VM at 66.42.117.65
- Domain pointing at the server via Cloudflare (proxy enabled is ok)
- Supabase project with GitHub OAuth configured

Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker

Project env (backend)
Create or export the following server env vars:
- OPENHANDS_CONFIG_CLS=openhands.server.config.supabase_server_config.SupabaseServerConfig
- OPENHANDS_CONVERSATION_VALIDATOR_CLS=openhands.storage.conversation.supabase_conversation_validator.SupabaseConversationValidator
- SUPABASE_URL=https://YOUR-SUPABASE-PROJECT.supabase.co
- (optional) SESSION_API_KEY=some-long-random-string

Vite build-time env (frontend)
Set these when building the image (Compose already wires args):
- VITE_BACKEND_BASE_URL=app.example.com  (no protocol)
- VITE_SUPABASE_URL=https://YOUR-SUPABASE-PROJECT.supabase.co
- VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY

Build + run
mkdir -p workspace
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

Nginx reverse proxy
sudo apt-get update && sudo apt-get install -y nginx
sudo tee /etc/nginx/sites-available/openhands <<'EOF'
include /etc/nginx/snippets/openhands-ssl.conf;
EOF
sudo ln -s /etc/nginx/sites-available/openhands /etc/nginx/sites-enabled/openhands

Place the app server config at /etc/nginx/snippets/openhands-ssl.conf (use deploy/nginx/app.conf as a template), and replace:
- server_name app.example.com
- ssl cert/key paths (Let’s Encrypt or Cloudflare origin certs)

Let’s Encrypt (HTTP-01)
- In Cloudflare, set the DNS record to DNS only (temporarily, orange cloud OFF)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.example.com --redirect
- Switch Cloudflare proxy back ON and set SSL/TLS mode to Full (strict)

Cloudflare Origin Certs
- In Cloudflare: SSL/TLS -> Origin Server -> Create certificate
- Install cert and key on the server (e.g., /etc/ssl/cloudflare/)
- Update ssl_certificate/ssl_certificate_key in the Nginx file
- Set Cloudflare SSL/TLS mode to Full (strict)

Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

Persistence
- ~/.openhands is mounted to persist user data and conversation history
- ./workspace is mounted for workspace files

Upgrade
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

