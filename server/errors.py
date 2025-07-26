from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import ValidationException
from pydantic import ValidationError


class AuthenticationError(Exception):
    """认证失败异常"""
    def __init__(self, message: str = "认证失败"):
        self.message = message
        super().__init__(self.message)


class AuthorizationError(Exception):
    """权限不足异常"""
    def __init__(self, message: str = "权限不足"):
        self.message = message
        super().__init__(self.message)


class BusinessError(Exception):
    """业务逻辑异常"""
    def __init__(self, message: str = "业务处理失败"):
        self.message = message
        super().__init__(self.message)


async def authentication_exception_handler(request: Request, exc: AuthenticationError):
    """认证异常处理器"""
    return JSONResponse(
        status_code=401,
        content={
            "error": "AUTHENTICATION_FAILED",
            "message": exc.message,
            "detail": "请检查您的登录凭据"
        }
    )


async def authorization_exception_handler(request: Request, exc: AuthorizationError):
    """权限异常处理器"""
    return JSONResponse(
        status_code=403,
        content={
            "error": "AUTHORIZATION_FAILED",
            "message": exc.message,
            "detail": "您没有权限访问此资源"
        }
    )


async def business_exception_handler(request: Request, exc: BusinessError):
    """业务异常处理器"""
    return JSONResponse(
        status_code=400,
        content={
            "error": "BUSINESS_ERROR",
            "message": exc.message,
            "detail": "业务处理失败"
        }
    )


async def validation_exception_handler(request: Request, exc: ValidationError):
    """数据验证异常处理器"""
    return JSONResponse(
        status_code=422,
        content={
            "error": "VALIDATION_ERROR",
            "message": "数据验证失败",
            "detail": exc.errors()
        }
    )


async def general_exception_handler(request: Request, exc: Exception):
    """通用异常处理器"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "message": "服务器内部错误",
            "detail": "请稍后再试或联系管理员"
        }
    )