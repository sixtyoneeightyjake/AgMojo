E2B + Supabase Deployment (Ubuntu 20.04)

Overview
- Runs OpenHands in Docker Compose on Ubuntu 20.04
- Uses Supabase for auth and per‑user scoping (settings, secrets, conversations)
- Uses E2B as the agent runtime (no local Docker inside the runtime)
- Frontend served via the same container; Nginx reverse proxy in front

Prerequisites
- Ubuntu 20.04 VM with a public domain (e.g. app.example.com)
- Supabase project with GitHub provider enabled
- Supabase values: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- E2B account + API key

1) Install Docker and Nginx
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release nginx
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER && newgrp docker

2) Clone repo and prepare workspace
sudo mkdir -p /opt/agentmojo /opt/agentmojo/workspace ~/.openhands
sudo chown -R $USER:$USER /opt/agentmojo ~/.openhands
git clone https://github.com/sixtyoneeighty/AgMojo.git /opt/agentmojo

3) Environment (.env)
Create /opt/agentmojo/.env with:

DOMAIN=app.example.com
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_URL=https://YOUR-PROJECT.supabase.co

# Runtime: use E2B
RUNTIME=e2b
E2B_API_KEY=YOUR_E2B_API_KEY

# Optional overrides
# SANDBOX_RUNTIME_CONTAINER_IMAGE=
# OPENAI_API_KEY=

4) Build + run containers
cd /opt/agentmojo
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

Notes
- Compose will bake Vite build‑time vars into the frontend image (domain and Supabase values).
- The server enables Supabase auth and user‑scoped storage via environment in docker-compose.prod.yml:
 - OPENHANDS_CONFIG_CLS=openhands.server.config.supabase_server_config.SupabaseServerConfig
  - OPENHANDS_CONVERSATION_VALIDATOR_CLS=openhands.storage.conversation.supabase_conversation_validator.SupabaseConversationValidator

5) Nginx reverse proxy (WebSockets enabled)
Create /etc/nginx/conf.d/websocket.conf:

map $http_upgrade $connection_upgrade {
  default upgrade;
  ''      close;
}

Create /etc/nginx/sites-available/openhands:

server {
  listen 80;
  server_name app.example.com;
  client_max_body_size 50m;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_read_timeout 600s;
    proxy_send_timeout 600s;
  }
}

 Enable and reload:
sudo ln -sf /etc/nginx/sites-available/openhands /etc/nginx/sites-enabled/openhands
sudo nginx -t && sudo systemctl reload nginx

6) HTTPS (optional, Let’s Encrypt)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.example.com --redirect

Bootstrap script (optional)
- You can use `deploy/bootstrap-remote.sh` to automate most steps. Before running:
  export DOMAIN=app.example.com
  export VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
  export VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
  export SUPABASE_URL=https://YOUR-PROJECT.supabase.co
  export RUNTIME=e2b
  export E2B_API_KEY=YOUR_E2B_API_KEY
  # Optional: to auto-run Certbot
  export ADMIN_EMAIL=you@example.com

  sudo -E bash deploy/bootstrap-remote.sh

7) Verify
curl -I http://127.0.0.1:3000
# Then browse: http://app.example.com

8) Updates
cd /opt/agentmojo && git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

Troubleshooting
- E2B auth: ensure E2B_API_KEY is present in the container env (docker inspect or container logs)
- Supabase: confirm VITE_SUPABASE_* and SUPABASE_URL are correct; frontend login at /login
- WebSockets: Nginx must pass Upgrade/Connection headers; check container logs for socket connect
