from typing import List, Optional, Tuple

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from crud.tag_crud import create_tag_if_not_exists, get_tags_by_resource
from errors import BusinessError
from models import Resource, ResourceTag, Tag


def create_resource(
    db: Session, url: str, title: str, digest: str, tags: List[str], user_id: int
) -> Resource:
    """创建资源"""
    # 检查URL是否已存在
    existing_resource = (
        db.query(Resource)
        .filter(
            Resource.user_id == user_id,
            Resource.url == url,
            Resource.is_deleted == False,
        )
        .first()
    )

    if existing_resource:
        raise BusinessError("该链接已经收藏过了")

    # 创建资源
    db_resource = Resource(url=url, title=title, digest=digest, user_id=user_id)
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)

    # 处理标签
    for tag_name in tags:
        tag_name = tag_name.strip()
        if tag_name:
            tag = create_tag_if_not_exists(db, user_id, tag_name)
            resource_tag = ResourceTag(
                resource_id=db_resource.id, tag_id=tag.id, user_id=user_id
            )
            db.add(resource_tag)

    db.commit()
    return db_resource


def get_resource_by_id(
    db: Session, resource_id: int, user_id: int
) -> Optional[Resource]:
    """根据ID获取资源"""
    return (
        db.query(Resource)
        .filter(
            Resource.id == resource_id,
            Resource.user_id == user_id,
            Resource.is_deleted == False,
        )
        .first()
    )


def update_resource(
    db: Session,
    resource_id: int,
    user_id: int,
    title: str = None,
    digest: str = None,
    tags: List[str] = None,
) -> Optional[Resource]:
    """更新资源"""
    resource = get_resource_by_id(db, resource_id, user_id)
    if not resource:
        return None

    # 更新基本信息
    if title is not None:
        resource.title = title
    if digest is not None:
        resource.digest = digest

    # 处理标签更新
    if tags is not None:
        # 获取当前标签
        current_tags = get_tags_by_resource(db, resource_id, user_id)
        current_tag_names = {tag.name for tag in current_tags}
        new_tag_names = {tag_name.strip() for tag_name in tags if tag_name.strip()}

        # 删除不再需要的标签关联
        tags_to_remove = current_tag_names - new_tag_names
        if tags_to_remove:
            db.query(ResourceTag).filter(
                ResourceTag.resource_id == resource_id,
                ResourceTag.user_id == user_id,
                ResourceTag.tag_id.in_(
                    db.query(Tag.id).filter(
                        Tag.name.in_(tags_to_remove), Tag.user_id == user_id
                    )
                ),
            ).update({"is_deleted": True})

        # 添加新的标签关联
        tags_to_add = new_tag_names - current_tag_names
        for tag_name in tags_to_add:
            tag = create_tag_if_not_exists(db, user_id, tag_name)
            # 检查是否存在已删除的关联
            existing_relation = (
                db.query(ResourceTag)
                .filter(
                    ResourceTag.resource_id == resource_id,
                    ResourceTag.tag_id == tag.id,
                    ResourceTag.user_id == user_id,
                )
                .first()
            )

            if existing_relation:
                existing_relation.is_deleted = False
            else:
                resource_tag = ResourceTag(
                    resource_id=resource_id, tag_id=tag.id, user_id=user_id
                )
                db.add(resource_tag)

    db.commit()
    db.refresh(resource)
    return resource


def delete_resource(db: Session, resource_id: int, user_id: int) -> bool:
    """删除资源（软删除）"""
    resource = get_resource_by_id(db, resource_id, user_id)
    if not resource:
        return False

    # 软删除资源
    resource.is_deleted = True

    # 删除相关的标签关联
    db.query(ResourceTag).filter(
        ResourceTag.resource_id == resource_id, ResourceTag.user_id == user_id
    ).update({"is_deleted": True})

    db.commit()
    return True


def get_resources_by_tag(
    db: Session, user_id: int, tag_name: str, page: int = 1, size: int = 20
) -> Tuple[List[dict], int]:
    """根据标签获取资源"""
    # 查找标签
    tag = (
        db.query(Tag)
        .filter(Tag.user_id == user_id, Tag.name == tag_name, Tag.is_deleted == False)
        .first()
    )

    if not tag:
        return [], 0

    # 查找该标签下的资源
    offset = (page - 1) * size

    # 分步查询：先获取资源ID，再获取资源详情
    # 第一步：获取该标签关联的所有资源ID
    resource_tag_relations = (
        db.query(ResourceTag.resource_id)
        .filter(
            ResourceTag.tag_id == tag.id,
            ResourceTag.user_id == user_id,
            ResourceTag.is_deleted == False,
        )
        .all()
    )

    if not resource_tag_relations:
        return [], 0

    # 提取资源ID列表
    resource_ids = [relation.resource_id for relation in resource_tag_relations]

    # 第二步：根据资源ID查询资源详情
    resources = (
        db.query(Resource)
        .filter(
            Resource.id.in_(resource_ids),
            Resource.is_deleted == False,
        )
        .order_by(Resource.created_at.desc())
        .offset(offset)
        .limit(size)
        .all()
    )

    # 计算总数
    total = (
        db.query(Resource)
        .filter(
            Resource.id.in_(resource_ids),
            Resource.is_deleted == False,
        )
        .count()
    )

    # 为每个资源获取所有标签（使用简化版本）
    results = []
    for resource in resources:
        # 简化标签获取，避免复杂查询
        resource_tags = (
            db.query(ResourceTag.tag_id)
            .filter(
                ResourceTag.resource_id == resource.id,
                ResourceTag.user_id == user_id,
                ResourceTag.is_deleted == False,
            )
            .all()
        )

        tag_ids = [rt.tag_id for rt in resource_tags]
        tags = (
            (db.query(Tag).filter(Tag.id.in_(tag_ids), Tag.is_deleted == False).all())
            if tag_ids
            else []
        )

        results.append({"resource": resource, "tags": tags})

    return results, total


def get_resources_by_user(
    db: Session, user_id: int, page: int = 1, size: int = 20
) -> Tuple[List[dict], int]:
    """按用户获取全部资源"""
    offset = (page - 1) * size

    base_query = (
        db.query(Resource)
        .filter(Resource.user_id == user_id, Resource.is_deleted == False)
        .order_by(Resource.created_at.desc())
    )

    total = base_query.count()
    resources = base_query.offset(offset).limit(size).all()

    results: List[dict] = []
    for resource in resources:
        tags = get_tags_by_resource(db, resource.id, user_id)
        results.append({"resource": resource, "tags": tags})

    return results, total


def search_resources_multi_dimensional(
    db: Session, query: str, user_id: int, page: int = 1, size: int = 20
) -> Tuple[List[dict], int]:
    """
    多维度搜索资源：同时搜索标签名、资源标题、资源摘要

    Args:
        db: 数据库会话
        query: 搜索关键词
        user_id: 用户ID
        page: 页码
        size: 每页数量

    Returns:
        (资源列表, 总数)
    """
    search_term = f"%{query}%"
    offset = (page - 1) * size

    # 构建搜索查询
    # 方式一：通过标签搜索
    tag_resource_ids = (
        db.query(ResourceTag.resource_id)
        .join(Tag, ResourceTag.tag_id == Tag.id)
        .filter(
            Tag.user_id == user_id,
            Tag.name.ilike(search_term),
            Tag.is_deleted == False,
            ResourceTag.is_deleted == False,
        )
        .subquery()
    )

    # 方式二：直接在资源中搜索
    resources_query = (
        db.query(Resource)
        .filter(
            Resource.user_id == user_id,
            Resource.is_deleted == False,
            or_(
                # 通过标签匹配
                Resource.id.in_(tag_resource_ids),
                # 直接在标题和摘要中搜索
                Resource.title.ilike(search_term),
                Resource.digest.ilike(search_term),
            ),
        )
        .order_by(Resource.created_at.desc())
    )

    # 获取总数
    total = resources_query.count()

    # 分页查询
    resources = resources_query.offset(offset).limit(size).all()

    # 为每个资源获取标签
    results = []
    for resource in resources:
        # 获取资源的标签
        resource_tags = (
            db.query(ResourceTag.tag_id)
            .filter(
                ResourceTag.resource_id == resource.id,
                ResourceTag.user_id == user_id,
                ResourceTag.is_deleted == False,
            )
            .all()
        )

        tag_ids = [rt.tag_id for rt in resource_tags]
        tags = (
            (db.query(Tag).filter(Tag.id.in_(tag_ids), Tag.is_deleted == False).all())
            if tag_ids
            else []
        )

        results.append({"resource": resource, "tags": tags})

    return results, total


def find_related_tags(db: Session, keywords: List[str], user_id: int) -> List[Tag]:
    """
    根据关键词找到相关标签

    Args:
        db: 数据库会话
        keywords: 关键词列表
        user_id: 用户ID

    Returns:
        相关标签列表
    """
    if not keywords:
        return []

    # 构建OR条件，匹配任意关键词
    conditions = []
    for keyword in keywords:
        conditions.append(Tag.name.ilike(f"%{keyword}%"))

    tags = (
        db.query(Tag)
        .filter(Tag.user_id == user_id, Tag.is_deleted == False, or_(*conditions))
        .order_by(Tag.name)
        .all()
    )

    return tags


def search_resources_by_content(
    db: Session, query: str, user_id: int, search_type: str = "all"
) -> List[dict]:
    """
    根据内容类型搜索资源

    Args:
        db: 数据库会话
        query: 搜索查询
        user_id: 用户ID
        search_type: 搜索类型 ("tags", "title", "digest", "all")

    Returns:
        资源列表
    """
    search_term = f"%{query}%"

    if search_type == "tags":
        # 只搜索标签
        tag_resource_ids = (
            db.query(ResourceTag.resource_id)
            .join(Tag, ResourceTag.tag_id == Tag.id)
            .filter(
                Tag.user_id == user_id,
                Tag.name.ilike(search_term),
                Tag.is_deleted == False,
                ResourceTag.is_deleted == False,
            )
        )

        resources = (
            db.query(Resource)
            .filter(
                Resource.user_id == user_id,
                Resource.is_deleted == False,
                Resource.id.in_(tag_resource_ids),
            )
            .order_by(Resource.created_at.desc())
            .all()
        )

    elif search_type == "title":
        # 只搜索标题
        resources = (
            db.query(Resource)
            .filter(
                Resource.user_id == user_id,
                Resource.is_deleted == False,
                Resource.title.ilike(search_term),
            )
            .order_by(Resource.created_at.desc())
            .all()
        )

    elif search_type == "digest":
        # 只搜索摘要
        resources = (
            db.query(Resource)
            .filter(
                Resource.user_id == user_id,
                Resource.is_deleted == False,
                Resource.digest.ilike(search_term),
            )
            .order_by(Resource.created_at.desc())
            .all()
        )

    else:  # "all"
        # 使用多维度搜索
        results, _ = search_resources_multi_dimensional(
            db, query, user_id, page=1, size=100
        )
        return results

    # 为每个资源获取标签
    results = []
    for resource in resources:
        tags = get_tags_by_resource(db, resource.id, user_id)
        results.append({"resource": resource, "tags": tags})

    return results
