from typing import List, Optional

from sqlalchemy.orm import Session

from errors import BusinessError
from models import ResourceTag, Tag


def get_user_tags(db: Session, user_id: int) -> List[Tag]:
    """获取用户的所有标签"""
    return (
        db.query(Tag)
        .filter(Tag.user_id == user_id, Tag.is_deleted == False)
        .order_by(Tag.name)
        .all()
    )


def get_tag_by_name(db: Session, user_id: int, tag_name: str) -> Optional[Tag]:
    """根据名称获取用户的标签"""
    return (
        db.query(Tag)
        .filter(Tag.user_id == user_id, Tag.name == tag_name, Tag.is_deleted == False)
        .first()
    )


def create_tag(db: Session, user_id: int, tag_name: str) -> Tag:
    """创建新标签"""
    tag_name = tag_name.strip()
    
    if not tag_name:
        raise BusinessError("标签名称不能为空")
    
    # 检查标签是否已存在
    existing_tag = get_tag_by_name(db, user_id, tag_name)
    if existing_tag:
        raise BusinessError(f"标签 '{tag_name}' 已存在")

    db_tag = Tag(name=tag_name, user_id=user_id)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    
    return db_tag


def create_tag_if_not_exists(db: Session, user_id: int, tag_name: str) -> Tag:
    """创建标签（如果不存在则创建）"""
    tag_name = tag_name.strip()
    
    existing_tag = get_tag_by_name(db, user_id, tag_name)
    if existing_tag:
        return existing_tag

    db_tag = Tag(name=tag_name, user_id=user_id)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    
    return db_tag


def delete_tag(db: Session, tag_id: int, user_id: int) -> bool:
    """删除标签（软删除）"""
    try:
        # 首先检查标签是否存在且属于该用户
        tag = db.query(Tag).filter(
            Tag.id == tag_id,
            Tag.user_id == user_id,
            Tag.is_deleted == False
        ).first()
        
        if not tag:
            return False
        
        # 软删除标签
        tag.is_deleted = True
        
        # 软删除该标签在 resource_tags 表中的所有关联关系
        db.query(ResourceTag).filter(
            ResourceTag.tag_id == tag_id,
            ResourceTag.user_id == user_id,
            ResourceTag.is_deleted == False
        ).update({"is_deleted": True})
        
        db.commit()
        return True
        
    except Exception as e:
        db.rollback()
        raise e


def get_tags_by_resource(db: Session, resource_id: int, user_id: int) -> List[Tag]:
    """获取资源的所有标签"""
    # 首先获取该资源的标签ID列表
    tag_ids_query = (
        db.query(ResourceTag.tag_id)
        .filter(
            ResourceTag.resource_id == resource_id,
            ResourceTag.user_id == user_id,
            ResourceTag.is_deleted == False,
        )
    )
    
    # 然后查询这些标签
    return (
        db.query(Tag)
        .filter(
            Tag.id.in_(tag_ids_query),
            Tag.is_deleted == False,
        )
        .all()
    )
