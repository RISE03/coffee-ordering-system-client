# Implementation Plan: 003-cart-checkout-orders（前端会员侧）

**Branch**: `003-cart-checkout-orders` | **Date**: 2025-11-27 | **Spec**: `specs/003-cart-checkout-orders/spec.md`  
**Input**: 来自规格文档 `specs/003-cart-checkout-orders/spec.md`

**说明**: 本计划按照 /speckit.plan 工作流生成，范围仅限 member-facing 前端 SPA，不新增后端任务。

## Summary

基于现有 Vue 3 + Vite + Pinia + Naive UI 前端应用，实现会员购物车、结算、优惠券、模拟支付以及订单列表/详情/取消的完整流程（US1–US8）。依赖后端已稳定的 Cart/Checkout/Order/Coupon/Points API；前端聚焦 UI、状态管理、API 接入、错误与提示、路由与组件协作。关键路径：`/member/cart` → `/member/checkout` → 支付确认 → `/member/orders` / `/member/orders/:orderNo` 展示。

## Technical Context

**Language/Version**: TypeScript 5.9 + Vue 3.5（Composition API, `<script setup>`）  
**Primary Dependencies**: Vite 7, Vue Router 4, Pinia 3, Naive UI 2.43, Axios 1.13, Tailwind CSS 4  
**Storage**: 前端本地仅使用 localStorage/Pinia 持久化（JWT、主题、临时购物车）；后端数据库已存在且不可变  
**Testing**: 规划使用 Vitest + Vue Test Utils（尚未接入，需要新增轻量测试配置）  
**Target Platform**: Web SPA（移动优先，同时适配桌面）；运行于 Vite dev server 5174 与生产静态资源  
**Project Type**: 单体前端项目（`src/` 下多路由 SPA）  
**Performance Goals**: 首屏保持轻量（延后加载订单/结算子模块），交互流畅，移动端 60fps 目标  
**Constraints**: 不修改后端契约；JWT 注入与 401 处理遵循现有 axios 拦截器；品牌主题需保持晨/暮双主题与“光阴值”文案  
**Scale/Scope**: 本次仅覆盖会员购物车/结算/订单 8 个用户故事；不含 admin/staff UI 与后端改动

## Constitution Check

GATE 预检：  
- ✅ 后端优先：不重算价格/光阴值，仅调用后端预览/支付/取消接口。  
- ✅ 范围限定 frontend-client，排除 admin/staff。路由使用 `/member/*`。  
- ✅ 品牌与文案：沿用“光阴值”称谓、晨/暮主题及温暖语气；保持现有 Tailwind 主题与 Naive UI。  
- ✅ 技术栈一致：Vue3 + TS + Pinia + Naive UI + Axios；遵循 Composition API。  
- ✅ Auth：沿用 JWT 拦截器与 401 处理逻辑；不新增自定义鉴权方式。  
结果：GATE 通过，可进入 Phase 0。设计完成后将再复核。

## Project Structure

### Documentation（本特性）

```text
specs/003-cart-checkout-orders/
├─ spec.md           # 需求规格
├─ plan.md           # 本计划（已填充）
├─ research.md       # Phase 0 研究输出
├─ data-model.md     # Phase 1 实体/状态定义
├─ quickstart.md     # Phase 1 快速开始指引
└─ contracts/        # Phase 1 前端对接接口契约
   └─ frontend-apis.yaml
```

### Source Code（仓库根）

```text
src/
├─ api/              # Axios 封装与领域 API 模块（cart/checkout/order/auth 等）
├─ assets/
├─ components/
│  ├─ common/        # 通用 UI（EmptyState、Button 等）
│  ├─ layout/        # MainLayout 等框架组件
│  └─ member/        # CheckoutSummary、CouponSelector、OrderActions 等
├─ composables/      # 复用逻辑（主题、请求等）
├─ router/           # Vue Router 配置（含 member 路由）
├─ stores/           # Pinia（auth、cart、theme；待补 orders/checkout）
├─ types/            # TS 类型定义（cart/order/api 等）
├─ utils/            # 工具函数
├─ views/            # 页面：CartView、member/CheckoutPage、OrderListPage、OrderDetailPage 等
└─ style.css         # Tailwind 与主题变量入口

tests/               # 当前为空，需新增 Vitest 配置与用例
```

**Structure Decision**: 保持单体前端项目结构；在现有 `src/api`、`src/stores`、`src/views/member`、`src/components/member` 基础上迭代，不新增子项目或后端目录。

## Complexity Tracking

当前无宪章违例，无需登记复杂度偏离。

## Constitution Re-check (post design)

设计阶段未新增与宪章冲突的内容；仍然遵循 Backend-First、前端范围限定与品牌/主题要求。*** End Patch
