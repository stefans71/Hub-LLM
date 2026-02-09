"""
Waitlist Router for HubLLM

Endpoints:
- POST / - Join the VibeShip.cloud beta waitlist (no auth required)
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import WaitlistSignup, get_session

router = APIRouter()


class WaitlistRequest(BaseModel):
    email: EmailStr
    source: str = "setup_wizard"


class WaitlistResponse(BaseModel):
    success: bool
    message: str


@router.post("/", response_model=WaitlistResponse)
async def join_waitlist(req: WaitlistRequest, session: AsyncSession = Depends(get_session)):
    """Add email to VibeShip.cloud beta waitlist. No auth required."""
    existing = await session.execute(
        select(WaitlistSignup).where(WaitlistSignup.email == req.email)
    )
    if existing.scalar_one_or_none():
        return WaitlistResponse(success=True, message="Already on the waitlist")

    signup = WaitlistSignup(email=req.email, source=req.source)
    session.add(signup)
    await session.commit()
    return WaitlistResponse(success=True, message="Added to waitlist")
