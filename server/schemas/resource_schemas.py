from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, HttpUrl


class ResourceResponse(BaseModel):
    """资源响应模型"""
    id: int
    url: str
    title: str
    digest: str
    user_id: int
    tags: List[str] = Field(default_factory=list, description="资源标签列表")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ResourceUpdate(BaseModel):
    """更新资源模型"""
    title: Optional[str] = Field(None, max_length=500, description="资源标题")
    digest: Optional[str] = Field(None, description="资源摘要")
    tags: Optional[List[str]] = Field(None, description="标签列表")


class ResourceListResponse(BaseModel):
    """资源列表响应模型"""
    resources: List[ResourceResponse]
    total: int
    page: int
    size: int
    pages: int


class ResourcePreviewRequest(BaseModel):
    """资源预览请求模型"""
    url: HttpUrl = Field(..., description="资源链接")
    note: Optional[str] = Field("", description="用户备注")


class ResourcePreviewResponse(BaseModel):
    """资源预览响应模型"""
    title: str = Field(..., description="AI生成的标题")
    tags: List[str] = Field(..., description="AI生成的标签列表")
    digest: str = Field(..., description="AI生成的摘要")
    url: str = Field(..., description="原始链接")


class ResourceCreateRequest(BaseModel):
    """创建资源请求模型"""
    url: HttpUrl = Field(..., description="资源链接")
    title: str = Field(..., max_length=500, description="资源标题")
    tags: List[str] = Field(..., description="标签列表")
    digest: str = Field(..., description="资源摘要")