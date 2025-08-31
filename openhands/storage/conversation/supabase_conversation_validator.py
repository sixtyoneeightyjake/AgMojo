from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any

import httpx
from jose import jwt
from jose.exceptions import JWTError

from openhands.core.config.utils import load_openhands_config
from openhands.core.logger import openhands_logger as logger
from openhands.server.config.server_config import ServerConfig
from openhands.storage.conversation.conversation_store import ConversationStore
from openhands.storage.conversation.conversation_validator import (
    ConversationValidator,
)
from openhands.storage.data_models.conversation_metadata import ConversationMetadata
from openhands.utils.conversation_summary import get_default_conversation_title
from openhands.utils.import_utils import get_impl


async def _get_jwks(supabase_url: str) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(f"{supabase_url.rstrip('/')}/auth/v1/jwks")
        resp.raise_for_status()
        return resp.json()


class SupabaseConversationValidator(ConversationValidator):
    async def validate(
        self,
        conversation_id: str,
        cookies_str: str,
        authorization_header: str | None = None,
    ) -> str | None:
        user_id: str | None = None
        token: str | None = None
        if authorization_header and authorization_header.lower().startswith("bearer "):
            token = authorization_header.split(" ", 1)[1]

        supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get(
            "VITE_SUPABASE_URL"
        )
        if token and supabase_url:
            try:
                jwks = await _get_jwks(supabase_url)
                unverified = jwt.get_unverified_header(token)
                rsa_key = None
                for k in jwks.get("keys", []):
                    if k.get("kid") == unverified.get("kid"):
                        rsa_key = {
                            "kty": k.get("kty"),
                            "kid": k.get("kid"),
                            "use": k.get("use"),
                            "n": k.get("n"),
                            "e": k.get("e"),
                        }
                        break
                if rsa_key:
                    claims = jwt.decode(
                        token,
                        rsa_key,
                        algorithms=["RS256"],
                        issuer=f"{supabase_url.rstrip('/')}/auth/v1",
                        options={"verify_aud": False},
                    )
                    user_id = claims.get("sub")
            except (JWTError, Exception) as e:
                logger.warning(f"Supabase token verification failed: {e}")

        # Ensure metadata exists and is attributed to this user (if present)
        config = load_openhands_config()
        server_config = ServerConfig()
        conversation_store_class: type[ConversationStore] = get_impl(
            ConversationStore,
            server_config.conversation_store_class,
        )
        conversation_store = await conversation_store_class.get_instance(
            config, user_id
        )

        try:
            metadata = await conversation_store.get_metadata(conversation_id)
        except FileNotFoundError:
            logger.info(
                f'Creating new conversation metadata for {conversation_id}',
                extra={'session_id': conversation_id},
            )
            await conversation_store.save_metadata(
                ConversationMetadata(
                    conversation_id=conversation_id,
                    user_id=user_id,
                    title=get_default_conversation_title(conversation_id),
                    last_updated_at=datetime.now(timezone.utc),
                    selected_repository=None,
                )
            )
            metadata = await conversation_store.get_metadata(conversation_id)

        return metadata.user_id

