from fastapi import HTTPException, Request
from fastapi.exceptions import ValidationException
from fastapi.responses import JSONResponse
from pydantic import ValidationError


class BusinessError(Exception):
    """业务逻辑异常"""
    def __init__(self, message: str = "业务处理失败"):
        self.message = message
        super().__init__(self.message)


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
