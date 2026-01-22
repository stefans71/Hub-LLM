"""
Voice Router - Handle voice input transcription

Note: Primary voice processing happens client-side using Web Speech API.
This endpoint is for server-side processing if needed (e.g., Whisper API).
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Header
from pydantic import BaseModel
from typing import Optional
import httpx
import os

router = APIRouter()


class TranscriptionResponse(BaseModel):
    text: str
    confidence: Optional[float] = None
    language: Optional[str] = None


class TranscriptionRequest(BaseModel):
    audio_base64: str
    language: str = "en"


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    x_openai_key: Optional[str] = Header(None)
):
    """
    Transcribe audio using OpenAI Whisper API
    
    This is optional - the frontend uses Web Speech API by default.
    Use this for higher accuracy or when Web Speech API isn't available.
    
    Headers:
        X-OpenAI-Key: Your OpenAI API key for Whisper
    """
    if not x_openai_key:
        raise HTTPException(
            status_code=401,
            detail="OpenAI API key required for server-side transcription. "
                   "Use Web Speech API on frontend for free transcription."
        )
    
    # Read audio file
    audio_data = await file.read()
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {x_openai_key}"},
            files={"file": (file.filename, audio_data, file.content_type)},
            data={"model": "whisper-1"}
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Whisper API error: {response.text}"
            )
        
        result = response.json()
        return TranscriptionResponse(
            text=result["text"],
            language=result.get("language")
        )


@router.get("/info")
async def voice_info():
    """
    Information about voice capabilities
    """
    return {
        "client_side": {
            "technology": "Web Speech API",
            "cost": "Free",
            "browser_support": ["Chrome", "Edge", "Safari"],
            "note": "Recommended for most users"
        },
        "server_side": {
            "technology": "OpenAI Whisper",
            "cost": "Pay per use",
            "requires": "OpenAI API key",
            "note": "Higher accuracy, works in all browsers"
        }
    }
