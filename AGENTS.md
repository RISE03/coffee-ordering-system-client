# Repository Guidelines

> **⚠️ 核心指令 / CRITICAL**
> **请务必全程使用【简体中文】进行对话、回复、解释代码和编写文档。**
> **Always use Simplified Chinese for all interactions, responses, and documentation.**

## 重要规范

### 规范
- 所有代码注释、文档、提交信息使用中文，专有名词保留原文即可。
- 所有文件的读取、写入、提交等操作必须统一使用 UTF-8 编码

## 项目结构与模块组织
- `src/` 为应用根目录：`views/` 存放路由页面（首页、菜单、购物车、登录/注册、会员结算与订单）；`components/` 拆分通用 UI（`common/`、`layout/`、`member/`）；`stores/` 放置 Pinia 状态（`auth`、`cart`、`theme`）；`api/` 封装 axios 拦截器与 `/api` 前缀；`router/index.ts` 定义路由与登录/访客守卫；`types/` 集中 DTO 与存储键；`utils/` 放工具函数；`style.css` 启动 Tailwind 与主题变量；`assets/` 存静态资源。
- `public/` 为原样输出的静态文件；`index.html` 是 Vite 入口；`dist/` 为构建产物。
- `specs/001-client-spa-specs/` 存需求、清单与数据模型，功能变更时同步更新以保持文档一致。

## 构建、测试与开发命令
- `npm install` — 安装依赖（建议 Node 18+）。
- `npm run dev` — 启动 Vite（端口 5174）并开启 API 代理，自动打开浏览器。
- `npm run build` — 先用 `vue-tsc -b` 做类型检查，再产出生产包到 `dist/`。
- `npm run preview` — 本地预览已构建资源，做烟囱测试。

## 代码风格与命名约定
- 使用 Vue 3 + TypeScript + Composition API + `<script setup>`；统一 2 空格缩进，避免 `any`。
- 组件与页面文件用 PascalCase（如 `HomeView.vue`、`MainLayout.vue`）；路由名保持 kebab-case。
- 通过 `@` 别名导入 `src/` 下模块；类型集中在 `src/types` 并复用枚举/常量。
- Tailwind v4 已配置晨/暮主题（见 `tailwind.config.js`）；优先用工具类与 CSS 变量（如 `--color-primary`），暗色模式通过 `data-theme="dusk"` 切换。
- Pinia 逻辑放在各 `defineStore` 文件；副作用（认证检查、主题初始化）集中在 `main.ts`。

## 测试指南
- 目前未接入自动化测试；请在 `npm run dev` 或 `preview` 下手动验证登录重定向、购物车操作、结算摘要等关键路径。
- 如需新增测试，推荐 Vitest + Vue Test Utils；用 `*.spec.ts` 命名，放在组件同级或 `tests/`，axios 调用在模块层 mock。

## 提交与 Pull Request 指南
- 历史简单，建议遵循 Conventional Commits（如 `feat: add checkout summary`、`fix: handle expired token`）保持可读性。
- 提 PR 前确保 `npm run build` 通过，并对改动的 UI 路径做烟测。
- PR 内容应包含：简要说明、关联 issue/任务、UI 变更的截图或动图、以及后端/API 假设（当前代理 `/api` 指向 `http://localhost:8080`）。
- 接口或行为调整时同步更新相关文件（`specs/...`、`src/types/...`），保持改动聚焦，方便审核。
