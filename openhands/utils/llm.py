import warnings

import httpx

with warnings.catch_warnings():
    warnings.simplefilter('ignore')
    import litellm

from openhands.core.config import LLMConfig, OpenHandsConfig
from openhands.core.logger import openhands_logger as logger
from openhands.llm import bedrock


def get_supported_llm_models(config: OpenHandsConfig) -> list[str]:
    """Return the restricted, supported LLM models for this build.

    Only expose OpenAI and Google Gemini models, as requested.

    Returns:
        list[str]: A sorted list of unique model names.
    """
    # Respect existing config to avoid unused-import warnings
    _ = isinstance(config.get_llm_config(), LLMConfig)

    # Restrict to these exact models/providers
    restricted_models = [
        # OpenAI
        'openai/gpt-5',
        'openai/o3',
        'openai/gpt-5-mini',
        'openai/o4-mini',
        # Google Gemini
        'gemini/gemini-2.5-pro',
        'gemini/gemini-2.5-flash',
    ]

    return list(sorted(set(restricted_models)))
