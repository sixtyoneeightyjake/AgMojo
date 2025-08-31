from openhands.server.config.server_config import ServerConfig
from openhands.server.types import AppMode
import os


class SupabaseServerConfig(ServerConfig):
    """Server config that enables Supabase-based authentication and per-user stores.

    - Keeps APP_MODE as OSS to avoid Keycloak-specific frontend flows
    - Switches UserAuth to SupabaseUserAuth
    - Scopes settings, secrets, and conversation stores per user using file store
    """

    app_mode = AppMode.OSS
    user_auth_class = "openhands.server.user_auth.supabase_user_auth.SupabaseUserAuth"
    settings_store_class = (
        "openhands.storage.settings.user_file_settings_store.UserFileSettingsStore"
    )
    secret_store_class = (
        "openhands.storage.secrets.user_file_secrets_store.UserFileSecretsStore"
    )
    conversation_store_class = (
        "openhands.storage.conversation.user_file_conversation_store.UserFileConversationStore"
    )

    def verify_config(self):
        """Override base check to allow custom config via OPENHANDS_CONFIG_CLS.

        We also ensure Supabase URL is provided so auth can validate JWTs.
        """
        supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get(
            "VITE_SUPABASE_URL"
        )
        if not supabase_url:
            raise ValueError(
                "SUPABASE_URL (or VITE_SUPABASE_URL) must be set for Supabase auth"
            )
