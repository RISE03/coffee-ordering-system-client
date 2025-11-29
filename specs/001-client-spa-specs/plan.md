# Implementation Plan: Frontend Client SPA (Guest/Member Portal)

**Branch**: `001-client-spa-specs` | **Date**: 2025-11-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-client-spa-specs/spec.md`

---

## Summary

本计划定义"朝暮 / Dawn & Dusk"咖啡厅在线点餐系统 **frontend-client** 用户端 SPA 的 P1 迭代实施方案。基于 Vue 3 + TypeScript + Vite 构建，集成现有 Spring Boot 后端 API，实现完整的浏览、下单、会员、积分和优惠券核心流程，并通过动态朝/暮主题强化品牌体验。

---

## Technical Context

**Language/Version**: TypeScript 5.x on Vue 3
**Primary Dependencies**: Vue Router 4, Pinia, Naive UI, Axios, Tailwind CSS 3.x
**Storage**: localStorage (guest cart, theme preference) + Backend API (member data)
**Testing**: Vitest + @vue/test-utils
**Target Platform**: Web SPA (Mobile-first responsive)
**Project Type**: Web SPA (frontend-client only)
**Performance Goals**: 页面响应 < 3s，首屏优化，支持单店日常并发
**Constraints**: 后端 API 已存在且不可修改；仅 frontend-client 范围；不涉及 admin/staff 功能
**Scale/Scope**: 单店场景，P1 核心流程

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 状态 | 说明 |
|------|------|------|
| I. Backend-First Integrity | ✅ 通过 | 所有业务逻辑依赖后端 API，前端仅做 UX 层面的简单校验 |
| II. Specification Authority & Scope | ✅ 通过 | 严格遵循 SRS、页面结构、API 设计、品牌 UI 文档 |
| III. Brand, Experience, and Copy | ✅ 通过 | 使用"光阴值"、会员等级名称、朝/暮主题 |
| IV. Front-End Architecture & Tech Stack | ✅ 通过 | Vue 3 + Vite + Vue Router 4 + Pinia + Naive UI + Tailwind CSS |
| V. Authentication, Roles, and Flows | ✅ 通过 | 支持 Guest/Member 状态，JWT 认证，checkout 时引导登录 |
| VI. API Integration Principles | ✅ 通过 | 统一 HTTP 客户端，`{ code, message, data }` 响应处理 |
| VII. Quality, Testing, and Consistency | ✅ 通过 | TypeScript 全程，轻量测试覆盖核心流程 |
| VIII. Performance, Responsiveness, and Accessibility | ✅ 通过 | Mobile-first，代码分割，语义化 HTML |
| IX. Governance and Evolution | ✅ 通过 | 遵循文档优先原则，不引入 admin/staff 功能 |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-client-spa-specs/
├── plan.md              # 本文件 (/speckit.plan 输出)
├── research.md          # Phase 0 输出
├── data-model.md        # Phase 1 输出
├── quickstart.md        # Phase 1 输出
├── contracts/           # Phase 1 输出
│   └── api-contracts.md
└── tasks.md             # Phase 2 输出 (/speckit.tasks)
```

### Source Code (repository root)

```text
frontend-client/
├── src/
│   ├── api/                    # API 客户端模块
│   │   ├── client.ts           # Axios 实例与拦截器
│   │   ├── auth.ts             # 认证相关 API
│   │   ├── products.ts         # 商品相关 API
│   │   ├── cart.ts             # 购物车 API
│   │   ├── orders.ts           # 订单 API
│   │   ├── points.ts           # 积分 API
│   │   └── coupons.ts          # 优惠券 API
│   ├── components/             # 可复用组件
│   │   ├── layout/             # 布局组件
│   │   ├── product/            # 商品相关组件
│   │   ├── cart/               # 购物车组件
│   │   ├── order/              # 订单组件
│   │   └── common/             # 通用组件
│   ├── composables/            # 组合式函数
│   ├── router/                 # 路由配置
│   ├── stores/                 # Pinia stores
│   ├── styles/                 # 全局样式与主题
│   ├── types/                  # TypeScript 类型定义
│   ├── views/                  # 页面组件
│   ├── App.vue
│   └── main.ts
├── public/
├── tests/
│   ├── unit/
│   └── components/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

**Structure Decision**: 采用 Web SPA 结构，frontend-client 作为独立前端项目，通过 API 代理与后端通信。

---

## 1. Planning Scope

本迭代范围：为单店场景交付可用的端到端点餐与会员体验，聚焦 P1 核心流程：

### In-Scope (P1)

- **浏览与发现**
  - 首页：品牌 Hero + 时间段推荐（朝·醒/午·憩/暮·微醺）
  - 菜单浏览：分类筛选 + 关键字搜索
  - 商品详情页
- **购物车与结算**
  - 购物车管理（添加/修改/删除）
  - 结算流程（创建订单，模拟支付）
- **认证与账户**
  - 登录/注册
  - Guest → Member 转换（checkout 时不丢失购物车）
- **订单**
  - 订单列表（按状态筛选）
  - 订单详情
- **会员与积分**
  - 积分中心（光阴值余额、等级、流水）
  - 优惠券列表
  - 结算时选择优惠券
  - 个人中心 + 退出登录

### Out-of-Scope

- Admin/Staff 功能（属于 frontend-admin）
- 多门店支持
- 高级个性化推荐
- 营销活动管理
- 后端代码修改
- 积分抵扣（P2）
- 订单评价（P2）
- 退款申请（P2）

---

## 2. In-Scope Features (P1 Only)

### 2.1 Home & Recommendations

| 用户故事/FR | 描述 |
|-------------|------|
| User Story 1 | 浏览与发现 - 时间感推荐 |
| FR-001 | 自动切换朝/暮主题 |
| FR-002 | 时间段推荐商品 |

### 2.2 Menu & Product Detail

| 用户故事/FR | 描述 |
|-------------|------|
| User Story 1 (场景 3-4) | 菜单浏览、商品详情 |
| FR-004 | 分类筛选商品 |
| FR-005 | 关键字搜索 |
| FR-006 | 商品详情展示 |

### 2.3 Cart & Checkout

| 用户故事/FR | 描述 |
|-------------|------|
| User Story 2 | 购物车与结算 |
| FR-007 | 购物车管理 |
| FR-008 | Guest 结算引导登录 |
| FR-009 | 订单金额计算（含优惠券） |
| FR-010 | 提交订单 |

### 2.4 Auth (Login/Register) & Guest→Member

| 用户故事/FR | 描述 |
|-------------|------|
| User Story 3 | 认证与账户 |
| FR-011 | 用户注册 |
| FR-012 | 用户登录 + JWT |
| FR-013 | 个人中心展示 |

### 2.5 Orders (History & Detail)

| 用户故事/FR | 描述 |
|-------------|------|
| User Story 5 | 订单历史 |
| FR-017 | 订单列表 |
| FR-018 | 订单详情 |

### 2.6 Loyalty & Profile

| 用户故事/FR | 描述 |
|-------------|------|
| User Story 4 | 积分与优惠券 |
| FR-003 | 使用品牌术语（光阴值、等级名称） |
| FR-014 | 积分余额与等级展示 |
| FR-015 | 优惠券列表 |
| FR-016 | 结算时选择优惠券 |

---

## 3. Assumptions & Dependencies

### 3.1 Backend Dependencies

| 接口组 | 端点 | 状态 |
|--------|------|------|
| Auth | `/api/auth/register`, `/api/auth/login`, `/api/user/me` | 假设已实现 |
| Products | `/api/categories`, `/api/products`, `/api/products/{id}`, `/api/products/recommend` | 假设已实现 |
| Cart | `/api/cart` (GET/POST), `/api/cart/{id}` (PUT/DELETE) | 假设已实现 |
| Orders | `/api/orders` (POST), `/api/orders/my`, `/api/orders/{id}`, `/api/orders/{id}/pay`, `/api/orders/{id}/cancel` | 假设已实现 |
| Points | `/api/points/me`, `/api/points/history` | 假设已实现 |
| Coupons | `/api/coupons/my` | 假设已实现 |

### 3.2 Frontend Foundations

- Vue 3 + Vite + Vue Router 4 + Pinia + Naive UI + Tailwind CSS（constitution 指定）
- 共享 HTTP 客户端（Axios wrapper）
- 动态朝/暮主题（CSS 变量实现）

### 3.3 Assumptions Requiring Confirmation

| 假设 | 影响 | 临时方案 |
|------|------|----------|
| 匿名购物车行为 | Guest 购物车如何持久化 | 使用 localStorage，登录后同步到后端 |
| 购物车合并策略 | 登录时本地与后端购物车如何合并 | 追加策略，后端自动累加数量 |
| 错误响应格式 | 统一错误处理 | 假设 `{ code, message, data }` 格式 |
| 时间段判断 | 前端还是后端判断 | 后端 `/api/products/recommend` 自动判断 |

---

## 4. Milestones / Phases

### M1 – Client Foundations & Auth

**目标**: 搭建项目基础架构，实现认证流程和基础布局。

**工作流**:
- 项目初始化：Vite + Vue 3 + TypeScript + Tailwind CSS + Naive UI
- 路由配置：定义所有核心路由，实现路由守卫
- 主题系统：CSS 变量 + Pinia store + localStorage 持久化
- HTTP 客户端：Axios 封装，JWT 注入，统一错误处理
- Pinia stores 骨架：auth、cart、theme
- 登录/注册页面：表单验证，API 集成
- 基础布局：Header（导航 + 主题切换）、Footer、主内容区

**交付物**:
- 可运行的项目骨架
- 登录/注册功能
- 主题切换功能
- 路由守卫（公开/会员专属）

**关联 FR**: FR-001, FR-011, FR-012, FR-013

---

### M2 – Browsing, Recommendations & Cart

**目标**: 实现商品浏览、时间段推荐和购物车管理。

**工作流**:
- 首页：Hero 区域 + 时间段推荐区块
- 菜单页：分类侧边栏 + 商品列表 + 搜索框 + 分页
- 商品详情页：图片、描述、价格、加入购物车
- 购物车页面：列表展示、数量调整、删除、空状态
- 购物车 store：支持 Guest（localStorage）和 Member（API）两种模式
- Guest → Member 购物车同步逻辑

**交付物**:
- 首页（含时间段推荐）
- 菜单浏览页
- 商品详情页
- 购物车页面
- 购物车状态管理

**关联 FR**: FR-002, FR-004, FR-005, FR-006, FR-007

---

### M3 – Checkout & Orders

**目标**: 实现结算流程和订单管理。

**工作流**:
- 结算页面：商品确认、取餐方式选择、优惠券选择、金额汇总
- 结算认证集成：Guest 跳转登录/注册，返回结算页
- 订单创建：调用 API，处理成功/失败
- 模拟支付：调用支付 API，更新订单状态
- 订单列表页：状态筛选、分页
- 订单详情页：完整信息展示

**交付物**:
- 结算页面
- 订单创建流程
- 模拟支付流程
- 订单列表页
- 订单详情页

**关联 FR**: FR-008, FR-009, FR-010, FR-016, FR-017, FR-018

---

### M4 – Loyalty & Profile

**目标**: 实现积分中心、优惠券和个人中心。

**工作流**:
- 积分中心页面：余额、等级、等级进度、流水记录
- 优惠券列表页：状态筛选（未使用/已使用/已过期）
- 个人中心页面：基本信息、快捷入口、退出登录
- 收货地址管理（如 P1 需要）
- 品牌文案优化：空状态、错误提示、成功反馈

**交付物**:
- 积分中心页面
- 优惠券列表页
- 个人中心页面
- 品牌化空状态和提示

**关联 FR**: FR-003, FR-014, FR-015

---

## 5. Cross-Cutting Foundations

### 5.1 Routing & Navigation

**路由定义**:

| 路由 | 页面 | 权限 |
|------|------|------|
| `/` | Home | 公开 |
| `/menu` | Menu | 公开 |
| `/product/:id` | ProductDetail | 公开 |
| `/cart` | Cart | 公开 |
| `/login` | Login | 公开 |
| `/register` | Register | 公开 |
| `/checkout` | Checkout | 需登录 |
| `/orders` | Orders | 需登录 |
| `/orders/:orderId` | OrderDetail | 需登录 |
| `/points` | Points | 需登录 |
| `/coupons` | Coupons | 需登录 |
| `/profile` | Profile | 需登录 |
| `/addresses` | Addresses | 需登录 |

**路由守卫**:
- `beforeEach`: 检查目标路由是否需要登录
- 未登录访问会员专属路由 → 重定向到 `/login?redirect=<target>`
- 登录后自动跳转回 redirect 目标

### 5.2 State Management (Pinia)

| Store | 职责 |
|-------|------|
| `auth` | 用户信息、JWT token、登录状态 |
| `cart` | 购物车数据（Guest: localStorage, Member: API） |
| `theme` | 主题模式（auto/dawn/dusk）、当前应用主题 |
| `products` | 商品缓存（可选，减少重复请求） |
| `orders` | 订单列表缓存（可选） |

### 5.3 HTTP Client & Error Handling

**Axios 配置**:
- Base URL: `/api`
- 请求拦截器: 自动注入 `Authorization: Bearer <token>`
- 响应拦截器: 统一处理 `{ code, message, data }`

**错误处理策略**:
| 错误码 | 处理 |
|--------|------|
| 0 | 正常返回 data |
| 4010 | 清除 token，跳转登录页，保留购物车 |
| 4001/4030/4040/4090 | 显示 message 提示 |
| 5000 | 显示通用错误提示 |

### 5.4 Brand & Theme

**CSS 变量**:
```css
:root[data-theme="dawn"] {
  --primary-color: #F5B041;
  --bg-color: #FCF9F2;
  --text-color: #5D4037;
}

:root[data-theme="dusk"] {
  --primary-color: #FAD7A0;
  --bg-color: #1A2530;
  --text-color: #ECF0F1;
}
```

**品牌文案**:
- 积分 → "光阴值"
- 等级 → "晨曦/烈阳/晚霞/繁星"
- 空购物车 → "购物车空空如也，去看看今日推荐吧。"
- 订单成功 → "下单成功！本次消费为您带来 +XX 光阴值"

---

## 6. Risks & Open Questions

| 风险/问题 | 影响 | 临时方案 |
|-----------|------|----------|
| **匿名购物车持久化** | Guest 用户刷新页面后购物车是否保留 | 使用 localStorage 存储，登录后同步到后端 |
| **购物车合并冲突** | 登录时本地和后端都有购物车数据 | 采用追加策略，后端自动累加相同商品数量 |
| **优惠券与积分同时使用** | 结算时能否同时使用 | P1 仅支持优惠券，积分抵扣标记为 P2 |
| **支付失败重试** | 支付失败后如何处理 | 显示失败提示，允许重新点击支付，后端保证幂等 |
| **跨设备购物车** | 用户在不同设备登录后购物车是否同步 | 已登录用户购物车存后端，天然支持；Guest 仅本地 |
| **时间段边界** | 17:59 和 18:00 切换时的体验 | 依赖后端 `/api/products/recommend` 判断，前端仅展示 |
| **Token 过期** | 用户操作中途 token 过期 | 401 响应时跳转登录，保留购物车和当前路由 |

---

## 7. Plan Acceptance Criteria

本计划满足以下条件时视为完成：

- [x] 所有 P1 用户故事/FR 已映射到至少一个里程碑
- [x] 跨领域基础设施（路由、状态管理、HTTP 客户端、主题）已识别
- [x] 已知风险/开放问题已记录，不阻塞实施启动
- [x] 未引入 admin/staff 功能或后端修改
- [x] 详细实施决策延迟到 `/speckit.tasks` 和 `/speckit.implement`

---

## Complexity Tracking

> **无违规需要记录** - 本计划完全遵循 constitution 原则。

---

## Related Documents

- [Feature Spec](./spec.md) - 功能规格说明
- [Research](./research.md) - 技术研究与决策
- [Data Model](./data-model.md) - 数据模型定义
- [API Contracts](./contracts/api-contracts.md) - API 契约
- [Quickstart](./quickstart.md) - 快速启动指南
- [Constitution](../../.specify/memory/constitution.md) - 项目宪法
