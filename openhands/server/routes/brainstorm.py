from __future__ import annotations

from typing import Literal
import os

from fastapi import APIRouter, Depends
from jinja2 import Environment, FileSystemLoader
from pydantic import BaseModel, Field

from openhands.core.config.llm_config import LLMConfig
from openhands.llm.llm_registry import LLMRegistry
from openhands.server.dependencies import get_dependencies
from openhands.server.shared import config
from openhands.server.user_auth import get_user_settings
from openhands.storage.data_models.settings import Settings


app = APIRouter(prefix='/api', dependencies=get_dependencies())


class BrainstormMessage(BaseModel):
    role: Literal['system', 'user', 'assistant']
    content: str


class BrainstormRequest(BaseModel):
    messages: list[BrainstormMessage] = Field(default_factory=list)


@app.post('/brainstorm')
async def brainstorm(req: BrainstormRequest, settings: Settings = Depends(get_user_settings)) -> dict[str, str]:
    """Return a brainstorming response using Gemini 2.5 Flash with a dedicated prompt.

    Notes:
      - This endpoint does not start the runtime or agent loop.
      - It uses a separate, non-coding system prompt and prevents tool execution by design.
      - Requires a valid Gemini API key to be configured (via settings or environment).
    """
    # Load the brainstorm system prompt
    env = Environment(loader=FileSystemLoader('openhands/agenthub/brainstorm/prompts'))
    template = env.get_template('system_prompt_brainstorm.j2')
    system_prompt = template.render()

    # Assemble messages with system prompt at the front
    messages = [{'role': 'system', 'content': system_prompt}] + [m.model_dump() for m in req.messages]

    # Provider selection order (most explicit to least):
    # A) Dedicated config group [llm.brainstorm] if present in config.toml
    # B) Env overrides: BRAINSTORM_MODEL / BRAINSTORM_API_KEY / BRAINSTORM_BASE_URL
    # C) X.AI via XAI_API_KEY (default model xai/grok-4-0709, overridable by XAI_MODEL)
    # D) If user settings uses an xai/grok model, reuse it
    # E) Fallback to Gemini Flash
    model: str
    api_key = settings.llm_api_key if settings and settings.llm_api_key else None
    base_url = None

    if 'brainstorm' in config.llms:
        # Fully configured from TOML
        return _respond_with_llm(config.llms['brainstorm'], messages)

    # Dedicated env override
    bs_model = os.getenv('BRAINSTORM_MODEL')
    bs_key = os.getenv('BRAINSTORM_API_KEY')
    bs_base = os.getenv('BRAINSTORM_BASE_URL')
    if bs_model and bs_key:
        from pydantic import SecretStr

        llm_cfg = LLMConfig(
            model=bs_model,
            api_key=SecretStr(bs_key),
            base_url=bs_base,
            temperature=0.7,
            max_output_tokens=1024,
        )
        return _respond_with_llm(llm_cfg, messages)

    xai_key = os.getenv('XAI_API_KEY')
    if xai_key:
        model = os.getenv('XAI_MODEL', 'xai/grok-4-0709')
        from pydantic import SecretStr

        api_key = SecretStr(xai_key)
        base_url = None  # LiteLLM knows the default for X.AI
    elif settings and settings.llm_model and ('grok' in settings.llm_model or settings.llm_model.startswith('xai/')):
        model = settings.llm_model
        # api_key/base_url already set above from settings
    else:
        model = 'gemini/gemini-2.5-flash'

    llm_cfg = LLMConfig(
        model=model,
        api_key=api_key,  # type: ignore[arg-type]
        base_url=base_url,
        temperature=0.7,
        max_output_tokens=1024,
        safety_settings=[
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
        ],
    )
    return _respond_with_llm(llm_cfg, messages)


def _respond_with_llm(llm_cfg: LLMConfig, messages: list[dict[str, str]]) -> dict[str, str]:
    registry = LLMRegistry(config)
    content = registry.request_extraneous_completion('brainstorm', llm_cfg, messages)
    return {'content': content}
