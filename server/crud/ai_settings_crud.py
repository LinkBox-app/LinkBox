from typing import Optional

from sqlalchemy.orm import Session

from models import AISettings


def get_ai_settings_by_user(db: Session, user_id: int) -> Optional[AISettings]:
    """获取用户的 AI 配置。"""
    return db.query(AISettings).filter(AISettings.user_id == user_id).first()


def upsert_ai_settings(
    db: Session,
    user_id: int,
    ai_base_url: str,
    ai_model: str,
    ai_api_key: str,
) -> AISettings:
    """创建或更新用户的 AI 配置。"""
    ai_settings = get_ai_settings_by_user(db, user_id)

    if ai_settings is None:
        ai_settings = AISettings(
            user_id=user_id,
            ai_base_url=ai_base_url,
            ai_model=ai_model,
            ai_api_key=ai_api_key,
        )
        db.add(ai_settings)
    else:
        ai_settings.ai_base_url = ai_base_url
        ai_settings.ai_model = ai_model
        ai_settings.ai_api_key = ai_api_key

    db.commit()
    db.refresh(ai_settings)

    return ai_settings
