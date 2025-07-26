from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # 配置文件的模型，字段名与环境变量名对应

    # 数据库配置
    MYSQL_HOST: str
    MYSQL_PORT: int
    MYSQL_USER: str
    MYSQL_PASSWORD: str
    MYSQL_DB: str = "linkbox"

    # JWT 配置
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24  # 1天过期

    # AI 配置
    AI_BASE_URL: str = "https://api.siliconflow.cn/v1"
    AI_MODEL: str = "moonshotai/Kimi-K2-Instruct"
    AI_API_KEY: str

    # Pydantic Settings 配置
    model_config = SettingsConfigDict(
        env_file=".env",  # 指定加载 .env 文件
        env_file_encoding="utf-8",  # .env 文件编码
        extra="ignore",  # 忽略 .env 文件中未在模型中定义的变量
        # env_prefix="MY_APP_"        # 可选：为所有环境变量添加前缀，如 MY_APP_DATABASE_URL
    )


# 创建配置实例
settings = Settings()
