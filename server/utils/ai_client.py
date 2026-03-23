from typing import Any, Optional
from sqlalchemy.orm import Session

from config import settings
from crud.ai_settings_crud import get_ai_settings_by_user
from errors import BusinessError
from schemas.settings_schemas import AISettingsUpdate


def _normalize_ai_settings(
    ai_base_url: Optional[str],
    ai_model: Optional[str],
    ai_api_key: Optional[str],
) -> AISettingsUpdate:
    """合并数据库与环境变量配置，生成当前可用的 AI 配置。"""
    return AISettingsUpdate(
        ai_base_url=(ai_base_url or settings.AI_BASE_URL).strip(),
        ai_model=(ai_model or settings.AI_MODEL).strip(),
        ai_api_key=(ai_api_key or settings.AI_API_KEY or "").strip(),
    )


def get_effective_ai_settings(db: Session, user_id: int) -> AISettingsUpdate:
    """获取用户当前生效的 AI 配置。"""
    stored_settings = get_ai_settings_by_user(db, user_id)
    if stored_settings is None:
        return _normalize_ai_settings(None, None, None)

    return _normalize_ai_settings(
        stored_settings.ai_base_url,
        stored_settings.ai_model,
        stored_settings.ai_api_key,
    )


def build_chat_model(
    config: AISettingsUpdate,
    *,
    streaming: bool,
) -> Any:
    """根据给定配置创建 ChatOpenAI 客户端。"""
    if not config.ai_base_url:
        raise BusinessError("请先在设置页填写 AI 接口地址")

    if not config.ai_model:
        raise BusinessError("请先在设置页填写 AI 模型名称")

    if not config.ai_api_key:
        raise BusinessError("请先在设置页填写 AI API Key")

    from langchain_openai import ChatOpenAI

    return ChatOpenAI(
        base_url=config.ai_base_url,
        api_key=config.ai_api_key,
        model=config.ai_model,
        streaming=streaming,
    )


def create_chat_model(
    db: Session,
    user_id: int,
    *,
    streaming: bool,
) -> Any:
    """根据用户当前生效的 AI 配置创建客户端。"""
    return build_chat_model(
        get_effective_ai_settings(db, user_id),
        streaming=streaming,
    )


async def test_chat_model(config: AISettingsUpdate) -> str:
    """测试给定 AI 配置是否可用。"""
    from langchain_core.messages import HumanMessage

    llm = build_chat_model(config, streaming=False)
    response = await llm.ainvoke([HumanMessage(content="请只回复 OK")])
    content = getattr(response, "content", "")
    if not content:
        raise BusinessError("连接成功，但模型没有返回内容")

    return str(content).strip()
