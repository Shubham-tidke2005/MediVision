from functools import lru_cache
from typing import TypeVar

import openai

from openai import OpenAI

from pydantic import (
    BaseModel,
    SecretStr,
    ValidationError,
)

from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)

from app.ai.prompts import (
    PROVIDER_CHECK_SYSTEM_PROMPT,
)

from app.ai.schemas import (
    AIProviderCheckResponse,
)


T = TypeVar(
    "T",
    bound=BaseModel,
)


# =========================================================
# EXCEPTIONS
# =========================================================


class AIProviderError(RuntimeError):
    """
    Base exception for AI provider failures.
    """


class AIProviderConfigurationError(
    AIProviderError
):
    """
    Provider is missing configuration or has
    invalid authentication.
    """


class AIProviderRateLimitError(
    AIProviderError
):
    """
    Provider temporarily rejected the request
    because of rate limits.
    """


class AIProviderUnavailableError(
    AIProviderError
):
    """
    Provider could not be reached or returned
    an API-level failure.
    """


class AIProviderResponseError(
    AIProviderError
):
    """
    Provider returned no usable structured result.
    """


# =========================================================
# SETTINGS
# =========================================================


class AISettings(BaseSettings):
    openai_api_key: SecretStr

    openai_model: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_ai_settings() -> AISettings:
    try:
        return AISettings()

    except ValidationError as exc:
        raise AIProviderConfigurationError(
            "AI provider configuration is missing "
            "or invalid."
        ) from exc


# =========================================================
# OPENAI CLIENT
# =========================================================


@lru_cache
def get_openai_client() -> OpenAI:
    settings = get_ai_settings()

    return OpenAI(
        api_key=(
            settings
            .openai_api_key
            .get_secret_value()
        ),
        timeout=30.0,
        max_retries=2,
    )


# =========================================================
# STRUCTURED OUTPUT
# =========================================================


def generate_structured_response(
    *,
    system_prompt: str,
    user_prompt: str,
    response_model: type[T],
) -> T:
    """
    Send a request through the OpenAI Responses API
    and require the result to match a Pydantic model.

    The caller receives a validated Pydantic object,
    not arbitrary model text.
    """

    settings = get_ai_settings()

    client = get_openai_client()

    try:
        response = client.responses.parse(
            model=settings.openai_model,

            input=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],

            text_format=response_model,
        )

    except openai.AuthenticationError as exc:
        raise AIProviderConfigurationError(
            "AI provider authentication failed."
        ) from exc

    except openai.RateLimitError as exc:
        raise AIProviderRateLimitError(
            "AI provider rate limit was reached."
        ) from exc

    except (
        openai.APIConnectionError,
        openai.APITimeoutError,
    ) as exc:
        raise AIProviderUnavailableError(
            "AI provider is temporarily unavailable."
        ) from exc

    except openai.APIError as exc:
        raise AIProviderUnavailableError(
            "AI provider returned an API error."
        ) from exc


    parsed = response.output_parsed

    if parsed is None:
        raise AIProviderResponseError(
            "AI provider returned no valid "
            "structured response."
        )

    return parsed


# =========================================================
# PROVIDER CONNECTIVITY CHECK
# =========================================================


def run_provider_check(
) -> AIProviderCheckResponse:
    """
    Safe Phase-32 connectivity test.

    No patient information is sent.
    """

    return generate_structured_response(
        system_prompt=(
            PROVIDER_CHECK_SYSTEM_PROMPT
        ),

        user_prompt=(
            "Perform the provider connectivity "
            "check now."
        ),

        response_model=(
            AIProviderCheckResponse
        ),
    )