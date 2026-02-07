"""
Settings Router - User settings management
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy import select

from models import UserSetting, async_session

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
    async with async_session() as session:
        result = await session.execute(select(UserSetting))
        settings = result.scalars().all()
        return {s.key: s.value for s in settings}


@router.get("/{key}", response_model=SettingResponse)
async def get_setting(key: str):
    """Get a specific setting by key"""
    async with async_session() as session:
        result = await session.execute(select(UserSetting).where(UserSetting.key == key))
        setting = result.scalar_one_or_none()
        if not setting:
            return SettingResponse(key=key, value=None)
        return SettingResponse(key=setting.key, value=setting.value)


@router.put("/{key}", response_model=SettingResponse)
async def set_setting(key: str, update: SettingUpdate):
    """Set a specific setting"""
    async with async_session() as session:
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
    async with async_session() as session:
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
    async with async_session() as session:
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


# INFRA-03B: Idle timeout configuration endpoint
class IdleTimeoutConfig(BaseModel):
    enabled: bool
    timeout_minutes: int = 120


@router.post("/idle-timeout")
async def configure_idle_timeout(config: IdleTimeoutConfig):
    """Enable/disable idle connection timeout at runtime"""
    from services.vps_connection import vps_manager

    if config.enabled:
        vps_manager.idle_timeout = config.timeout_minutes * 60
        vps_manager.start_idle_checker()
        return {"status": "enabled", "timeout_minutes": config.timeout_minutes}
    else:
        vps_manager.stop_idle_checker()
        return {"status": "disabled"}


@router.get("/idle-timeout")
async def get_idle_timeout_status():
    """Get current idle timeout configuration"""
    from services.vps_connection import vps_manager

    is_running = (
        vps_manager._idle_checker_task is not None
        and not vps_manager._idle_checker_task.done()
    )
    return {
        "enabled": is_running,
        "timeout_minutes": vps_manager.idle_timeout // 60
    }
