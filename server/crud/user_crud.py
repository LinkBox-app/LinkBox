from sqlalchemy.orm import Session
from typing import Optional

from config import settings
from models import User
from schemas.user_schemas import UserRegister
from errors import BusinessError
from utils.password_utils import hash_password, verify_password, is_hashed_password


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """根据用户名获取用户"""
    return db.query(User).filter(
        User.username == username,
        User.is_deleted == False
    ).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """根据用户ID获取用户"""
    return db.query(User).filter(
        User.id == user_id,
        User.is_deleted == False
    ).first()


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
            default_user.password = hash_password("local-only-user")
        db.commit()
        db.refresh(default_user)
        return default_user

    db_user = User(
        username=settings.DEFAULT_USERNAME,
        password=hash_password("local-only-user"),
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def create_user(db: Session, user_data: UserRegister) -> User:
    """创建新用户"""
    # 检查用户名是否已存在
    existing_user = get_user_by_username(db, user_data.username)
    if existing_user:
        raise BusinessError("用户名已存在")
    
    # 创建新用户（密码哈希存储）
    db_user = User(
        username=user_data.username,
        password=hash_password(user_data.password),
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """验证用户登录"""
    user = get_user_by_username(db, username)
    
    if not user:
        return None
    
    # 优先使用哈希校验
    if is_hashed_password(user.password):
        return user if verify_password(password, user.password) else None

    # 兼容历史明文密码数据：登录成功后自动升级为哈希
    if user.password != password:
        return None

    user.password = hash_password(password)
    db.commit()
    db.refresh(user)

    return user


def update_user(db: Session, user_id: int, update_data: dict) -> Optional[User]:
    """更新用户信息"""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    for key, value in update_data.items():
        if hasattr(user, key) and value is not None:
            setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    
    return user


def delete_user(db: Session, user_id: int) -> bool:
    """软删除用户"""
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    
    user.is_deleted = True
    db.commit()
    
    return True
