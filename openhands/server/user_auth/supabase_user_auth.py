from __future__ import annotations

import asyncio
import json
import os
from dataclasses import dataclass
from typing import Any, ClassVar

import httpx
from fastapi import Request
from jose import jwt
from jose.exceptions import JWTError
from pydantic import SecretStr

from openhands.integrations.provider import PROVIDER_TOKEN_TYPE
from openhands.server.user_auth.default_user_auth import DefaultUserAuth


_JWKS_CACHE: dict[str, dict[str, Any]] = {}
_JWKS_LOCK = asyncio.Lock()


async def _fetch_jwks(jwks_url: str) -> dict[str, Any]:
    async with _JWKS_LOCK:
        cached = _JWKS_CACHE.get(jwks_url)
        if cached:
            return cached
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(jwks_url)
            resp.raise_for_status()
            jwks = resp.json()
            _JWKS_CACHE[jwks_url] = jwks
            return jwks


def _get_bearer_token_from_request(request: Request) -> str | None:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.lower().startswith("bearer "):
        return auth_header.split(" ", 1)[1]
    # As a fallback, try Supabase cookie (if proxied)
    cookie_token = request.cookies.get("sb-access-token")
    if cookie_token:
        return cookie_token
    return None


@dataclass
class SupabaseUserAuth(DefaultUserAuth):
    """UserAuth implementation that authenticates requests using a Supabase JWT.

    - Extracts a Supabase access token from the Authorization header or cookie
    - Verifies the token using Supabase JWKS
    - Exposes user_id (sub) and email from claims

    Storage methods are inherited from DefaultUserAuth and will scope to the
    returned user_id when constructing stores via shared.*Impl.
    """

    _request: Request | None = None
    _claims: dict[str, Any] | None = None
    _access_token: str | None = None

    # JWKS and issuer configuration
    _jwks_url: ClassVar[str | None] = None
    _issuer: ClassVar[str | None] = None

    async def _ensure_config(self) -> None:
        if not self._jwks_url:
            supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get(
                "VITE_SUPABASE_URL"
            )
            if not supabase_url:
                raise ValueError(
                    "SUPABASE_URL (or VITE_SUPABASE_URL) must be set for Supabase auth"
                )
            # Normalize base URL
            supabase_url = supabase_url.rstrip("/")
            self.__class__._jwks_url = f"{supabase_url}/auth/v1/jwks"
            self.__class__._issuer = f"{supabase_url}/auth/v1"

    async def _load_claims(self) -> None:
        if self._claims is not None:
            return
        await self._ensure_config()
        assert self._jwks_url and self._issuer
        token = _get_bearer_token_from_request(self._request) if self._request else None
        self._access_token = token
        if not token:
            self._claims = None
            return
        try:
            jwks = await _fetch_jwks(self._jwks_url)
            unverified_header = jwt.get_unverified_header(token)
            rsa_key: dict[str, Any] | None = None
            for key in jwks.get("keys", []):
                if key.get("kid") == unverified_header.get("kid"):
                    rsa_key = {
                        "kty": key.get("kty"),
                        "kid": key.get("kid"),
                        "use": key.get("use"),
                        "n": key.get("n"),
                        "e": key.get("e"),
                    }
                    break
            if rsa_key is None:
                # Fallback: if no kid matched, try first key
                keys = jwks.get("keys", [])
                if keys:
                    k = keys[0]
                    rsa_key = {
                        "kty": k.get("kty"),
                        "kid": k.get("kid"),
                        "use": k.get("use"),
                        "n": k.get("n"),
                        "e": k.get("e"),
                    }
            if not rsa_key:
                self._claims = None
                return
            claims = jwt.decode(
                token,
                rsa_key,
                algorithms=["RS256"],
                issuer=self._issuer,
                options={"verify_aud": False},
            )
            # Ensure it's JSON-serializable and cached
            self._claims = json.loads(json.dumps(claims))
        except (JWTError, Exception):
            self._claims = None

    async def get_user_id(self) -> str | None:
        await self._load_claims()
        if not self._claims:
            return None
        # Supabase sets `sub` to the user UUID
        return self._claims.get("sub")

    async def get_user_email(self) -> str | None:
        await self._load_claims()
        if not self._claims:
            return None
        return self._claims.get("email")

    async def get_access_token(self) -> SecretStr | None:
        await self._load_claims()
        if not self._access_token:
            return None
        return SecretStr(self._access_token)

    async def get_provider_tokens(self) -> PROVIDER_TOKEN_TYPE | None:
        # Provider tokens are managed via the SecretsStore and populated by the UI.
        return await super().get_provider_tokens()

    def get_auth_type(self):
        # Return None so the app treats Supabase-authenticated users as normal GUI users
        # (not as remote API callers that require an initial user message).
        # Auth itself still uses the Authorization bearer token.
        return None

    @classmethod
    async def get_instance(cls, request: Request) -> "SupabaseUserAuth":
        return SupabaseUserAuth(_request=request)

