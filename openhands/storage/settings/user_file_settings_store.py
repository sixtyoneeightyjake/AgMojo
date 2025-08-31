from __future__ import annotations

from dataclasses import dataclass

from openhands.core.config.openhands_config import OpenHandsConfig
from openhands.storage import get_file_store
from openhands.storage.settings.file_settings_store import FileSettingsStore
from openhands.storage.settings.settings_store import SettingsStore


@dataclass
class UserFileSettingsStore(FileSettingsStore):
    """A FileSettingsStore that scopes settings to a specific user ID.

    Stores at `users/{user_id}/settings.json`.
    """

    @classmethod
    async def get_instance(
        cls, config: OpenHandsConfig, user_id: str | None
    ) -> SettingsStore:
        file_store = get_file_store(
            file_store_type=config.file_store,
            file_store_path=config.file_store_path,
            file_store_web_hook_url=config.file_store_web_hook_url,
            file_store_web_hook_headers=config.file_store_web_hook_headers,
            file_store_web_hook_batch=config.file_store_web_hook_batch,
        )
        path = "settings.json" if not user_id else f"users/{user_id}/settings.json"
        return UserFileSettingsStore(file_store=file_store, path=path)

