// Here are the list of verified models and providers that we know work well with OpenHands.
export const VERIFIED_PROVIDERS = ["openai", "gemini"];
export const VERIFIED_MODELS = [
  // OpenAI
  "gpt-5",
  "o3",
  "gpt-5-mini",
  "o4-mini",
  // Google Gemini
  "gemini-2.5-pro",
  "gemini-2.5-flash",
];

// LiteLLM does not return OpenAI models with the provider, so we list them here to set them ourselves for consistency
// (e.g., they return `gpt-4o` instead of `openai/gpt-4o`)
export const VERIFIED_OPENAI_MODELS = [
  "gpt-5",
  "o3",
  "gpt-5-mini",
  "o4-mini",
];

// LiteLLM does not return the compatible Anthropic models with the provider, so we list them here to set them ourselves
// (e.g., they return `claude-3-5-sonnet-20241022` instead of `anthropic/claude-3-5-sonnet-20241022`)
export const VERIFIED_ANTHROPIC_MODELS: string[] = [];

// LiteLLM does not return the compatible Mistral models with the provider, so we list them here to set them ourselves
// (e.g., they return `devstral-small-2505` instead of `mistral/devstral-small-2505`)
export const VERIFIED_MISTRAL_MODELS: string[] = [];

// LiteLLM does not return the compatible OpenHands models with the provider, so we list them here to set them ourselves
// (e.g., they return `claude-sonnet-4-20250514` instead of `openhands/claude-sonnet-4-20250514`)
export const VERIFIED_OPENHANDS_MODELS: string[] = [];

// Default model for OpenHands provider
export const DEFAULT_OPENHANDS_MODEL = "";
