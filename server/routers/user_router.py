from fastapi import APIRouter, Depends

from models import User
from schemas.user_schemas import UserProfile
from utils.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["用户"])


@router.get("/profile", response_model=UserProfile, summary="获取用户信息")
async def get_profile(current_user: User = Depends(get_current_user)):
    """
    获取本地当前用户信息。
    """
    return UserProfile.model_validate(current_user)
