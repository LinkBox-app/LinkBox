from fastapi import Depends
from sqlalchemy.orm import Session

from crud.user_crud import ensure_single_user
from database import get_db
from models import User


def get_current_user(
    db: Session = Depends(get_db),
) -> User:
    """获取本地单用户模式下的默认用户。"""
    return ensure_single_user(db)
