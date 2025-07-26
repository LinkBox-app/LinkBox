from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from crud.user_crud import authenticate_user, create_user
from database import get_db
from errors import AuthenticationError, BusinessError
from models import User
from schemas.user_schemas import (
    TokenResponse,
    UserLogin,
    UserProfile,
    UserRegister,
    UserResponse,
)
from utils.auth import get_current_user
from utils.jwt_utils import create_access_token

router = APIRouter(prefix="/auth", tags=["用户认证"])


@router.post("/register", response_model=TokenResponse, summary="用户注册")
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    用户注册接口

    - **username**: 用户名（3-50个字符）
    - **password**: 密码（6-100个字符）

    返回JWT token和用户信息
    """
    try:
        # 创建用户
        new_user = create_user(db, user_data)

        # 生成JWT token
        access_token = create_access_token(
            data={"user_id": new_user.id, "username": new_user.username}
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(new_user),
        )

    except BusinessError as e:
        raise HTTPException(status_code=400, detail=e.message)


@router.post("/login", response_model=TokenResponse, summary="用户登录")
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    用户登录接口

    - **username**: 用户名
    - **password**: 密码

    返回JWT token和用户信息
    """
    # 验证用户
    user = authenticate_user(db, login_data.username, login_data.password)

    if not user:
        raise AuthenticationError("用户名或密码错误")

    # 生成JWT token
    access_token = create_access_token(
        data={"user_id": user.id, "username": user.username}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/profile", response_model=UserProfile, summary="获取用户信息")
async def get_profile(current_user: User = Depends(get_current_user)):
    """
    获取当前用户信息（需要认证）

    需要在请求头中包含: Authorization: Bearer <token>
    """
    return UserProfile.model_validate(current_user)


@router.post("/refresh", response_model=TokenResponse, summary="刷新Token")
async def refresh_token(current_user: User = Depends(get_current_user)):
    """
    刷新JWT token（需要认证）

    需要在请求头中包含: Authorization: Bearer <token>
    """
    # 生成新的JWT token
    access_token = create_access_token(
        data={"user_id": current_user.id, "username": current_user.username}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(current_user),
    )
