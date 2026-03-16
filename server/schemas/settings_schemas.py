from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AISettingsBase(BaseModel):
    """AI 配置基础模型"""

    ai_base_url: str = Field(..., min_length=1, max_length=500, description="AI 接口地址")
    ai_model: str = Field(..., min_length=1, max_length=255, description="AI 模型名称")
    ai_api_key: str = Field(default="", description="AI API Key")


class AISettingsResponse(AISettingsBase):
    """AI 配置响应模型"""

    updated_at: Optional[datetime] = Field(default=None, description="最近更新时间")

    class Config:
        from_attributes = True


class AISettingsUpdate(AISettingsBase):
    """AI 配置更新模型"""


class AISettingsTestResponse(BaseModel):
    """AI 配置测试响应模型"""

    message: str = Field(description="测试结果")
    model: str = Field(description="测试时使用的模型")
