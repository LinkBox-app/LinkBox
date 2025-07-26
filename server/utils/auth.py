from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import User
from utils.jwt_utils import verify_token, get_user_id_from_token
from errors import AuthenticationError, AuthorizationError

# 创建 HTTPBearer 实例，用于从 Authorization header 提取 Bearer token
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """获取当前认证用户"""
    
    # 提取 token
    token = credentials.credentials
    
    # 验证 token
    payload = verify_token(token)
    if not payload:
        raise AuthenticationError("Token无效或已过期")
    
    # 从 token 中获取用户ID
    user_id = payload.get("user_id")
    if not user_id:
        raise AuthenticationError("Token格式错误")
    
    # 从数据库查询用户
    user = db.query(User).filter(
        User.id == user_id,
        User.is_deleted == False
    ).first()
    
    if not user:
        raise AuthenticationError("用户不存在或已被删除")
    
    return user


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """获取当前用户（可选认证，用于某些可以匿名访问的接口）"""
    
    if not credentials:
        return None
    
    try:
        return get_current_user(credentials, db)
    except (AuthenticationError, AuthorizationError):
        return None