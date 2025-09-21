<div align="center">
  <img src="./misc/img/logo.png", width="200">
</div>

-----
[English Version](README.en.md)

# LinkBox 📦

一个基于 AI 的智能链接收藏夹应用，让网页资源管理变得更智能、更高效。

## TODO

- [x] 收藏时候的异步
- [] 浏览器插件
- [] 其他优化
- [x] Docker
- [] i18n

## ✨ 特性

### 🤖 AI 智能功能

- **智能资源预览**：输入 URL，AI 自动提取网页内容并生成标题、标签和摘要
- **智能搜索**：基于 AI 的多维度资源搜索，支持自然语言查询
- **智能标签生成**：AI 根据网页内容和用户已有标签智能生成分类标签
- **对话式交互**：通过自然语言与 AI 助手交互，管理你的收藏

### 📚 资源管理

- **一键收藏**：输入 URL 即可快速收藏网页资源
- **标签分类**：灵活的标签系统，支持多标签分类
- **批量管理**：支持批量编辑、删除资源
- **搜索过滤**：多维度搜索（标题、标签、摘要）

### 💬 智能对话

- **实时流式响应**：AI 对话支持实时流式输出
- **工具调用**：AI 可以调用搜索、预览、创建资源等工具
- **进度反馈**：工具执行过程的实时进度展示
- **上下文记忆**：对话支持上下文记忆功能

### 🎨 用户体验

- **现代化 UI**：简洁优雅的用户界面设计
- **响应式设计**：完美适配桌面和移动设备
- **实时反馈**：操作结果的即时反馈
- **无缝交互**：流畅的用户交互体验

## 🏗️ 技术架构

### 后端 (FastAPI)

- **Web 框架**：FastAPI + Python 3.13
- **数据库**：MySQL + SQLAlchemy ORM
- **AI 集成**：LangChain + 兼容 OpenAI 格式的 API
- **认证系统**：JWT Token 认证
- **网页抓取**：Jina AI Reader API
- **部署支持**：支持 Gunicorn 多进程部署

### 前端 (React)

- **UI 框架**：React 19 + TypeScript
- **路由管理**：React Router v7
- **状态管理**：React Hooks + Context
- **HTTP 客户端**：Alova
- **样式系统**：Tailwind CSS
- **构建工具**：Vite

### AI 功能

- **LLM 模型**：支持 OpenAI 兼容的 API
- **工具调用**：LangChain Tools 框架
- **流式输出**：SSE (Server-Sent Events)
- **多进程安全**：无状态进度管理设计

## 🚀 快速开始

### 环境要求

- **Node.js**: 22.0+
- **Python**: 3.13
- **MySQL**: 5.7+ 或 8.0+
- **OpenAI API Key** 或兼容 OpenAI 格式的 API

### 1. 克隆项目

```bash
git clone https://github.com/LinkBox-app/LinkBox.git
cd LinkBox
```

### 2. 后端设置

```bash
cd server

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入数据库和 AI API 配置

# 启动服务
python main.py
```

后端服务将运行在 `http://localhost:7032`

### 3. 前端设置

```bash
cd web

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将运行在 `http://localhost:5173`

### 4. 数据库配置

在 `server/.env` 文件中配置数据库连接：

```env
# 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DB=linkbox

# AI 配置
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your_api_key
AI_MODEL=gpt-3.5-turbo

# JWT 配置
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
```

数据库表会在首次启动时自动创建。

## 📖 使用指南

### 1. 用户注册与登录

- 访问应用首页
- 点击"登录/注册"按钮
- 填写用户名和密码完成注册

### 2. 收藏网页资源

- 在 AI 对话页面输入：`帮我收藏这个网页：https://example.com`
- AI 会自动抓取网页内容并生成预览
- 确认或修改标题、标签、摘要后保存

### 3. 搜索资源

- 在 AI 对话页面使用自然语言搜索：
  - `找一些关于 Python 的资源`
  - `搜索机器学习相关的文章`
  - `显示最近收藏的网页`

### 4. 管理资源

- 在首页查看所有收藏的资源
- 使用标签筛选资源
- 编辑或删除不需要的资源

## 🛠️ 开发指南

### 项目结构

```
LinkBox/
├── server/                 # 后端代码
│   ├── Dockerfile         # 后端 Docker 配置
│   ├── main.py            # FastAPI 应用入口
│   ├── models.py          # 数据库模型
│   ├── routers/           # API 路由
│   ├── crud/              # 数据库操作
│   ├── utils/             # 工具函数
│   └── requirements.txt   # Python 依赖
├── web/                    # 前端代码
│   ├── Dockerfile         # 前端 Docker 配置
│   ├── .dockerignore      # Docker 忽略文件
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── components/    # UI 组件
│   │   ├── hooks/         # React Hooks
│   │   └── api/           # API 接口
│   └── package.json       # Node 依赖
├── docker-compose.yml      # Docker 服务编排
└── README.md               # 项目文档
```

### 主要功能模块

#### 后端模块

- **用户认证** (`user_router.py`): 注册、登录、JWT 认证
- **资源管理** (`resource_router.py`): CRUD 操作
- **标签管理** (`tag_router.py`): 标签的增删改查
- **AI 对话** (`ai_router.py`): 智能对话和工具调用
- **AI 工具** (`langchain_tools.py`): 资源搜索、预览、创建工具

#### 前端模块

- **用户界面** (`Layout.tsx`): 应用整体布局
- **AI 对话** (`Chat.tsx`): 智能对话界面
- **资源展示** (`Home.tsx`): 资源列表和管理
- **用户设置** (`Setting.tsx`): 个人信息和设置

### 开发命令

#### 后端开发

```bash
cd server

# 开发模式
python main.py

# 生产部署
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:7032
```

#### 前端开发

```bash
cd web

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

## 🔧 配置选项

### 环境变量

| 变量名               | 描述                   | 默认值                        |
| -------------------- | ---------------------- | ----------------------------- |
| `MYSQL_HOST`         | MySQL 主机地址         | -                             |
| `MYSQL_PORT`         | MySQL 端口             | -                             |
| `MYSQL_USER`         | MySQL 用户名           | -                             |
| `MYSQL_PASSWORD`     | MySQL 密码             | -                             |
| `MYSQL_DB`           | 数据库名称             | `linkbox`                     |
| `AI_BASE_URL`        | AI API 基础 URL        | -                             |
| `AI_API_KEY`         | AI API 密钥            | -                             |
| `AI_MODEL`           | AI 模型名称            | `moonshotai/Kimi-K2-Instruct` |
| `JWT_SECRET_KEY`     | JWT 签名密钥           | -                             |
| `JWT_EXPIRE_MINUTES` | Token 过期时间（分钟） | `1440`                        |

## 🚀 部署指南

### Docker 部署（推荐）

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

### 手动部署

#### 后端部署

```bash
# 安装依赖
pip install -r requirements.txt gunicorn

# 启动服务
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:7032
```

#### 前端部署

```bash
# 构建静态文件
npm run build

# 使用 nginx 或其他静态文件服务器托管 dist 目录
```

## 📝 更新日志

### v1.0.0

- ✨ 初始版本发布
- 🤖 AI 智能资源预览和搜索功能
- 💬 实时流式 AI 对话
- 📚 完整的资源管理系统
- 🎨 现代化用户界面
- 🔐 用户认证系统
- 🚀 支持多进程部署

## 📄 许可证

本项目基于 MIT 许可证开源。详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [FastAPI](https://fastapi.tiangolo.com/) - 现代、快速的 Web 框架
- [React](https://reactjs.org/) - 用户界面构建库
- [LangChain](https://langchain.com/) - AI 应用开发框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Jina AI](https://jina.ai/) - 网页内容抓取服务

---

<div align="center">
  <strong>LinkBox - 让网页收藏更智能 🚀</strong>
</div>
