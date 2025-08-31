import os

from openhands.server.config.server_config import ServerConfig
from openhands.server.types import AppMode


class SaasServerConfig(ServerConfig):
    """Minimal config shim to surface APP_MODE=saas for the frontend.

    This enables the login modal to appear first in the UI. It does not include
    the full SAAS authentication backend (e.g., /api/authenticate).
    Optionally passes AUTH_URL to the frontend for generating OAuth redirects.
    """

    app_mode = AppMode.SAAS

    def get_config(self) -> dict[str, object]:
        config = super().get_config()
        auth_url = os.environ.get("AUTH_URL")
        if auth_url:
            config["AUTH_URL"] = auth_url
        return config

