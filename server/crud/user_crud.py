from sqlalchemy.orm import Session
from typing import Optional
from models import User
from schemas.user_schemas import UserRegister, UserLogin
from errors import BusinessError


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


def create_user(db: Session, user_data: UserRegister) -> User:
    """创建新用户"""
    # 检查用户名是否已存在
    existing_user = get_user_by_username(db, user_data.username)
    if existing_user:
        raise BusinessError("用户名已存在")
    
    # 创建新用户（密码明文存储）
    db_user = User(
        username=user_data.username,
        password=user_data.password  # 明文存储密码
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
    
    # 直接比较明文密码
    if user.password != password:
        return None
    
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