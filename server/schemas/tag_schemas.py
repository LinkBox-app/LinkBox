from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class TagResponse(BaseModel):
    """标签响应模型"""
    id: int = Field(description="标签ID")
    name: str = Field(description="标签名称")
    user_id: int = Field(description="用户ID")
    created_at: Optional[datetime] = Field(default=None, description="创建时间")
    
    class Config:
        from_attributes = True


class TagCreateRequest(BaseModel):
    """创建标签请求模型"""
    name: str = Field(..., min_length=1, max_length=50, description="标签名称")


class TagListResponse(BaseModel):
    """标签列表响应模型"""
    tags: List[str] = Field(description="标签名称列表")


class TagDeleteResponse(BaseModel):
    """删除标签响应模型"""
    message: str = Field(description="删除结果消息")