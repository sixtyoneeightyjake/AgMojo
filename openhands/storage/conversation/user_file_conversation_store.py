from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from openhands.core.config.openhands_config import OpenHandsConfig
from openhands.storage import get_file_store
from openhands.storage.conversation.file_conversation_store import (
    FileConversationStore,
)
from openhands.storage.locations import get_conversation_metadata_filename


def get_conversation_metadata_dir(user_id: str | None) -> str:
    if user_id:
        return f"users/{user_id}/conversations"
    else:
        return "sessions"


@dataclass
class UserFileConversationStore(FileConversationStore):
    """A FileConversationStore that scopes conversation metadata to a specific user ID.

    Layout:
      users/{user_id}/conversations/{conversation_id}/metadata.json
    """

    user_id: str | None = None

    def get_conversation_metadata_dir(self) -> str:
        return get_conversation_metadata_dir(self.user_id)

    def get_conversation_metadata_filename(self, conversation_id: str) -> str:
        # Reuse helper for correct per-user path
        from openhands.storage.locations import get_conversation_metadata_filename

        return get_conversation_metadata_filename(conversation_id, self.user_id)

    @classmethod
    async def get_instance(
        cls, config: OpenHandsConfig, user_id: str | None
    ) -> "UserFileConversationStore":
        file_store = get_file_store(
            file_store_type=config.file_store,
            file_store_path=config.file_store_path,
            file_store_web_hook_url=config.file_store_web_hook_url,
            file_store_web_hook_headers=config.file_store_web_hook_headers,
            file_store_web_hook_batch=config.file_store_web_hook_batch,
        )
        return UserFileConversationStore(file_store=file_store, user_id=user_id)
