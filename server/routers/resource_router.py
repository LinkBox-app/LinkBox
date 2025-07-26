import math
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from crud import resource_crud, tag_crud
from database import get_db
from errors import BusinessError
from models import User
from schemas.resource_schemas import (
    ResourceCreateRequest,
    ResourceListResponse,
    ResourcePreviewRequest,
    ResourcePreviewResponse,
    ResourceResponse,
    ResourceUpdate,
)
from utils.auth import get_current_user

router = APIRouter(prefix="/resources", tags=["资源管理"])


@router.get(
    "/by-tag/{tag_name}",
    response_model=ResourceListResponse,
    summary="按标签分页查询资源",
)
async def get_resources_by_tag(
    tag_name: str,
    page: int = 1,
    size: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    根据标签名称分页获取资源列表

    - **tag_name**: 标签名称
    - **page**: 页码，从1开始
    - **size**: 每页数量，默认20，最大100
    """
    # 限制分页参数
    if page < 1:
        page = 1
    if size < 1 or size > 100:
        size = 20

    try:
        resources_data, total = resource_crud.get_resources_by_tag(
            db, current_user.id, tag_name, page, size
        )

        # 构建响应
        resources_response = []
        for item in resources_data:
            resource = item["resource"]
            tags = item["tags"]
            # 创建ResourceResponse并添加标签
            resource_dict = {
                **resource.__dict__,
                "tags": [tag.name for tag in tags]
            }
            resource_response = ResourceResponse.model_validate(resource_dict)
            resources_response.append(resource_response)

        # 计算总页数
        pages = math.ceil(total / size) if total > 0 else 1

        return ResourceListResponse(
            resources=resources_response, total=total, page=page, size=size, pages=pages
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"按标签查询失败: {str(e)}")


@router.put("/{resource_id}", response_model=ResourceResponse, summary="更新资源")
async def update_resource(
    resource_id: int,
    resource_data: ResourceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    更新资源信息

    - **resource_id**: 资源ID
    - **title**: 资源标题（可选）
    - **digest**: 资源摘要（可选）
    - **tags**: 标签列表（可选）
    """
    try:
        resource = resource_crud.update_resource(
            db,
            resource_id,
            current_user.id,
            title=resource_data.title,
            digest=resource_data.digest,
            tags=resource_data.tags,
        )

        if not resource:
            raise HTTPException(status_code=404, detail="资源不存在")

        # 获取资源的标签
        tags = tag_crud.get_tags_by_resource(db, resource.id, current_user.id)
        
        # 创建ResourceResponse并添加标签
        resource_dict = {
            **resource.__dict__,
            "tags": [tag.name for tag in tags]
        }
        
        return ResourceResponse.model_validate(resource_dict)

    except HTTPException:
        raise
    except BusinessError as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新资源失败: {str(e)}")


@router.delete("/{resource_id}", summary="删除资源")
async def delete_resource(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    删除资源（软删除）

    - **resource_id**: 资源ID
    """
    try:
        success = resource_crud.delete_resource(db, resource_id, current_user.id)

        if not success:
            raise HTTPException(status_code=404, detail="资源不存在")

        return {"message": "资源删除成功"}

    except HTTPException:
        raise
    except BusinessError as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除资源失败: {str(e)}")


@router.post("/preview", response_model=ResourcePreviewResponse, summary="生成资源预览")
async def create_resource_preview(
    request: ResourcePreviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    根据URL生成资源预览
    
    - **url**: 资源链接
    - **note**: 用户备注（可选）
    
    返回AI生成的标题、标签和摘要，供用户确认编辑
    """
    try:
        # 导入所需模块
        from utils.web_scraper import fetch_web_content_to_markdown
        from utils.ai_generator import generate_resource_summary
        
        # 获取网页内容
        web_content = fetch_web_content_to_markdown(str(request.url))
        
        # 获取用户已有的标签
        user_tags = tag_crud.get_user_tags(db, current_user.id)
        user_tag_names = [tag.name for tag in user_tags]
        
        # 使用AI生成摘要，并传递用户已有标签
        summary = generate_resource_summary(web_content, request.note, user_tag_names)
        
        return ResourcePreviewResponse(
            title=summary.title,
            tags=summary.tags,
            digest=summary.digest,
            url=str(request.url)
        )
        
    except BusinessError as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成资源预览失败: {str(e)}")


@router.post("/", response_model=ResourceResponse, summary="创建资源")
async def create_resource(
    request: ResourceCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    创建资源
    
    - **url**: 资源链接
    - **title**: 资源标题
    - **tags**: 标签列表
    - **digest**: 资源摘要
    """
    try:
        resource = resource_crud.create_resource(
            db=db,
            url=str(request.url),
            title=request.title,
            digest=request.digest,
            tags=request.tags,
            user_id=current_user.id
        )
        
        # 获取资源的标签
        tags = tag_crud.get_tags_by_resource(db, resource.id, current_user.id)
        
        # 创建ResourceResponse并添加标签
        resource_dict = {
            **resource.__dict__,
            "tags": [tag.name for tag in tags]
        }
        
        return ResourceResponse.model_validate(resource_dict)
        
    except BusinessError as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建资源失败: {str(e)}")
