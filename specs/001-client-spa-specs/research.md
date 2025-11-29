# Research: Frontend Client SPA (Guest/Member Portal)

**Branch**: `001-client-spa-specs` | **Date**: 2025-11-27

本文档记录 frontend-client P1 迭代实施计划的技术研究与决策。

---

## 1. 技术栈确认

### 1.1 框架与构建工具

| 项目 | 决策 | 依据 |
|------|------|------|
| **框架** | Vue 3 (Composition API + `<script setup>`) | constitution.md 明确规定 |
| **构建工具** | Vite 7.x | 技术栈文档 V1.4 指定 |
| **开发端口** | 5174 | 与 frontend-admin (5173) 区分 |
| **语言** | TypeScript 5.x | constitution.md 要求全程使用 TypeScript |

### 1.2 核心依赖

| 依赖 | 版本/选型 | 用途 |
|------|-----------|------|
| **Vue Router** | 4.x | SPA 路由管理 |
| **Pinia** | 最新稳定版 | 状态管理（auth、cart、theme、orders、points） |
| **Naive UI** | 最新稳定版 | UI 组件库（constitution 指定 frontend-client 使用 Naive UI） |
| **Axios** | 最新稳定版 | HTTP 客户端 |
| **Tailwind CSS** | 3.x | 实用类样式 + 自定义 CSS 变量实现主题 |

### 1.3 测试策略

| 决策 | 说明 |
|------|------|
| **测试框架** | Vitest（与 Vite 生态集成） |
| **组件测试** | @vue/test-utils |
| **测试优先级** | 轻量测试：时间推荐渲染、购物车流程、积分展示 |

---

## 2. 后端 API 依赖分析

### 2.1 认证接口 (`/api/auth/**`)

| 接口 | 方法 | 用途 | P1 必需 |
|------|------|------|---------|
| `/api/auth/register` | POST | 用户注册 | ✅ |
| `/api/auth/login` | POST | 用户登录，返回 JWT | ✅ |
| `/api/auth/logout` | POST | 退出登录（可选，前端可仅清除本地 token） | ⚠️ 可选 |
| `/api/user/me` | GET | 获取当前用户信息 | ✅ |
| `/api/user/me` | PUT | 更新用户资料 | ⚠️ P1 可简化 |

### 2.2 商品与推荐接口

| 接口 | 方法 | 用途 | P1 必需 |
|------|------|------|---------|
| `/api/categories` | GET | 获取商品分类列表 | ✅ |
| `/api/products` | GET | 商品列表（支持分类、关键字、分页） | ✅ |
| `/api/products/{id}` | GET | 商品详情 | ✅ |
| `/api/products/recommend` | GET | 时间段推荐商品 | ✅ |

### 2.3 购物车接口 (`/api/cart/**`)

| 接口 | 方法 | 用途 | P1 必需 |
|------|------|------|---------|
| `/api/cart` | GET | 获取购物车列表 | ✅ |
| `/api/cart` | POST | 添加商品到购物车 | ✅ |
| `/api/cart/{cartItemId}` | PUT | 修改购物车条目数量 | ✅ |
| `/api/cart/{cartItemId}` | DELETE | 删除购物车条目 | ✅ |

### 2.4 订单接口 (`/api/orders/**`)

| 接口 | 方法 | 用途 | P1 必需 |
|------|------|------|---------|
| `/api/orders` | POST | 创建订单 | ✅ |
| `/api/orders/my` | GET | 查询我的订单列表 | ✅ |
| `/api/orders/{orderId}` | GET | 查询订单详情 | ✅ |
| `/api/orders/{orderId}/pay` | POST | 模拟支付 | ✅ |
| `/api/orders/{orderId}/cancel` | POST | 取消未支付订单 | ✅ |

### 2.5 积分与优惠券接口

| 接口 | 方法 | 用途 | P1 必需 |
|------|------|------|---------|
| `/api/points/me` | GET | 查询积分账户信息 | ✅ |
| `/api/points/history` | GET | 查询积分流水 | ✅ |
| `/api/coupons/my` | GET | 查询我的优惠券列表 | ✅ |
| `/api/points/coupon-templates` | GET | 可兑换优惠券模板 | ⚠️ P1 可简化 |
| `/api/points/redeem-coupon` | POST | 积分兑换优惠券 | ⚠️ P1 可简化 |

---

## 3. 关键技术决策

### 3.1 主题系统实现

**决策**: 使用 CSS 变量 + Pinia store + localStorage 持久化

**实现方案**:
- Dawn Mode (06:00 - 17:59): 琥珀黄 #F5B041 / 舒芙蕾白 #FCF9F2 / 焦糖褐 #5D4037
- Dusk Mode (18:00 - 05:59): 淡金 #FAD7A0 / 黛蓝 #1A2530 / 云峰白 #ECF0F1

**时间判断逻辑**:
- 06:00 - 17:59 → Dawn Mode
- 18:00 - 05:59 → Dusk Mode
- 用户手动切换后，存储到 localStorage，优先使用用户选择

### 3.2 匿名购物车处理

**决策**:
- 游客购物车存储在 localStorage（前端本地）
- 登录/注册后，将本地购物车内容同步到后端
- 同步完成后清除本地购物车

### 3.3 JWT Token 管理

**决策**:
- Token 存储: localStorage + Pinia store
- 请求拦截: Axios 请求拦截器自动注入 `Authorization: Bearer <token>`
- Token 过期处理: 401 响应时清除 token，跳转登录页，保留购物车数据

### 3.4 API 响应处理

**统一响应格式**: `{ code, message, data }`

**错误码处理**:
- 0: 成功
- 4001: 参数校验错误
- 4010: 未登录/登录过期 → 跳转登录页
- 4030: 无访问权限
- 4040: 资源不存在
- 4090: 业务冲突
- 5000: 系统内部错误

### 3.5 路由守卫策略

**公开路由**: `/`, `/menu`, `/product/:id`, `/cart`, `/login`, `/register`

**会员专属路由**: `/checkout`, `/orders`, `/orders/:orderId`, `/points`, `/coupons`, `/profile`, `/addresses`

---

## 4. 开放问题与临时方案

| 问题 | 临时方案 | 未来增强 |
|------|----------|----------|
| 匿名购物车合并 | 追加策略，后端自动累加数量 | 提供合并确认 UI |
| 优惠券与积分同时使用 | P1 仅支持优惠券抵扣 | P2 支持积分抵扣 |
| 支付失败重试 | 显示失败提示，允许重新支付 | 后端幂等处理 |
| 跨设备购物车 | 已登录用户后端存储，游客仅本地 | 已知限制 |

---

## 5. 研究结论

所有技术上下文中的待澄清项已解决，可进入 Phase 1。
