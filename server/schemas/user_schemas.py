from datetime import datetime

from pydantic import BaseModel


class UserProfile(BaseModel):
    """用户个人信息模型"""
    id: int
    username: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
