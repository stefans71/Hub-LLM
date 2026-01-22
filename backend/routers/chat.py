"""
Chat Router - Handles AI chat requests
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import json

from services.openrouter import OpenRouterService, ClaudeDirectService

router = APIRouter()


class Message(BaseModel):
    role: str  # "user", "assistant", "system"
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    model: str = "anthropic/claude-sonnet-4"
    temperature: float = 0.7
    max_tokens: int = 4096
    stream: bool = True
    provider: str = "openrouter"  # "openrouter" or "claude_direct"
    project_id: Optional[str] = None  # For context


class ChatResponse(BaseModel):
    content: str
    model: str
    usage: Optional[dict] = None


def get_api_key(
    x_openrouter_key: Optional[str] = Header(None),
    x_claude_key: Optional[str] = Header(None)
) -> dict:
    """Extract API keys from headers - BYOK model"""
    return {
        "openrouter": x_openrouter_key,
        "claude": x_claude_key
    }


@router.post("/completions")
async def chat_completion(
    request: ChatRequest,
    api_keys: dict = Depends(get_api_key)
):
    """
    Send a chat completion request to the selected provider
    
    Headers:
        X-OpenRouter-Key: Your OpenRouter API key
        X-Claude-Key: Your Anthropic API key (for direct Claude access)
    """
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    
    # Select provider
    if request.provider == "claude_direct":
        if not api_keys.get("claude"):
            raise HTTPException(
                status_code=401,
                detail="Claude API key required. Add X-Claude-Key header."
            )
        service = ClaudeDirectService(api_keys["claude"])
    else:
        if not api_keys.get("openrouter"):
            raise HTTPException(
                status_code=401,
                detail="OpenRouter API key required. Add X-OpenRouter-Key header."
            )
        service = OpenRouterService(api_keys["openrouter"])
    
    try:
        if request.stream:
            return StreamingResponse(
                stream_response(service, messages, request),
                media_type="text/event-stream"
            )
        else:
            response = await service.chat(
                messages=messages,
                model=request.model,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                stream=False
            )
            
            # Extract content based on provider response format
            if request.provider == "claude_direct":
                content = response["content"][0]["text"]
            else:
                content = response["choices"][0]["message"]["content"]
            
            return ChatResponse(
                content=content,
                model=request.model,
                usage=response.get("usage")
            )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def stream_response(service, messages: list, request: ChatRequest):
    """Generator for streaming responses"""
    try:
        async for chunk in await service.chat(
            messages=messages,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            stream=True
        ):
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        yield "data: [DONE]\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


@router.get("/models")
async def list_models(api_keys: dict = Depends(get_api_key)):
    """Get available models from OpenRouter"""
    if not api_keys.get("openrouter"):
        raise HTTPException(
            status_code=401,
            detail="OpenRouter API key required"
        )
    
    service = OpenRouterService(api_keys["openrouter"])
    models = await service.list_models()
    
    return {"models": models}


@router.get("/usage")
async def get_usage(api_keys: dict = Depends(get_api_key)):
    """Get API usage/credits info"""
    if not api_keys.get("openrouter"):
        raise HTTPException(
            status_code=401,
            detail="OpenRouter API key required"
        )
    
    service = OpenRouterService(api_keys["openrouter"])
    usage = await service.get_usage()
    
    return usage
