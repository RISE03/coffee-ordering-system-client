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
*   **构建工具**：Vite 7.x
*   **语言**：TypeScript 5.x
*   **UI 组件库**：Naive UI
*   **状态管理**：Pinia
*   **路由**：Vue Router 4
*   **样式**：Tailwind CSS + CSS 变量主题切换
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
| `npm run dev` | 启动开发服务器 (默认端口 5174，支持局域网访问) |
| `npm run build` | 执行类型检查 (`vue-tsc`) 并构建生产版本 |
| `npm run preview` | 预览构建后的生产版本 |
| `npm run test` | 运行单元测试 (Vitest) |
| `npm run test:run` | 单元测试单次运行 (CI 模式) |
| `npm run test:ui` | 启动测试 UI 界面 |

### 后端对接
*   **API 地址**：默认后端运行在 `http://localhost:8080` (Spring Boot)。
*   **代理配置**：开发环境代理可在 `vite.config.ts` 中的 `server.proxy` 配置。
*   **认证方式**：JWT Token (`Authorization: Bearer <token>`)。

## 3. 目录结构说明

```text
C:\D\task\DawnDusk\frontend-client\
├── .specify/              # 项目详细规格说明书与设计文档 (重要参考)
│   ├── markdown/          # 需求、UI设计、接口定义、数据库设计等
│   └── ...
├── specs/                 # 具体的实施规格与任务清单 (如 001-client-spa-specs)
├── src/                   # 源代码目录 (@)
│   ├── api/               # API 接口封装 (Axios)
│   ├── assets/            # 静态资源
│   ├── components/        # 公共组件
│   ├── composables/       # 组合式函数 (Hooks)
│   ├── router/            # 路由配置
│   ├── stores/            # 状态管理 (Pinia)
│   ├── tests/             # 单元测试
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   ├── views/             # 页面视图
│   ├── App.vue            # 根组件
│   ├── main.ts            # 入口文件
│   └── style.css          # 全局样式
├── CLAUDE.md              # AI 助手协作指南 (包含路径规范等)
├── vite.config.ts         # Vite 配置文件
├── tsconfig.json          # TypeScript 配置文件
├── package.json           # 依赖与脚本配置
└── README.md              # 项目基础说明
```

## 4. 开发规范与约定

### 文件操作规范 (Windows)
*   **绝对路径**：在进行文件读取、写入或编辑时，**必须**使用包含盘符的完整绝对路径。
*   **反斜杠**：路径分隔符必须使用反斜杠 (`\`)，严禁使用正斜杠 (`/`)。
    *   ✅ 正确：`C:\D\task\DawnDusk\frontend-client\src\App.vue`
    *   ❌ 错误：`C:/D/task/DawnDusk/frontend-client/src/App.vue`

### 编码规范
*   **语言**：代码注释、文档、提交信息均使用**简体中文**。
*   **字符集**：所有文件必须使用 **UTF-8** 编码。
*   **Vue 风格**：使用 Vue 3 Composition API 和 `<script setup>` 语法糖。
*   **组件名**：多单词大驼峰命名 (PascalCase)，如 `UserProfile.vue`。

### 文档参考
在进行功能开发前，请务必查阅 `.specify/markdown/` 下的相关文档，特别是：
*   `需求规格说明书`：理解业务逻辑。
*   `接口设计说明`：确认后端 API 接口定义。
*   `页面与模块结构设计`：确认页面布局与组件划分。
