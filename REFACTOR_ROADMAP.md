# LinkBox Refactor Roadmap

这份清单的目标只有两个：

1. 让 LinkBox 变得更小、更稳、更容易维护
2. 让项目逐步具备 serverless 部署能力

## 先说结论

推荐路线不是“把现在整套后端直接搬到 serverless”，而是：

- 前端保持静态站点部署
- `auth / resources / tags` 先收敛成轻量 API
- AI 功能先从“通用 Agent + SSE”降级成“明确接口”
- 等核心链路稳定后，再决定 AI 部分是继续常驻服务，还是改成异步任务

## 目标状态

### 小而美版本

- 只有 3 个核心页面：收藏列表、添加收藏、基础设置
- AI 只保留 2 个能力：
  - URL 预览
  - 收藏搜索
- 不保留复杂的通用 Agent、多阶段工具调用、伪异步进度模拟
- 所有核心接口都能被浏览器扩展复用

### 可 serverless 版本

- Web：静态部署
- API：短请求、无状态、环境变量驱动
- 数据库：托管数据库
- AI：单独接口或单独 worker，不和 CRUD 强耦合

---

## Phase 1: 先把功能收紧

### 1. 明确 MVP 边界

- [ ] 把项目主目标收敛成“AI 辅助书签收藏”
- [ ] 暂时下线或隐藏通用对话式 Agent 页面
- [ ] 保留“输入 URL -> 生成预览 -> 编辑后保存”
- [ ] 保留“标签过滤 + 标题/摘要搜索”
- [ ] 浏览器扩展继续保留，但只调用稳定的 CRUD/预览接口

### 2. 删除或降级复杂功能

- [ ] 暂时移除 `/ai/chat/agent`
- [ ] 暂时移除前端 `useAgentStream` 相关展示链路
- [ ] 移除前端“假进度”逻辑，改成真实 loading 状态
- [ ] 评估是否保留 `ProgressFloatingWindow`
- [ ] 如果 AI 搜索需求不强，先用普通搜索替代 Agent 搜索

### 3. 收敛页面和状态

- [ ] `Home` 页面只负责资源列表、筛选、创建入口
- [ ] `BookmarkModal` 只负责预览和保存，不承担任务中心职责
- [ ] `Setting` 页面先只保留账号信息和退出登录
- [ ] `About` 页面仅保留首次引导，不继续承载复杂逻辑

---

## Phase 2: 先把后端做稳

### 4. 修复高优先级正确性问题

- [ ] 修复 JWT 异常捕获，确保坏 token 稳定返回 401
- [ ] 统一错误响应结构，不要混用 `detail` 和 `message`
- [ ] 给 `create_resource` 改成单事务提交
- [ ] 移除 `create_tag_if_not_exists` 内部的 `commit`
- [ ] 给关键写操作补 `rollback`

### 5. 补上数据库约束

- [ ] 为 `resources` 增加 `(user_id, url)` 唯一约束
- [ ] 为 `resource_tags` 增加必要外键
- [ ] 检查 `tags` 和 `resource_tags` 的软删除策略是否一致
- [ ] 评估是否继续使用软删除，避免表越来越脏
- [ ] 引入迁移工具，不再依赖启动时自动建表

### 6. 去掉 serverless 不友好的启动行为

- [ ] 移除应用启动时 `create_tables()`
- [ ] 用 migration 代替运行时建表
- [ ] 把数据库连接配置抽成更清晰的环境变量
- [ ] 为不同环境拆分配置：local / staging / production

### 7. 降低阻塞和耦合

- [ ] 把网页抓取改成异步 HTTP 客户端，或下沉到后台任务
- [ ] 把 AI 预览逻辑封装成独立 service
- [ ] 把 AI 搜索逻辑从路由中拆出去
- [ ] 删除重复的 AI 搜索实现，避免 `ai_service.py` 和 `langchain_tools.py` 双份逻辑

---

## Phase 3: 前端瘦身

### 8. 收敛前端数据流

- [ ] `AuthContext` 只保留登录态和用户信息
- [ ] 如果移除任务浮窗，就删除 `ProgressContext`
- [ ] 避免页面内部同时维护过多 modal 状态
- [ ] 将资源列表请求逻辑抽成单独 hook
- [ ] 将创建/编辑资源流程抽成单独 hook

### 9. 清理类型和工程质量

- [ ] 清理 `any`
- [ ] 修复 `eslint` 当前错误
- [ ] 修复 React Hook 依赖 warning
- [ ] 为 API 响应建立统一 TypeScript 类型
- [ ] 把环境相关配置从源码中移出

### 10. 缩小包体

- [ ] 替换 `web/src/images/icon.svg`
- [ ] 优先使用压缩后的 svg 或 png/webp
- [ ] 检查是否真的需要所有 `framer-motion` 动画
- [ ] 对非首页能力做懒加载
- [ ] 检查浏览器扩展是否可以复用更轻量的图标资源

---

## Phase 4: Serverless 化的推荐方案

### 推荐方案 A

适合“尽快上线 + 控制复杂度”。

- Web：Vercel / Netlify 静态部署
- Core API：Serverless Functions
- DB：Supabase Postgres / Neon / PlanetScale
- AI：单独一个轻量服务，先不 serverless

为什么推荐：

- CRUD 最适合 serverless
- AI 流式 Agent 最不适合直接函数化
- 这样迁移成本最小，稳定性最高

### 需要先 serverless 化的接口

- [ ] `/auth/register`
- [ ] `/auth/login`
- [ ] `/auth/profile`
- [ ] `/resources`
- [ ] `/resources/{id}`
- [ ] `/resources/preview`
- [ ] `/tags`

### 暂时不要 serverless 化的部分

- [ ] `/ai/chat/agent`
- [ ] SSE 长连接
- [ ] 请求内队列和工具流合并逻辑

### 推荐方案 B

适合“坚持纯 serverless”。

- 保留 CRUD 为 serverless
- AI 改成“提交任务 -> 轮询结果”
- 不做 SSE
- 不做通用 Agent

为什么可行：

- 所有请求都变成短请求
- 更符合函数平台限制
- 但交互体验会比流式略弱

---

## Phase 5: 一周落地版

### Day 1

- [ ] 删除或隐藏 Chat Agent 入口
- [ ] 确定 MVP 页面和保留功能
- [ ] 修复前端 `BASE_URL` 硬编码

### Day 2

- [ ] 修复 JWT 异常处理
- [ ] 统一错误响应结构
- [ ] 修复资源创建事务

### Day 3

- [ ] 移除启动建表
- [ ] 引入 migration
- [ ] 补数据库唯一约束

### Day 4

- [ ] 删除假进度逻辑
- [ ] 视情况删除 `ProgressFloatingWindow`
- [ ] 收敛 `BookmarkModal`

### Day 5

- [ ] 清理 `any`
- [ ] 修复 lint error
- [ ] 替换超大图标资源

### Day 6

- [ ] 拆出 serverless 友好的 CRUD API 层
- [ ] 本地验证浏览器扩展是否仍可使用

### Day 7

- [ ] 决定 AI 能力走“轻量常驻服务”还是“异步任务”
- [ ] 输出部署文档

---

## 建议保留的核心接口

### 用户

- [ ] 注册
- [ ] 登录
- [ ] 获取当前用户

### 资源

- [ ] 创建资源
- [ ] 获取资源列表
- [ ] 更新资源
- [ ] 删除资源
- [ ] 生成 URL 预览

### 标签

- [ ] 获取标签列表
- [ ] 创建标签
- [ ] 删除标签

### 搜索

- [ ] 普通关键词搜索
- [ ] 可选：AI 辅助搜索

---

## 建议暂缓的能力

- [ ] 通用对话式 Agent
- [ ] 工具调用过程可视化
- [ ] 复杂进度任务中心
- [ ] 长连接 SSE 的多流合并
- [ ] 多阶段 AI 工作流编排

---

## 完成标准

做到下面这些，就可以认为项目已经进入“小而美 + 可部署”的状态：

- [ ] 新用户可以注册、登录、收藏链接、编辑、删除
- [ ] URL 预览稳定可用
- [ ] 浏览器扩展可以正常调用核心接口
- [ ] 前端构建通过
- [ ] 前端 lint 通过
- [ ] 后端不再依赖启动自动建表
- [ ] 所有核心写操作具备事务一致性
- [ ] CRUD 接口可以无状态部署

---

## 我的建议顺序

如果只做最关键的 3 件事，优先级建议是：

1. 砍掉通用 Agent，把产品目标收紧
2. 修事务、约束、错误处理，把后端做稳
3. 先把 CRUD 做成 serverless-ready，再决定 AI 怎么部署

这条路线最省力，也最符合“先把东西做小，再把东西做美”的节奏。
