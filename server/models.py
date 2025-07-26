from sqlalchemy import Boolean, Column, DateTime, Index, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()


class User(Base):
    """用户表"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True, comment="用户ID")
    username = Column(String(50), unique=True, nullable=False, comment="用户名")
    password = Column(String(255), nullable=False, comment="密码")
    created_at = Column(DateTime, default=func.now(), comment="创建时间")
    updated_at = Column(
        DateTime, default=func.now(), onupdate=func.now(), comment="更新时间"
    )
    is_deleted = Column(Boolean, default=False, comment="是否删除")

    __table_args__ = (Index("idx_username", "username"),)


class Resource(Base):
    """资源表"""

    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, autoincrement=True, comment="资源ID")
    url = Column(String(1000), nullable=False, comment="资源链接")
    title = Column(String(500), nullable=False, comment="资源标题")
    digest = Column(Text, nullable=False, comment="资源摘要")
    user_id = Column(Integer, nullable=False, comment="用户ID")
    created_at = Column(DateTime, default=func.now(), comment="创建时间")
    updated_at = Column(
        DateTime, default=func.now(), onupdate=func.now(), comment="更新时间"
    )
    is_deleted = Column(Boolean, default=False, comment="是否删除")

    __table_args__ = (Index("idx_user_id", "user_id"),)


class Tag(Base):
    """标签表"""

    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, autoincrement=True, comment="标签ID")
    name = Column(String(100), nullable=False, comment="标签名称")
    user_id = Column(Integer, nullable=False, comment="用户ID")
    created_at = Column(DateTime, default=func.now(), comment="创建时间")
    updated_at = Column(
        DateTime, default=func.now(), onupdate=func.now(), comment="更新时间"
    )
    is_deleted = Column(Boolean, default=False, comment="是否删除")

    __table_args__ = (
        Index("idx_user_id", "user_id"),
        Index("unique_user_tag", "user_id", "name", unique=True),
    )


class ResourceTag(Base):
    """资源标签关联表"""

    __tablename__ = "resource_tags"

    id = Column(Integer, primary_key=True, autoincrement=True, comment="关联ID")
    resource_id = Column(Integer, nullable=False, comment="资源ID")
    tag_id = Column(Integer, nullable=False, comment="标签ID")
    user_id = Column(Integer, nullable=False, comment="用户ID")
    created_at = Column(DateTime, default=func.now(), comment="创建时间")
    updated_at = Column(
        DateTime, default=func.now(), onupdate=func.now(), comment="更新时间"
    )
    is_deleted = Column(Boolean, default=False, comment="是否删除")

    __table_args__ = (
        Index("idx_user_id_tag_id", "user_id", "tag_id"),
        Index("unique_resource_tag", "resource_id", "tag_id", unique=True),
    )
