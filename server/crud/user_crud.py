from typing import Optional

from sqlalchemy.orm import Session

from config import settings
from models import User


def get_first_active_user(db: Session) -> Optional[User]:
    """获取第一个可用用户，用于单用户模式复用已有数据。"""
    return (
        db.query(User)
        .filter(User.is_deleted == False)
        .order_by(User.id.asc())
        .first()
    )


def ensure_single_user(db: Session) -> User:
    """确保单用户模式下始终存在一个可用用户。"""
    existing_user = get_first_active_user(db)
    if existing_user:
        return existing_user

    default_user = (
        db.query(User)
        .filter(User.username == settings.DEFAULT_USERNAME)
        .order_by(User.id.asc())
        .first()
    )
    if default_user:
        default_user.is_deleted = False
        if not default_user.password:
            default_user.password = "local-only-user"
        db.commit()
        db.refresh(default_user)
        return default_user

    db_user = User(
        username=settings.DEFAULT_USERNAME,
        password="local-only-user",
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user
