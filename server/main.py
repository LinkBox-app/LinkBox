import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from database import create_tables

# 导入全局异常处理
from errors import (
    AuthenticationError,
    AuthorizationError,
    BusinessError,
    authentication_exception_handler,
    authorization_exception_handler,
    business_exception_handler,
    general_exception_handler,
    validation_exception_handler,
)
from routers.ai_router import router as ai_router
from routers.resource_router import router as resource_router
from routers.tag_router import router as tag_router

# 导入路由
from routers.user_router import router as user_router

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    logger.info("正在启动应用...")
    try:
        # 创建数据库表
        create_tables()
        logger.info("数据库表创建成功")
    except Exception as e:
        logger.error(f"数据库表创建失败: {e}")
        raise

    yield

    # 关闭时执行
    logger.info("应用正在关闭...")


app = FastAPI(
    title="LinkBox API",
    description="智能链接收藏夹应用",
    version="1.0.0",
    lifespan=lifespan,
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许的前端地址
    allow_credentials=True,  # 允许携带cookie
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有HTTP头
)

# 注册全局异常处理器
app.add_exception_handler(AuthenticationError, authentication_exception_handler)
app.add_exception_handler(AuthorizationError, authorization_exception_handler)
app.add_exception_handler(BusinessError, business_exception_handler)
app.add_exception_handler(ValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# 注册路由
app.include_router(user_router)
app.include_router(resource_router)
app.include_router(tag_router)
app.include_router(ai_router)


@app.get("/")
async def root():
    """根路径"""
    return {"message": "Linkbox API 正在运行"}


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7032)
