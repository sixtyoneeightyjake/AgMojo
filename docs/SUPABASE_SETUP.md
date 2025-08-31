Supabase Auth + Storage (GitHub OAuth)

Overview
- Frontend uses Supabase for GitHub OAuth (login page at `/login`).
- Backend identifies users via the Supabase JWT and stores per-user settings, provider tokens, and conversations in per-user file paths: `users/{user_id}/...`.
- GitHub access token from OAuth is synced automatically to the backend so users don’t have to paste tokens.

Prerequisites
- Supabase project with GitHub provider enabled.
- Values for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Frontend configuration
1) In `frontend/.env` (or environment), set:
   - `VITE_SUPABASE_URL=<your-supabase-url>`
   - `VITE_SUPABASE_ANON_KEY=<your-anon-key>`

Backend configuration
1) Set the server config class to enable Supabase auth + per-user stores:
   - `OPENHANDS_CONFIG_CLS=openhands.server.config.supabase_server_config.SupabaseServerConfig`
2) Provide Supabase base URL to the server (used for JWKS verification):
   - `SUPABASE_URL=<your-supabase-url>`
3) Use the Supabase conversation validator so conversation metadata is scoped per user:
   - `OPENHANDS_CONVERSATION_VALIDATOR_CLS=openhands.storage.conversation.supabase_conversation_validator.SupabaseConversationValidator`

Notes
- App mode remains `oss`, so no Keycloak modals appear. Login gating is handled on the `/login` page.
- The Axios client forwards the Supabase access token in `Authorization: Bearer <token>` so the server can identify the user from every request.
- Provider tokens are stored per-user in `users/{user_id}/secrets.json` after login.

Optional: Persist conversations in Supabase
- This patch scopes conversations per user on the filesystem.
- If you want to use Supabase DB for conversations/messages, we can add:
  - SQL to create `conversations`, `messages` tables with RLS (`auth.uid()`)
  - A `SupabaseConversationStore` that writes via Supabase REST using the user JWT
- Ask and I’ll wire this up next.
