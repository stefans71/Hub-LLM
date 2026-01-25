"""
Settings Router - User settings management
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy import select

from models import UserSetting, get_session

router = APIRouter()


class SettingUpdate(BaseModel):
    value: Optional[str] = None


class SettingResponse(BaseModel):
    key: str
    value: Optional[str]


class SettingsBulkUpdate(BaseModel):
    settings: Dict[str, Optional[str]]


@router.get("/")
async def list_settings() -> Dict[str, Optional[str]]:
    """Get all user settings as key-value pairs"""
    async with get_session() as session:
        result = await session.execute(select(UserSetting))
        settings = result.scalars().all()
        return {s.key: s.value for s in settings}


@router.get("/{key}", response_model=SettingResponse)
async def get_setting(key: str):
    """Get a specific setting by key"""
    async with get_session() as session:
        result = await session.execute(select(UserSetting).where(UserSetting.key == key))
        setting = result.scalar_one_or_none()
        if not setting:
            return SettingResponse(key=key, value=None)
        return SettingResponse(key=setting.key, value=setting.value)


@router.put("/{key}", response_model=SettingResponse)
async def set_setting(key: str, update: SettingUpdate):
    """Set a specific setting"""
    async with get_session() as session:
        result = await session.execute(select(UserSetting).where(UserSetting.key == key))
        setting = result.scalar_one_or_none()

        if setting:
            setting.value = update.value
        else:
            setting = UserSetting(key=key, value=update.value)
            session.add(setting)

        await session.commit()
        await session.refresh(setting)
        return SettingResponse(key=setting.key, value=setting.value)


@router.delete("/{key}")
async def delete_setting(key: str):
    """Delete a setting"""
    async with get_session() as session:
        result = await session.execute(select(UserSetting).where(UserSetting.key == key))
        setting = result.scalar_one_or_none()
        if not setting:
            raise HTTPException(status_code=404, detail="Setting not found")

        await session.delete(setting)
        await session.commit()

    return {"status": "deleted", "key": key}


@router.post("/bulk")
async def bulk_update_settings(bulk: SettingsBulkUpdate) -> Dict[str, Optional[str]]:
    """Update multiple settings at once"""
    async with get_session() as session:
        for key, value in bulk.settings.items():
            result = await session.execute(select(UserSetting).where(UserSetting.key == key))
            setting = result.scalar_one_or_none()

            if setting:
                setting.value = value
            else:
                setting = UserSetting(key=key, value=value)
                session.add(setting)

        await session.commit()

    return bulk.settings
