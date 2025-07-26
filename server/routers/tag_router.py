from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from crud import tag_crud
from database import get_db
from errors import BusinessError
from models import User
from schemas.tag_schemas import TagCreateRequest, TagDeleteResponse, TagListResponse, TagResponse
from utils.auth import get_current_user

router = APIRouter(prefix="/tags", tags=["标签管理"])


@router.get("/", response_model=List[TagResponse], summary="获取用户所有标签")
async def get_user_tags(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """
    获取用户的所有标签详细信息

    返回用户创建的所有标签的详细信息列表，包括ID、名称等
    """
    try:
        tags = tag_crud.get_user_tags(db, current_user.id)
        return [TagResponse.model_validate(tag) for tag in tags]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取标签失败: {str(e)}")


@router.post("/", response_model=TagResponse, summary="创建标签")
async def create_tag(
    tag_request: TagCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    创建新标签

    - **name**: 标签名称（1-50个字符）
    """
    try:
        tag = tag_crud.create_tag(db, current_user.id, tag_request.name)
        return TagResponse.model_validate(tag)

    except BusinessError as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建标签失败: {str(e)}")


@router.delete("/{tag_id}", response_model=TagDeleteResponse, summary="删除标签")
async def delete_tag(
    tag_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    删除标签（软删除）

    - **tag_id**: 标签ID
    
    删除标签时会同时删除该标签与所有资源的关联关系
    """
    try:
        success = tag_crud.delete_tag(db, tag_id, current_user.id)

        if not success:
            raise HTTPException(status_code=404, detail="标签不存在")

        return {"message": "标签删除成功"}

    except HTTPException:
        raise
    except BusinessError as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除标签失败: {str(e)}")