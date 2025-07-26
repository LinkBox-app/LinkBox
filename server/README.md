# LinkBox 后端 API 🚀

LinkBox 的 FastAPI 后端服务，提供智能资源管理和 AI 对话功能。

## 🏗️ 技术栈

- **Python**: 3.13
- **Web 框架**: FastAPI
- **ORM 框架**: SQLAlchemy 2.0
- **AI 框架**: LangChain
- **数据验证**: Pydantic
- **数据库**: MySQL
- **认证**: JWT (PyJWT)
- **网页抓取**: Jina AI Reader API
- **部署**: Uvicorn + Gunicorn

## 📁 项目结构

```
server/
├── main.py                 # FastAPI 应用入口
├── models.py               # SQLAlchemy 数据库模型
├── database.py             # 数据库连接和会话管理
├── config.py               # 应用配置管理
├── errors.py               # 全局异常处理
├── requirements.txt        # 项目依赖
│
├── routers/                # API 路由模块
│   ├── user_router.py      # 用户认证路由
│   ├── resource_router.py  # 资源管理路由
│   ├── tag_router.py       # 标签管理路由
│   └── ai_router.py        # AI 对话路由
│
├── crud/                   # 数据库操作层
│   ├── user_crud.py        # 用户数据操作
│   ├── resource_crud.py    # 资源数据操作
│   └── tag_crud.py         # 标签数据操作
│
├── schemas/                # Pydantic 数据模型
│   ├── user_schemas.py     # 用户相关模型
│   ├── resource_schemas.py # 资源相关模型
│   ├── tag_schemas.py      # 标签相关模型
│   └── ai_schemas.py       # AI 对话模型
│
├── utils/                  # 工具函数
│   ├── jwt_utils.py        # JWT 工具
│   ├── auth.py             # 认证依赖
│   ├── ai_generator.py     # AI 内容生成
│   ├── web_scraper.py      # 网页内容抓取
│   └── langchain_tools.py  # LangChain 工具定义
│
└── test/                   # 测试文件
    ├── test_user_auth.py   # 用户认证测试
    ├── test_resource_api.py # 资源管理测试
    └── test_ai_router.py   # AI 功能测试
```

## 🗄️ 数据库设计

### 核心表结构

#### 用户表 (users)

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);
```

#### 资源表 (resources)

```sql
CREATE TABLE resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(2048) NOT NULL,
    title VARCHAR(500) NOT NULL,
    digest TEXT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    INDEX idx_user_id (user_id),
    INDEX idx_user_id_created_at (user_id, created_at)
);
```

#### 标签表 (tags)

```sql
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE KEY unique_user_tag (user_id, name),
    INDEX idx_user_id (user_id)
);
```

#### 资源标签关联表 (resource_tags)

```sql
CREATE TABLE resource_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resource_id INT NOT NULL,
    tag_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE KEY unique_resource_tag (resource_id, tag_id),
    INDEX idx_resource_id (resource_id),
    INDEX idx_tag_id (tag_id),
    INDEX idx_user_id_tag_id (user_id, tag_id)
);
```

### 设计特点

- **无外键约束**: 通过应用层维护数据一致性
- **软删除**: 所有表包含 `is_deleted` 字段
- **用户隔离**: 所有数据按 `user_id` 隔离
- **查询优化**: 针对常用查询场景建立复合索引

## 🚀 快速开始

### 1. 环境配置

创建 `.env` 文件：

```env
# 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DB=linkbox(必须预先在MySQL中创建此数据库)

# AI 配置
AI_BASE_URL=兼容OpenAI的API地址
AI_API_KEY=API密钥
AI_MODEL=模型名称

# JWT 配置
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 启动服务

#### 开发模式

```bash
python main.py
```

#### 生产模式

```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:7032
```

### 4. 访问 API 文档

- **Swagger UI**: http://localhost:7032/docs
- **ReDoc**: http://localhost:7032/redoc

## 📡 API 接口

### 🔐 认证模块 (`/auth`)

#### 用户注册

```http
POST /auth/register
Content-Type: application/json

{
  "username": "用户名",
  "password": "密码"
}
```

#### 用户登录

```http
POST /auth/login
Content-Type: application/json

{
  "username": "用户名",
  "password": "密码"
}
```

#### 获取用户信息

```http
GET /auth/profile
Authorization: Bearer <token>
```

### 📚 资源管理 (`/resources`)

#### 创建资源

```http
POST /resources
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://example.com",
  "title": "资源标题",
  "digest": "资源摘要",
  "tags": ["标签1", "标签2"]
}
```

#### 获取资源列表

```http
GET /resources?page=1&size=20
Authorization: Bearer <token>
```

#### 根据标签查询资源

```http
GET /resources/by-tag/{tag_name}?page=1&size=20
Authorization: Bearer <token>
```

#### 多维度搜索资源

```http
GET /resources/search?query=关键词&page=1&size=20
Authorization: Bearer <token>
```

### 🏷️ 标签管理 (`/tags`)

#### 获取用户标签

```http
GET /tags
Authorization: Bearer <token>
```

#### 创建标签

```http
POST /tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "标签名称"
}
```

### 🤖 AI 对话 (`/ai`)

#### 普通流式对话

```http
POST /ai/chat/stream
Authorization: Bearer <token>
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "你好"
    }
  ]
}
```

#### AI Agent 工具调用对话

```http
POST /ai/chat/agent
Authorization: Bearer <token>
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "帮我收藏这个网页：https://example.com"
    }
  ]
}
```

## 🤖 AI 功能详解

### LangChain 工具

#### 1. 资源搜索工具 (`search_resources`)

- **功能**: 智能搜索用户收藏的资源
- **输入**: 自然语言查询
- **流程**: AI 分析标签 → 筛选资源 → 返回匹配结果

#### 2. 资源预览工具 (`preview_resource`)

- **功能**: 根据 URL 生成资源预览
- **输入**: URL + 用户备注
- **流程**: 抓取网页 → AI 生成标题/标签/摘要

#### 3. 创建资源工具 (`create_resource`)

- **功能**: 保存资源到收藏夹
- **输入**: URL + 标题 + 标签 + 摘要
- **输出**: 保存结果

### 流式输出支持

- **SSE (Server-Sent Events)** 实时流式响应
- **进度反馈**: 工具执行进度的实时更新
- **多进程安全**: 无状态进度管理设计

## 🔧 开发指南

### 代码规范

- **命名规范**: 使用 snake_case 命名文件和函数
- **类型注解**: 所有函数参数和返回值必须有类型注解
- **文档字符串**: 重要函数需要添加中文文档字符串
- **错误处理**: 使用自定义异常类和全局异常处理

### 添加新功能

1. **定义数据模型**: 在 `schemas/` 中定义 Pydantic 模型
2. **实现 CRUD 操作**: 在 `crud/` 中实现数据库操作
3. **创建路由**: 在 `routers/` 中定义 API 路由
4. **注册路由**: 在 `main.py` 中注册新路由
5. **编写测试**: 在 `test/` 中添加测试用例

## 🛡️ 安全特性

- **JWT 认证**: 无状态身份验证
- **密码加密**: 生产环境建议使用哈希加密
- **输入验证**: Pydantic 数据验证
- **SQL 注入防护**: SQLAlchemy ORM 保护
- **CORS 支持**: 跨域请求配置
- **全局异常处理**: 统一错误响应格式

## 📊 性能优化

### 数据库优化

- **索引策略**: 针对查询模式优化索引
- **查询优化**: 避免 N+1 查询问题
- **连接池**: SQLAlchemy 连接池管理

### 应用优化

- **异步处理**: FastAPI 异步支持
- **缓存策略**: 适当使用缓存减少数据库查询
- **批量操作**: 支持批量数据操作

## 🚀 部署配置

### Docker 部署

```dockerfile
FROM python:3.13-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:7032"]
```

### 环境变量

- **开发环境**: 使用 `.env` 文件
- **生产环境**: 使用环境变量或配置管理服务
- **敏感信息**: 避免在代码中硬编码

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**

   - 检查 MySQL 服务是否启动
   - 验证连接信息是否正确
   - 确认数据库是否存在

2. **JWT Token 验证失败**

   - 检查 `JWT_SECRET_KEY` 配置
   - 确认 Token 格式是否正确
   - 验证 Token 是否过期

3. **AI API 调用失败**
   - 检查 `AI_API_KEY` 是否有效
   - 确认 `AI_BASE_URL` 配置正确
   - 检查网络连接和代理设置

### 日志配置

```python
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

## 📈 监控和运维

### 健康检查

```http
GET /health
```

### 应用指标

- 请求响应时间
- 数据库连接状态
- 内存和 CPU 使用情况
- 错误率统计

## 🤝 贡献指南

1. **Fork 项目**
2. **创建功能分支**: `git checkout -b feature/new-feature`
3. **提交更改**: `git commit -m 'Add new feature'`
4. **推送分支**: `git push origin feature/new-feature`
5. **创建 Pull Request**

## 📝 更新日志

### v1.0.0

- ✨ 完整的用户认证系统
- 📚 资源管理 CRUD 功能
- 🏷️ 标签系统和关联管理
- 🤖 AI 智能对话和工具调用
- 🔄 实时流式响应
- 🚀 支持多进程部署
- 📖 完整的 API 文档

---

<div align="center">
  <strong>LinkBox 后端 - 智能资源管理的核心引擎 🚀</strong>
</div>
