# CLAUDE.md

> **⚠️ 核心指令 / CRITICAL**
> **请务必全程使用【简体中文】进行对话、回复、解释代码和编写文档。**
> **Always use Simplified Chinese for all interactions, responses, and documentation.**

本文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指导。

## 重要提示：Windows 系统文件编辑

### ⚠️ 必须遵守：Windows 系统文件路径必须使用反斜杠

**Claude Code 中存在一个文件修改的错误。解决方法是：在所有文件操作中始终使用完整的绝对 Windows 路径，并包含驱动器号和反斜杠（`\`）。此规则应从现在起一直适用，而不仅仅针对当前文件。**
**在 Windows 系统使用 Edit 或 MultiEdit 工具时，文件路径必须使用反斜杠（`\`），不能使用正斜杠（`/`）。**

#### ❌ 错误写法 - 会导致错误：
```
Edit(file_path: "D:/repos/project/file.tsx", ...)
MultiEdit(file_path: "D:/repos/project/file.tsx", ...)
```

#### ✅ 正确写法 - 始终有效：
```
Edit(file_path: "D:\repos\project\file.tsx", ...)
MultiEdit(file_path: "D:\repos\project\file.tsx", ...)
```

## 重要规范

- 所有代码注释、文档、提交信息使用中文，专有名词保留原文即可
- 所有文件的读取、写入、提交等操作必须统一使用 UTF-8 编码

## 项目概述

这是"朝暮"咖啡厅在线点餐与消费积分系统的 **frontend-client**（用户端/会员端）。基于 Vue 3 + TypeScript + Vite 构建的单页应用，为顾客提供商品浏览、下单点餐、积分（光阴值）管理和优惠券兑换等功能。

另有独立的 **frontend-admin** 项目用于管理后台。

## 常用命令

```bash
# 启动开发服务器（端口 5174，支持局域网访问）
npm run dev

# 类型检查并构建生产版本
npm run build

# 预览生产构建
npm run preview

# 单元测试（watch 模式）
npm run test

# 单元测试（单次运行，CI 模式）
npm run test:run

# Vitest UI 测试界面
npm run test:ui
```

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3（Composition API + `<script setup>`） | ^3.5.24 |
| 构建工具 | Vite | ^7.2.4 |
| 语言 | TypeScript | ~5.9.3 |
| UI 组件库 | Naive UI | ^2.43.2 |
| 状态管理 | Pinia | ^3.0.4 |
| 路由 | Vue Router 4 | ^4.6.3 |
| HTTP 客户端 | Axios | ^1.13.2 |
| 样式 | Tailwind CSS + CSS 变量 | ^4.1.17 |
| 图标 | @vicons/ionicons5 | ^0.13.0 |
| 测试 | Vitest + @vue/test-utils | ^4.0.14 |

## 项目结构

```
src/
├── api/                  # HTTP 客户端与接口模块
│   ├── client.ts         # Axios 实例 + 拦截器（JWT 认证）
│   ├── auth.ts           # 登录、注册接口
│   ├── products.ts       # 商品、分类、推荐接口
│   ├── cart.ts           # 购物车接口
│   ├── checkout.ts       # 下单/结算接口
│   ├── order.ts          # 订单查询接口
│   └── user.ts           # 用户信息接口
│
├── components/           # Vue 组件
│   ├── layout/           # 布局组件（MainLayout、AppHeader、BottomNav 等）
│   ├── common/           # 通用组件（ThemeSwitcher、EmptyState 等）
│   ├── home/             # 首页组件（HeroBanner、CategoryTabs 等）
│   ├── product/          # 商品组件（ProductCard）
│   ├── member/           # 会员功能组件（CheckoutSummary、CouponSelector 等）
│   └── login/            # 登录相关组件
│
├── views/                # 页面组件
│   ├── HomeView.vue      # 首页
│   ├── MenuView.vue      # 菜单页
│   ├── LoginView.vue     # 登录页
│   ├── RegisterView.vue  # 注册页
│   ├── CartView.vue      # 购物车页
│   ├── ProfileView.vue   # 个人中心
│   ├── member/           # 会员子页面（结算、订单列表、订单详情）
│   └── product/          # 商品子页面（商品详情）
│
├── stores/               # Pinia 状态管理
│   ├── auth.ts           # 认证状态（用户、Token）
│   ├── theme.ts          # 主题状态（朝/暮自动切换）
│   ├── product.ts        # 商品状态
│   ├── cart.ts           # 购物车状态
│   ├── order.ts          # 订单状态
│   └── checkout.ts       # 结算流程状态
│
├── router/               # Vue Router 路由配置
│   └── index.ts
│
├── types/                # TypeScript 类型定义
│   ├── api.ts            # API 响应通用类型
│   ├── product.ts        # 商品/分类类型
│   ├── cart.ts           # 购物车类型
│   ├── order.ts          # 订单类型
│   └── user.ts           # 用户类型
│
├── composables/          # 可复用逻辑
│   └── useRequestState.ts
│
├── utils/                # 工具函数
│   ├── error.ts          # 错误处理
│   └── error-messages.ts # 错误信息字典
│
├── assets/               # 静态资源
├── style.css             # 全局样式（CSS 变量）
├── App.vue               # 根组件
└── main.ts               # 应用入口
```

## 后端对接

- 后端：Spring Boot 3.1.12 RESTful API（端口 8080）
- 认证：JWT 令牌，通过 `Authorization: Bearer <token>` 请求头传递
- API 代理：在 `vite.config.ts` 的 `server.proxy` 中配置，`/api` 请求自动转发到后端

## 主题系统（朝/暮模式）

应用支持动态"朝/暮"主题切换：

| 主题 | 时间范围 | 配色特征 |
|------|----------|----------|
| 朝（Dawn） | 06:00 - 17:59 | 琥珀黄主色 + 舒芙蕾白背景 |
| 暮（Dusk） | 18:00 - 05:59 | 淡金主色 + 黛蓝背景 |

- 根据当前时间自动切换
- 用户可手动切换（本地持久化）
- 通过 CSS 变量和 `data-theme` 属性实现

## 路由

| 路径 | 页面 | 状态 |
|------|------|------|
| `/login` | 登录页 | ✅ 已实现 |
| `/register` | 注册页 | ✅ 已实现 |
| `/` | 首页（时间段推荐） | ✅ 已实现 |
| `/menu` | 全日菜单 | ✅ 已实现 |
| `/cart`（alias） / `/member/cart` | 购物车 | ✅ 已实现 |
| `/member/checkout` | 结算下单 | ✅ 已实现 |
| `/member/orders` | 订单列表 | ✅ 已实现 |
| `/member/orders/:orderNo` | 订单详情 | ✅ 已实现 |
| `/product/:id` | 商品详情 | ✅ 已实现 |
| `/profile` | 个人中心 | ✅ 已实现 |
| `/points` | 积分中心 | ⏳ 待实现（当前路由未配置） |
| `/coupons` | 我的优惠券 | ⏳ 待实现（当前路由未配置） |

## 设计文档

详细规格说明位于 `.specify/markdown/` 目录：

| 文档 | 版本 | 说明 |
|------|------|------|
| 需求规格说明书 | V1.1 | 完整功能需求、用户角色、业务规则 |
| 页面与模块结构设计 | V1.1 | 页面布局、导航设计 |
| 接口设计说明 | V1.4 | RESTful API 定义、请求响应示例 |
| 技术栈与架构选型说明 | V1.4 | 技术决策、Vite 配置示例 |
| 品牌与UI视觉设计方案 | V2.0 | 朝暮主题、玻璃拟态设计规范 |
| 数据库设计说明 | V1.2 | 表结构、字段定义 |

实施规格与任务清单位于 `specs/` 目录（如 `001-client-spa-specs/`），用于具体功能的开发规划与状态追踪。

SQL 迁移脚本位于 `.specify/markdown/sql/` 目录（V1 ~ V6）。

## 配置文件说明

| 文件 | 作用 |
|------|------|
| `package.json` | 项目依赖、脚本命令 |
| `package-lock.json` | 依赖版本锁定 |
| `vite.config.ts` | Vite 构建配置（端口、代理、别名、分块） |
| `tailwind.config.js` | Tailwind 配置（朝暮主题色、字体） |
| `tsconfig.json` | TypeScript 总配置 |
| `tsconfig.app.json` | 应用源码 TS 配置 |
| `tsconfig.node.json` | 构建工具 TS 配置 |
| `vitest.config.ts` | 单元测试配置 |
