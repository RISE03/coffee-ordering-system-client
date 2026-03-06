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
- `src/` 下存在少量 `.backup` 文件，属于历史备份，不作为当前实现和修改依据
- `bug/` 目录用于存放问题复盘与排查记录

## 项目概述

这是"朝暮"咖啡厅在线点餐与消费积分系统的 **frontend-client**（用户端/会员端）。基于 Vue 3 + TypeScript + Vite 构建的单页应用，为顾客提供商品浏览、下单点餐、积分（光阴值）管理、优惠券兑换和会员等级等功能。

另有独立的 **frontend-admin** 项目用于管理后台。

## 常用命令

```bash
# 安装依赖（需要 Node 20.19+ 或 22.12+，以满足 Vite 7 要求）
npm install

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

> 注：当前仓库**没有** `lint` 或 `format` 脚本。`tsconfig.app.json` 排除了 `*.spec.ts` / `*.test.ts`，因此 `npm run build` 的类型检查不覆盖测试文件。

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
│   ├── config.ts         # API 配置
│   ├── auth.ts           # 登录、注册接口
│   ├── products.ts       # 商品、分类、推荐接口
│   ├── cart.ts           # 购物车接口
│   ├── checkout.ts       # 下单/结算接口
│   ├── order.ts          # 订单查询接口
│   ├── user.ts           # 用户信息接口
│   ├── coupon.ts         # 优惠券接口
│   ├── points.ts         # 积分接口
│   └── file.ts           # 文件上传接口
│
├── components/           # Vue 组件
│   ├── layout/           # 布局组件（MainLayout、AppHeader、HomeHeader、BottomNav、AppFooter）
│   ├── common/           # 通用组件（ThemeSwitcher、EmptyState、CartFloatingBall、SearchBar、ProductSkeleton、StateBlock）
│   ├── home/             # 首页组件（BentoProductGrid、DynamicTimeHeader、HorizontalTimeline、ThemeCountdown、TimeSlotCard）
│   ├── product/          # 商品组件（ProductCard）
│   ├── member/           # 会员功能组件（CheckoutSummary、CouponSelector、OrderActions、OrderProgress、RefundDialog）
│   └── login/            # 登录相关组件（CoffeeIcon、ElegantShape、ShapeBackground）
│
├── views/                # 页面组件
│   ├── HomeView.vue      # 首页（时段推荐 + Bento 布局）
│   ├── MenuView.vue      # 菜单页（全日菜单）
│   ├── LoginView.vue     # 登录页
│   ├── RegisterView.vue  # 注册页
│   ├── CartView.vue      # 购物车页
│   ├── ProfileView.vue   # 个人中心
│   ├── PointsCenterView.vue  # 光阴小铺（积分中心）
│   ├── MyCouponsView.vue # 我的优惠券
│   ├── NotFoundView.vue  # 404 页面
│   ├── member/           # 会员子页面
│   │   ├── CheckoutPage.vue    # 结算/确认订单
│   │   ├── OrderListPage.vue   # 时光账单（订单列表）
│   │   ├── OrderDetailPage.vue # 订单详情
│   │   └── LevelDetailPage.vue # 我的等级详情
│   └── product/          # 商品子页面
│       └── ProductDetail.vue   # 商品详情
│
├── stores/               # Pinia 状态管理
│   ├── auth.ts           # 认证状态（用户、Token）
│   ├── theme.ts          # 主题状态（朝/暮自动切换）
│   ├── product.ts        # 商品状态
│   ├── cart.ts           # 购物车状态
│   ├── order.ts          # 订单状态
│   ├── checkout.ts       # 结算流程状态
│   └── timeflow.ts       # 时段状态
│
├── router/               # Vue Router 路由配置
│   └── index.ts
│
├── types/                # TypeScript 类型定义
│   ├── index.ts          # 类型导出索引
│   ├── api.ts            # API 响应通用类型
│   ├── product.ts        # 商品/分类类型
│   ├── cart.ts           # 购物车类型
│   ├── order.ts          # 订单类型
│   ├── user.ts           # 用户类型
│   ├── points.ts         # 积分类型
│   └── timeflow.ts       # 时段类型
│
├── composables/          # 可复用逻辑（Composition API）
│   ├── useRequestState.ts            # 请求状态管理
│   ├── useTimeSlot.ts                # 时段逻辑
│   ├── useOrderNotification.ts       # 订单通知（SSE）
│   └── useOrderAvailabilityGuard.ts  # 下单可用性守卫
│
├── constants/            # 常量定义
│   └── timeflow.ts       # 时段相关常量
│
├── utils/                # 工具函数
│   ├── error.ts              # 错误处理
│   ├── error-messages.ts     # 错误信息字典
│   ├── coupon.ts             # 优惠券计算逻辑
│   ├── order-availability.ts # 订单可用性检查
│   └── sse.ts                # Server-Sent Events 工具
│
├── tests/                # 测试文件
│   ├── setup.ts          # 测试环境设置
│   └── example.spec.ts   # 示例测试
│
├── assets/               # 静态资源
├── style.css             # 全局样式（CSS 变量）
├── App.vue               # 根组件
└── main.ts               # 应用入口
```

> 注：单元测试文件（`*.spec.ts`）与源文件同目录放置，如 `stores/cart.spec.ts`、`utils/coupon.spec.ts`。

> 注：`src/types/index.ts` 当前**只**统一导出 `api/cart/order/user`，不要默认 `product/points/timeflow` 也能从这里直接导入。

## 启动流程

- `main.ts` 启动时先应用主题，再执行认证检查、绑定购物车用户并在已登录时预拉取购物车，随后才挂载应用。
- `App.vue` 统一挂载 Naive UI Provider，并在应用级别启用订单 SSE 通知监听。

## 后端对接

- 后端：Spring Boot 3.1.12 RESTful API（端口 8080）
- 认证：JWT 令牌，通过 `Authorization: Bearer <token>` 请求头传递
- API 代理：在 `vite.config.ts` 的 `server.proxy` 中配置，`/api` 请求自动转发到后端
- 实时通知：通过 SSE（Server-Sent Events）推送订单状态变更

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

| 路径 | 页面 | 认证 |
|------|------|------|
| `/login` | 登录页 | 仅游客 |
| `/register` | 注册页 | 仅游客 |
| `/` | 首页（时段推荐） | 否 |
| `/menu` | 全日菜单 | 否 |
| `/product/:id` | 商品详情 | 否 |
| `/cart`（alias）/ `/member/cart` | 购物车 | 是 |
| `/member/checkout` | 结算下单 | 是 |
| `/member/orders` | 时光账单（订单列表） | 是 |
| `/member/orders/:orderNo` | 订单详情 | 是 |
| `/member/level` | 我的等级 | 是 |
| `/profile` | 个人中心 | 是 |
| `/points` | 光阴小铺（积分中心） | 是 |
| `/coupons` | 我的优惠券 | 是 |
| `/:pathMatch(.*)*` | 404 页面 | 否 |

路由守卫：未登录用户访问受保护路由时重定向到 `/login`（保存原地址），已登录用户访问游客页面时重定向到 `/`。

## 代码风格与修改指南

- 使用 Vue 3 + TypeScript + Composition API + `<script setup>`；统一 2 空格缩进，避免滥用 `any`
- 组件与页面文件使用 PascalCase 命名；路由名保持 kebab-case
- 通过 `@` 别名导入 `src/` 下模块
- 全局主题由 `src/style.css` 中的 CSS 变量驱动，通过 `data-theme="dusk"` 切换；涉及主题样式时优先复用现有变量和玻璃态样式类
- UI 以 Tailwind 工具类、CSS 变量和 Naive UI 为主
- 修改登录、购物车、结算、订单、积分等业务时，通常需要同时检查 `views`、`components`、`stores`、`api`、`types` 与对应测试，避免只改单层导致状态漂移
- 修改认证或全局请求逻辑时，要同时留意 `api/client.ts`、`router/index.ts`、`stores/auth.ts`、`utils/sse.ts` 与 `composables/useOrderNotification.ts` 的联动

## 测试指南

- 已接入 Vitest，配置文件为 `vitest.config.ts`，运行环境为 `happy-dom`，初始化文件是 `src/tests/setup.ts`
- 新增测试优先使用 `*.spec.ts` 命名；可与被测模块同目录放置，也可放在 `src/tests/`
- 涉及 Axios / API 调用的测试，优先在模块层 mock，不直接依赖真实后端
- 需要重点人工验证的路径：登录/注册/失效跳转、首页时间流、菜单分类/搜索/加购、购物车/结算/优惠券/下单、订单列表/详情/取消/退款/SSE 通知、个人中心/头像上传/密码修改/等级/积分/优惠券页

## 提交与 PR 指南

- 遵循 Conventional Commits，如 `feat: 增加积分兑换列表`、`fix: 修复购物车回退同步逻辑`
- 提交前至少确保 `npm run build` 通过；如果改动触及已有测试覆盖范围，补跑 `npm run test:run`
- PR 说明建议包含：改动摘要、关联任务/issue、受影响页面、必要的截图或录屏、后端接口假设
- 当前开发代理默认指向 `http://localhost:8080`；若接口契约、认证策略或代理行为变化，请在 PR 中明确说明

## 配置文件说明

| 文件 | 作用 |
|------|------|
| `package.json` | 项目依赖、脚本命令 |
| `package-lock.json` | 依赖版本锁定 |
| `vite.config.ts` | Vite 构建配置（端口 5174、代理、别名、分块） |
| `tailwind.config.js` | Tailwind 配置（朝暮主题色、字体） |
| `tsconfig.json` | TypeScript 总配置 |
| `tsconfig.app.json` | 应用源码 TS 配置 |
| `tsconfig.node.json` | 构建工具 TS 配置 |
| `vitest.config.ts` | 单元测试配置 |
| `AGENTS.md` | Codex（OpenAI）工作指南，等同于本文件 |
