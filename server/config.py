import os
from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # 配置文件的模型，字段名与环境变量名对应

    # 单用户模式
    DEFAULT_USERNAME: str = "local"

    # 数据库配置
    DATABASE_URL: Optional[str] = "sqlite:///./linkbox.db"

    # AI 配置
    AI_BASE_URL: str = "https://api.siliconflow.cn/v1"
    AI_MODEL: str = "moonshotai/Kimi-K2-Instruct"
    AI_API_KEY: Optional[str] = None

    @property
    def app_data_dir(self) -> Optional[Path]:
        data_dir = os.environ.get("LINKBOX_DATA_DIR")
        if not data_dir:
            return None

        return Path(data_dir).expanduser().resolve()

    def _resolve_sqlite_url(self, raw_url: str) -> str:
        sqlite_prefix = "sqlite:///"
        if not raw_url.startswith(sqlite_prefix):
            return raw_url

        raw_path = raw_url[len(sqlite_prefix) :]
        db_path = Path(raw_path)
        base_dir = self.app_data_dir or Path.cwd()

        if db_path.is_absolute():
            resolved_path = db_path.resolve()
        else:
            resolved_path = (base_dir / db_path).resolve()

        resolved_path.parent.mkdir(parents=True, exist_ok=True)
        return f"{sqlite_prefix}{resolved_path.as_posix()}"

    @property
    def database_url(self) -> str:
        """获取当前使用的 SQLite 连接串。"""
        if self.DATABASE_URL:
            return self._resolve_sqlite_url(self.DATABASE_URL)

        return self._resolve_sqlite_url("sqlite:///./linkbox.db")

    # Pydantic Settings 配置
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent / ".env",  # 指定加载 .env 文件
        env_file_encoding="utf-8",  # .env 文件编码
        extra="ignore",  # 忽略 .env 文件中未在模型中定义的变量
        # env_prefix="MY_APP_"        # 可选：为所有环境变量添加前缀，如 MY_APP_DATABASE_URL
    )


# 创建配置实例
settings = Settings()
