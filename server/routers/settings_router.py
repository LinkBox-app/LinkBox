from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from crud.ai_settings_crud import get_ai_settings_by_user, upsert_ai_settings
from database import get_db
from errors import BusinessError
from models import User
from schemas.settings_schemas import (
    AISettingsResponse,
    AISettingsTestResponse,
    AISettingsUpdate,
)
from utils.ai_client import get_effective_ai_settings, test_chat_model
from utils.auth import get_current_user

router = APIRouter(prefix="/settings", tags=["应用设置"])


@router.get("/ai", response_model=AISettingsResponse, summary="获取 AI 配置")
async def get_ai_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取当前用户生效中的 AI 配置。"""
    stored_settings = get_ai_settings_by_user(db, current_user.id)
    effective_settings = get_effective_ai_settings(db, current_user.id)

    return AISettingsResponse(
        **effective_settings.model_dump(),
        updated_at=stored_settings.updated_at if stored_settings else None,
    )


@router.put("/ai", response_model=AISettingsResponse, summary="保存 AI 配置")
async def update_ai_settings(
    payload: AISettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """保存当前用户的 AI 配置。"""
    try:
        normalized_payload = AISettingsUpdate(
            ai_base_url=payload.ai_base_url.strip(),
            ai_model=payload.ai_model.strip(),
            ai_api_key=payload.ai_api_key.strip(),
        )
        ai_settings = upsert_ai_settings(
            db=db,
            user_id=current_user.id,
            ai_base_url=normalized_payload.ai_base_url,
            ai_model=normalized_payload.ai_model,
            ai_api_key=normalized_payload.ai_api_key,
        )
        return AISettingsResponse.model_validate(ai_settings)
    except BusinessError as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"保存 AI 配置失败: {str(e)}")


@router.post("/ai/test", response_model=AISettingsTestResponse, summary="测试 AI 配置")
async def test_ai_settings(
    payload: AISettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """测试当前表单中的 AI 配置是否可用，不会写入数据库。"""
    try:
        _ = current_user.id
        _ = db.bind
        normalized_payload = AISettingsUpdate(
            ai_base_url=payload.ai_base_url.strip(),
            ai_model=payload.ai_model.strip(),
            ai_api_key=payload.ai_api_key.strip(),
        )
        reply = await test_chat_model(normalized_payload)
        return {
            "message": f"连接成功，模型回复：{reply}",
            "model": normalized_payload.ai_model,
        }
    except BusinessError as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"测试 AI 配置失败: {str(e)}")
