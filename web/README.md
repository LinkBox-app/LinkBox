# LinkBox 前端 🎨

LinkBox 的 React 前端应用，提供现代化的用户界面和流畅的交互体验。

## 🏗️ 技术栈

- **React**: 19.1.0 - 用户界面构建库
- **TypeScript**: ~5.8.3 - 类型安全的 JavaScript
- **Tailwind CSS**: ^4.1.11 - 实用优先的 CSS 框架
- **React Router**: ^7.7.0 - 路由管理
- **Alova**: ^3.3.4 - 现代化的请求库
- **Vite**: ^7.0.4 - 快速的构建工具

## 📁 项目结构

```
web/
├── src/
│   ├── pages/              # 页面组件
│   │   ├── Home.tsx        # 首页 - 资源列表
│   │   ├── Chat.tsx        # AI 对话页面
│   │   └── Setting.tsx     # 设置页面
│   │
│   ├── components/         # 公共组件
│   │   ├── Layout.tsx      # 应用布局
│   │   ├── AuthModal.tsx   # 登录/注册模态框
│   │   ├── ResourceCard.tsx # 资源卡片
│   │   ├── AgentChat.tsx   # AI 对话组件
│   │   ├── ToolCallDisplay.tsx # 工具调用展示
│   │   ├── ToolProgressCard.tsx # 工具进度卡片
│   │   ├── BookmarkModal.tsx # 收藏模态框
│   │   ├── EditResourceModal.tsx # 编辑资源模态框
│   │   ├── CreateTagModal.tsx # 创建标签模态框
│   │   ├── DeleteTagModal.tsx # 删除标签模态框
│   │   ├── LoadingDots.tsx # 加载动画
│   │   └── Toast.tsx       # 消息提示
│   │
│   ├── hooks/              # 自定义 React Hooks
│   │   ├── useAuth.ts      # 用户认证状态管理
│   │   ├── useAgentStream.ts # AI Agent 流式对话
│   │   └── useSSEChat.ts   # SSE 聊天功能
│   │
│   ├── api/                # API 接口层
│   │   ├── index.ts        # Alova 配置
│   │   ├── methods/        # API 方法
│   │   │   ├── auth.methods.ts # 认证相关接口
│   │   │   ├── resource.methods.ts # 资源管理接口
│   │   │   ├── tag.methods.ts # 标签管理接口
│   │   │   └── ai.methods.ts # AI 对话接口
│   │   └── types/          # TypeScript 类型定义
│   │       ├── auth.types.ts # 认证相关类型
│   │       └── resource.types.ts # 资源相关类型
│   │
│   ├── utils/              # 工具函数
│   │   └── toast.ts        # 消息提示工具
│   │
│   ├── images/             # 静态图片资源
│   │   └── icon.svg        # 应用图标
│   │
│   ├── main.tsx            # 应用入口
│   ├── App.tsx             # 根组件
│   ├── main.css            # 全局样式
│   └── storage-key.constant.ts # 存储键常量
│
├── public/                 # 静态资源
│   ├── icon.svg           # 网站图标
│   └── vite.svg           # Vite 图标
│
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── eslint.config.js       # ESLint 配置
```

## 🚀 快速开始

### 环境要求

- **Node.js**: 18.0+
- **npm**: 9.0+

### 1. 安装依赖

```bash
cd web
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动

### 3. 构建生产版本

```bash
npm run build
```

构建文件将输出到 `dist/` 目录

### 4. 预览生产版本

```bash
npm run preview
```

## 🎨 UI 设计规范

### 色彩方案

```css
/* 主色调 */
--bg-primary: rgba(255, 239, 215, 1); /* 主背景色 */
--bg-secondary: rgba(255, 248, 232, 1); /* 卡片背景色 */
--accent: rgba(255, 111, 46, 1); /* 强调色（橙色） */
--text-primary: rgba(19, 0, 0, 1); /* 主文字色 */
--border: rgba(19, 0, 0, 1); /* 边框色 */
```

### 字体规范

```css
font-family: "Menlo", "Consolas", "Courier New", "Hannotate SC", "DengXian",
  monospace;
```

### 设计特点

- **复古风格**: 使用等宽字体和手绘风格
- **微旋转效果**: 元素带有轻微的旋转角度
- **边框设计**: 所有组件都有明显的黑色边框
- **hover 动画**: 鼠标悬停时的旋转和透明度变化

## 📱 功能模块

### 🏠 首页 (Home.tsx)

- **资源展示**: 以卡片形式展示用户收藏的资源
- **标签筛选**: 通过标签快速筛选资源
- **搜索功能**: 支持关键词搜索资源
- **资源管理**: 编辑、删除资源操作

### 💬 AI 对话 (Chat.tsx)

- **智能对话**: 与 AI 助手进行自然语言交互
- **工具调用**: 支持搜索、预览、创建资源等工具
- **实时流式**: 支持流式响应和进度显示
- **上下文记忆**: 对话历史记录和上下文保持

### ⚙️ 设置页面 (Setting.tsx)

- **用户信息**: 显示用户个人信息
- **账户管理**: 登出等账户操作
- **设置选项**: 应用相关设置（未来扩展）

### 🔐 认证系统 (AuthModal.tsx)

- **用户注册**: 新用户注册功能
- **用户登录**: 已有用户登录
- **状态管理**: 全局认证状态管理

## 🔧 核心功能实现

### 认证系统 (`useAuth.ts`)

```typescript
// 认证状态管理
const { isAuthenticated, user, login, logout } = useAuth();

// 自动验证 Token 有效性
// 支持自动登录和登出
// 提供完整的用户状态管理
```

### AI 对话系统

#### SSE 流式对话 (`useSSEChat.ts`)

```typescript
// 普通流式对话
const { sendMessage, isLoading, error } = useSSEChat();

// 支持实时流式响应
// 错误处理和重连机制
// 请求取消功能
```

#### Agent 工具调用 (`useAgentStream.ts`)

```typescript
// AI Agent 对话
const {
  sendMessage,
  isStreaming,
  currentThinking,
  toolCalls,
  toolProgress,
  finalResponse,
  resources,
} = useAgentStream();

// 工具调用状态跟踪
// 进度信息展示
// 资源数据处理
```

### API 接口管理

#### Alova 配置 (`api/index.ts`)

```typescript
// 统一的 HTTP 客户端配置
// 自动认证 Token 注入
// 统一的错误处理
// 请求/响应拦截器
```

#### 接口方法封装

```typescript
// 认证接口
export const login = (credentials) => alova.Post("/auth/login", credentials);
export const register = (userData) => alova.Post("/auth/register", userData);

// 资源管理接口
export const getResources = (params) => alova.Get("/resources", { params });
export const createResource = (data) => alova.Post("/resources", data);

// 标签管理接口
export const getTags = () => alova.Get("/tags");
export const createTag = (data) => alova.Post("/tags", data);
```

## 🎯 组件设计模式

### 容器/展示组件模式

```typescript
// 容器组件：负责数据获取和状态管理
const ResourceListContainer = () => {
  const { data, loading, error } = useResources();
  return <ResourceList data={data} loading={loading} />;
};

// 展示组件：负责 UI 渲染
const ResourceList = ({ data, loading }) => {
  if (loading) return <LoadingDots />;
  return data.map((item) => <ResourceCard key={item.id} {...item} />);
};
```

### 自定义 Hooks 模式

```typescript
// 业务逻辑抽象为自定义 Hook
const useResourceManager = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const createResource = async (data) => {
    setLoading(true);
    try {
      const result = await api.createResource(data);
      setResources((prev) => [...prev, result]);
    } finally {
      setLoading(false);
    }
  };

  return { resources, loading, createResource };
};
```

## 🔄 状态管理

### 全局状态

- **认证状态**: 用户登录状态和用户信息
- **主题设置**: 应用主题和偏好设置（未来扩展）
- **全局消息**: Toast 消息提示

### 本地状态

- **表单状态**: 各种表单的输入状态
- **UI 状态**: 模态框显示、加载状态等
- **临时数据**: 组件内部的临时数据

### 持久化存储

```typescript
// 存储键管理
export const AUTH_TOKEN_KEY = "auth_token";
export const LOGIN_FLAG_KEY = "login_flag";

// 自动同步 localStorage
localStorage.setItem(AUTH_TOKEN_KEY, token);
localStorage.getItem(AUTH_TOKEN_KEY);
```

## 🎨 样式系统

### Tailwind CSS 配置

```javascript
// tailwind.config.js
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgba(255, 239, 215, 1)",
        secondary: "rgba(255, 248, 232, 1)",
        accent: "rgba(255, 111, 46, 1)",
        text: "rgba(19, 0, 0, 1)",
      },
      fontFamily: {
        mono: [
          '"Menlo"',
          '"Consolas"',
          '"Courier New"',
          '"Hannotate SC"',
          '"DengXian"',
          "monospace",
        ],
      },
    },
  },
};
```

### 组件样式规范

```typescript
// 统一的样式类名
const buttonStyles = `
  px-4 py-2 border-2 border-solid font-bold 
  hover:opacity-80 transition-all transform 
  hover:rotate-[0.1deg]
`;

const cardStyles = `
  border-2 border-solid p-4 transform 
  rotate-[0.1deg] hover:rotate-[0.3deg] 
  transition-transform
`;
```

## 📱 响应式设计

### 断点系统

```css
/* Tailwind CSS 断点 */
sm: 640px   /* 平板 */
md: 768px   /* 小桌面 */
lg: 1024px  /* 大桌面 */
xl: 1280px  /* 超大屏 */
```

### 响应式组件

```typescript
// 响应式布局
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {resources.map(resource => (
    <ResourceCard key={resource.id} {...resource} />
  ))}
</div>

// 响应式字体
<h1 className="text-2xl md:text-4xl lg:text-6xl">LinkBox</h1>
```

## 🔧 开发工具

### 代码质量

```bash
# 类型检查
npm run type-check

# 代码格式化
npm run lint

# 修复 ESLint 问题
npm run lint:fix
```

### 构建优化

```typescript
// Vite 配置优化
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["@headlessui/react"],
        },
      },
    },
  },
});
```

## 🚀 部署指南

### 静态部署

```bash
# 构建生产版本
npm run build

# 部署到静态服务器
# 将 dist/ 目录上传到服务器
```

### Docker 部署

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 环境变量

```typescript
// 环境配置
const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:7032",
  APP_NAME: import.meta.env.VITE_APP_NAME || "LinkBox",
  NODE_ENV: import.meta.env.NODE_ENV,
};
```

## 🧪 测试策略

### 单元测试 (未来计划)

```bash
# 添加测试依赖
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# 运行测试
npm run test

# 测试覆盖率
npm run test:coverage
```

### E2E 测试 (未来计划)

```bash
# 添加 E2E 测试
npm install --save-dev playwright

# 运行 E2E 测试
npm run test:e2e
```

## 🐛 故障排除

### 常见问题

1. **开发服务器启动失败**

   ```bash
   # 清除 node_modules 重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **API 请求失败**

   ```typescript
   // 检查 API 基础 URL 配置
   console.log(BASE_URL); // 应该指向后端服务器
   ```

3. **样式不生效**

   ```bash
   # 检查 Tailwind CSS 配置
   npm run build:css
   ```

4. **TypeScript 错误**

   ```bash
   # 类型检查
   npm run type-check

   # 重启 TypeScript 服务
   # VS Code: Ctrl+Shift+P -> TypeScript: Restart TS Server
   ```

## 📈 性能优化

### 代码分割

```typescript
// 路由级别的代码分割
const Home = lazy(() => import("./pages/Home"));
const Chat = lazy(() => import("./pages/Chat"));
const Setting = lazy(() => import("./pages/Setting"));
```

### 资源优化

```typescript
// 图片懒加载
<img
  src={imageUrl}
  loading="lazy"
  alt="Resource thumbnail"
/>

// 组件级别的错误边界
<Suspense fallback={<LoadingDots />}>
  <RouteComponent />
</Suspense>
```

## 🤝 贡献指南

### 开发流程

1. **创建功能分支**: `git checkout -b feature/new-feature`
2. **开发新功能**: 遵循项目规范进行开发
3. **运行测试**: 确保所有测试通过
4. **提交代码**: 使用清晰的提交信息
5. **创建 PR**: 详细描述变更内容

### 代码规范

- **组件命名**: 使用 PascalCase
- **文件命名**: 使用 PascalCase.tsx 或 kebab-case.ts
- **Props 接口**: 以组件名 + Props 命名
- **CSS 类名**: 使用 Tailwind CSS 类名

## 📝 更新日志

### v1.0.0

- ✨ 完整的用户界面系统
- 🎨 现代化的设计风格
- 💬 实时 AI 对话功能
- 📱 响应式设计支持
- 🔐 用户认证系统
- 📚 资源管理界面
- ⚙️ 用户设置页面

---

<div align="center">
  <strong>LinkBox 前端 - 智能、美观、易用的现代化界面 🎨</strong>
</div>
