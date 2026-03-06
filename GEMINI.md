# 项目指南 (GEMINI.md)

> **⚠️ 核心指令 / CRITICAL**
> **请务必全程使用【简体中文】进行对话、回复、解释代码和编写文档。**
> **Always use Simplified Chinese for all interactions, responses, and documentation.**

## 1. 项目概述

**项目名称**：Frontend-Client (朝暮咖啡厅在线点餐系统 - 用户端)

**项目简介**：
这是"朝暮" (Dawn & Dusk) 咖啡厅在线点餐与消费积分系统的用户端（会员端）前端项目。该应用基于 Vue 3 + TypeScript + Vite 构建，旨在为顾客提供流畅的在线点餐体验、积分（光阴值）管理、优惠券兑换以及基于时间的动态"朝/暮"主题界面。

**核心功能**：
*   **点餐系统**：商品浏览（含时间段推荐）、购物车、下单支付。
*   **会员体系**：积分（光阴值）积累、会员等级（晨曦/烈阳/晚霞/繁星）、优惠券管理。
*   **品牌体验**：根据当前时间自动切换"朝"（浅色/活力）与"暮"（深色/静谧）主题。

**技术栈**：
*   **核心框架**：Vue 3 (Composition API, `<script setup>`)
*   **构建工具**：Vite 7.2+
*   **语言**：TypeScript 5.9+
*   **UI 组件库**：Naive UI
*   **状态管理**：Pinia
*   **路由**：Vue Router 4
*   **样式**：Tailwind CSS v4 + CSS 变量主题切换
*   **HTTP 客户端**：Axios
*   **单元测试**：Vitest

## 2. 开发环境与命令

### 环境要求
*   Node.js (推荐 LTS 版本)
*   npm / yarn / pnpm

### 常用命令
所有命令在项目根目录下运行：

| 命令 | 说明 |
| :--- | :--- |
| `npm install` | 安装项目依赖 |
| `npm run dev` | 启动开发服务器 (默认端口 5174) |
| `npm run build` | 执行类型检查并构建生产版本 |
| `npm run preview` | 预览构建后的生产版本 |
| `npm run test` | 运行单元测试 (Vitest) |
| `npm run test:run` | 单元测试单次运行 (CI 模式) |
| `npm run test:ui` | 启动测试 UI 界面 |

### 后端对接
*   **API 地址**：默认后端运行在 `http://localhost:8080` (Spring Boot)。
*   **代理配置**：详见 `vite.config.ts` 中的 `server.proxy`。
*   **认证方式**：JWT Token (`Authorization: Bearer <token>`)。

## 3. 目录结构说明

```text
C:\D\task\DawnDusk\frontend-client\
├── bug/                   # 缺陷追踪与复盘文档目录 (记录关键 Bug 修复与复盘)
├── public/                # 静态资源 (不经过构建过程，包含 images/, vite.svg)
├── src/                   # 源代码目录 (@)
│   ├── api/               # API 接口封装 (按模块划分：auth, cart, checkout, coupon, order, products 等)
│   ├── assets/            # 构建资源 (由 Vite 处理的资源)
│   ├── components/        # 组件目录
│   │   ├── common/        # 通用组件 (SearchBar, EmptyState, Skeleton 等)
│   │   ├── home/          # 首页业务组件 (BentoGrid, TimelineNav 等)
│   │   ├── layout/        # 页面布局组件 (AppHeader, BottomNav, MainLayout 等)
│   │   ├── login/         # 登录注册相关视觉组件
│   │   ├── member/        # 会员/订单详情业务组件
│   │   └── product/       # 商品展示组件
│   ├── composables/       # 组合式函数 (自定义 Hooks，如 useTimeSlot, useOrderAvailabilityGuard)
│   ├── constants/         # 全局业务常量 (如 timeflow 阶段定义)
│   ├── router/            # 路由配置 (Vue Router 4)
│   ├── stores/            # 状态管理 (Pinia stores 及其 .spec.ts 测试文件)
│   ├── tests/             # 全局测试配置与环境 setup
│   ├── types/             # TypeScript 类型定义 (按业务模型划分)
│   ├── utils/             # 工具函数 (格式化、错误处理、SSE、优惠券计算等)
│   ├── views/             # 页面视图
│   │   ├── member/        # 会员中心相关子页面 (Checkout, OrderList, OrderDetail 等)
│   │   └── product/       # 商品详情页面
│   ├── App.vue            # 根组件
│   ├── main.ts            # 入口文件 (挂载 Pinia, Router, 初始化主题与认证)
│   └── style.css          # 全局样式 (集成 Tailwind CSS v4)
├── tools/                 # 辅助工具
├── vite.config.ts         # Vite 配置文件
├── tailwind.config.js     # Tailwind 配置文件
├── package.json           # 依赖与脚本
└── README.md              # 基础项目说明
```

## 4. 开发规范与约定

### 模块职责
*   **API 交互**：统一在 `src/api/` 下定义请求函数，严禁在组件内直接使用 axios。
*   **状态管理**：跨页面逻辑（如购物车、用户信息、全局主题）必须使用 Pinia Store。
*   **业务逻辑**：复杂的逻辑应提取到 `src/composables/` 或 `src/utils/` 中。

### 编码约定
*   **绝对路径**：文件编辑与读取必须使用包含盘符的完整绝对路径。
*   **路径别名**：代码内部引用推荐使用 `@/` 前缀。
*   **Vue 风格**：强制使用 `<script setup>` 和 Composition API。
*   **类型安全**：所有数据模型必须在 `src/types/` 定义，严禁在业务代码中滥用 `any`。

### 质量保证
*   **单元测试**：核心业务模块（Stores, Utils）应具备对应的 `.spec.ts` 文件。
*   **缺陷复盘**：修复重大 Bug 后，需在 `bug/` 目录下创建复盘文档。

### 文档参考
*   在开发前应查阅 `bug/` 目录下的历史问题复盘，以规避已知坑点。
