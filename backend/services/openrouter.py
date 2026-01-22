"""
OpenRouter Integration Service

Handles routing queries to any model available on OpenRouter.
Users bring their own API keys.
"""
import httpx
import json
from typing import AsyncGenerator, Optional
import os

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Popular models - users can use any OpenRouter model
POPULAR_MODELS = {
    "claude-4-sonnet": "anthropic/claude-sonnet-4",
    "claude-3.5-sonnet": "anthropic/claude-3.5-sonnet",
    "gpt-4o": "openai/gpt-4o",
    "gpt-4-turbo": "openai/gpt-4-turbo",
    "gemini-pro": "google/gemini-pro-1.5",
    "llama-3.1-70b": "meta-llama/llama-3.1-70b-instruct",
    "mistral-large": "mistralai/mistral-large",
    "codestral": "mistralai/codestral",
    "deepseek-coder": "deepseek/deepseek-coder",
}


class OpenRouterService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": os.getenv("APP_URL", "https://hubllm.dev"),
            "X-Title": "HubLLM"
        }
    
    async def list_models(self) -> list:
        """Get available models from OpenRouter"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{OPENROUTER_BASE_URL}/models",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json().get("data", [])
    
    async def chat(
        self,
        messages: list[dict],
        model: str = "anthropic/claude-sonnet-4",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        stream: bool = False
    ) -> dict | AsyncGenerator:
        """
        Send a chat completion request to OpenRouter
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: OpenRouter model identifier
            temperature: Sampling temperature
            max_tokens: Maximum tokens in response
            stream: Whether to stream the response
        """
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream
        }
        
        if stream:
            return self._stream_chat(payload)
        else:
            return await self._sync_chat(payload)
    
    async def _sync_chat(self, payload: dict) -> dict:
        """Non-streaming chat completion"""
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
    
    async def _stream_chat(self, payload: dict) -> AsyncGenerator[str, None]:
        """Streaming chat completion"""
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers=self.headers,
                json=payload
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            content = chunk["choices"][0]["delta"].get("content", "")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue
    
    async def get_usage(self) -> dict:
        """Get API usage/credits info"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{OPENROUTER_BASE_URL}/auth/key",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()


# Direct Claude API for Max subscribers
class ClaudeDirectService:
    """
    For users with Claude Max ($200/month) who want to use
    their subscription directly instead of paying per-token
    """
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.anthropic.com/v1"
        self.headers = {
            "x-api-key": api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
    
    async def chat(
        self,
        messages: list[dict],
        model: str = "claude-sonnet-4-20250514",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        stream: bool = False
    ) -> dict | AsyncGenerator:
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream
        }
        
        if stream:
            return self._stream_chat(payload)
        else:
            return await self._sync_chat(payload)
    
    async def _sync_chat(self, payload: dict) -> dict:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.base_url}/messages",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
    
    async def _stream_chat(self, payload: dict) -> AsyncGenerator[str, None]:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/messages",
                headers=self.headers,
                json=payload
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        try:
                            data = json.loads(line[6:])
                            if data["type"] == "content_block_delta":
                                yield data["delta"].get("text", "")
                        except (json.JSONDecodeError, KeyError):
                            continue
