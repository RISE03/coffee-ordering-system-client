# 实施任务列表：前端用户端 SPA - 里程碑 M1

**特性**: 客户端 SPA 基础与认证
**里程碑**: M1 (客户端基础与认证)
**状态**: ✅ 已完成
**生成时间**: 2025-11-27
**完成时间**: 2025-11-29

本任务列表仅关注 **里程碑 M1** 的交付物：项目基线、路由/外壳、主题系统、HTTP 客户端和认证（登录/注册）。后续里程碑（浏览、购物车、订单）在此仅以基础外壳或占位符形式体现。

---

## 阶段 1：项目设置与配置

**目标**: 初始化 Vue 3 + TypeScript 项目结构并配置核心工具 (Vite, Tailwind, Naive UI)。

- [X] T001 在 `tailwind.config.js` 和 `src/style.css` 中配置 Tailwind CSS 及朝/暮主题调色板
- [X] T002 在 `src/App.vue` 中安装并配置 Naive UI Provider
- [X] T003 在 `vite.config.ts` 中配置 `/api` 的 Vite 代理以指向后端
- [X] T004 在 `src/types/api.ts` 中创建 API 响应的严格 TypeScript 类型定义
- [X] T005 在 `src/types/user.ts` 中创建用户和认证的类型定义

---

## 阶段 2：基础架构 (阻塞性)

**目标**: 建立跨领域基础架构 (HTTP 客户端, 状态管理, 路由, 布局)。

- [X] T006 在 `src/api/client.ts` 中创建 Axios HTTP 客户端，包含 JWT 注入和错误处理拦截器  
  - 验收标准:  
    - 所有 API 调用都复用同一个 Axios 实例。  
    - 已登录时请求头包含 `Authorization: Bearer <token>`，未登录时不附加该头。  
    - 对后端 `{ code, message, data }` 响应进行统一处理：code=0 返回 data，其它 code 通过统一错误分支输出友好提示（不暴露技术细节）。
- [X] T007 在 `src/stores/theme.ts` 中实现用于管理 朝/暮 状态的主题 Store (Pinia)
- [X] T008 在 `src/stores/auth.ts` 中实现用于用户状态和 Token 管理的认证 Store (Pinia)  
  - 验收标准:  
    - 登录成功后可以在刷新页面后恢复登录状态（从本地存储恢复 token 和基础用户信息）。  
    - 调用退出逻辑后，token 与用户信息被清空，受保护路由会被重定向到登录页。  
    - Store 方法类型明确，无 `any`。
- [X] T009 [P] 在 `src/router/index.ts` 中设置 Vue Router 及认证路由守卫
- [X] T010 在 `src/components/layout/AppHeader.vue` 中创建包含导航和主题切换的应用头部组件
- [X] T011 [P] 在 `src/components/layout/AppFooter.vue` 中创建应用底部组件
- [X] T012 在 `src/components/layout/MainLayout.vue` 中组装主布局组件 (Header + RouterView + Footer)

---

## 阶段 2.5：通用状态模式 (Loading / Empty / Error)

**目标**: 为登录和后续页面提供统一的加载/空/错误状态处理模式，避免各页面各自处理。

- [X] T031 在 `src/components/common/StateBlock.vue` 中创建通用状态容器组件，支持 Loading/Empty/Error/Content 四种状态  
  - 验收标准:  
    - 组件通过 props 切换 Loading/Empty/Error/Content，支持插槽渲染实际内容。  
    - 空数据和错误状态使用符合“朝暮”品牌气质的温柔文案，可配置重试按钮回调。  
    - 可在登录视图或占位页面中复用，不依赖特定业务字段。
- [X] T032 在 `src/composables/useRequestState.ts` 中实现可复用的请求状态 composable（loading/error/empty + 重试）  
  - 验收标准:  
    - composable 可以与 Axios 请求配合，统一管理 loading/error/empty 状态。  
    - 至少在登录视图中使用一次，演示从发送请求到成功/失败/空的完整状态切换。  
    - 类型标注完整，可在后续列表/详情页面中复用。

---

## 阶段 3：用户故事 1 - 浏览与发现 (M1 外壳)

**目标**: 提供应用程序的视觉外壳以及 首页/菜单 的入口点。  
**故事**: 作为访客/会员，我希望看到正确的 朝/暮 主题并导航应用。

- [X] T013 [US1] 在 `src/views/HomeView.vue` 中创建带有品牌 Hero 区域的首页占位视图
- [X] T014 [US1] 在 `src/views/MenuView.vue` 中创建菜单视图占位组件
- [X] T015 [US1] 在 `src/App.vue` 或 `src/stores/theme.ts` 中实现动态主题切换逻辑 (body/html 上的类切换)
- [X] T016 [US1] 在 `src/components/layout/AppHeader.vue` 中添加首页和菜单的导航链接

---

## 阶段 4：用户故事 2 - 购物车 & 结算 (M1 外壳)

**目标**: 建立购物车路由和基础状态结构 (持久化)，以支持访客用户。  
**故事**: 作为访客，我希望即使尚未登录，我的购物车也能被保留。

- [X] T017 [US2] 在 `src/stores/cart.ts` 中创建购物车 Store 骨架，支持访客购物车的 localStorage 持久化
- [X] T018 [US2] 在 `src/views/CartView.vue` 中创建购物车视图占位组件
- [X] T019 [US2] 在 `src/components/layout/AppHeader.vue` 中添加购物车图标/链接

---

## 阶段 5：用户故事 3 - 认证与账户 (M1 核心)

**目标**: 实现完整的 登录/注册 流程和会员个人中心基础。  
**故事**: 作为会员，我希望登录或注册以访问我的账户。

- [X] T020 [US3] 在 `src/api/auth.ts` 中实现认证 API 模块 (登录, 注册, 退出, 个人信息)
- [X] T021 [US3] 在 `src/views/LoginView.vue` 中创建带有表单验证和 API 集成的登录视图
- [X] T022 [US3] 在 `src/views/RegisterView.vue` 中创建带有表单验证和 API 集成的注册视图
- [X] T023 [US3] 在 `src/views/ProfileView.vue` 中创建个人中心视图占位符 (受保护路由)
- [X] T024 [US3] 更新认证 Store 以处理 访客 -> 会员 的转换 (Token 存储) 于 `src/stores/auth.ts`
- [X] T025 [US3] 在 `src/components/layout/AppHeader.vue` 或个人中心页面实现 "退出登录" 功能
- [X] T026 [US3] 在 `src/components/layout/AppHeader.vue` 中添加 已登录/访客 状态的 UI 指示

---

## 阶段 6：打磨与 M1 最终检查

**目标**: 确保基础体验流畅且无错误。

- [X] T027 在 `src/views/NotFoundView.vue` 中实现通用的 "未找到" (404) 视图
- [X] T028 在 `src/components/LoadingSpinner.vue` 中创建可复用的 加载中/Spinner 组件（供 StateBlock 等组件内部复用）
- [X] T029 验证路由守卫是否阻止访客访问 `/profile`
- [X] T030 验证 朝/暮 主题在页面刷新后是否保持

---

## 依赖与执行顺序

1. **阶段 1 (设置)** 必须最先完成。  
2. **阶段 2 (基础)** 和 **阶段 2.5 (状态模式)** 阻塞所有用户故事。  
3. **阶段 3, 4, 5** 可以并行执行，但 T020 (Auth API) 和 T008 (Auth Store) 对阶段 5 至关重要。  
4. **阶段 5 (认证)** 是 M1 中逻辑最复杂的部分。

## 并行执行机会

- **UI 外壳**: T013 (首页), T014 (菜单), T018 (购物车) 可由不同开发人员并行构建。  
- **视图**: 登录 (T021) 和 注册 (T022) 视图在 T020 (API) 定义后可并行开发。  
- **状态模式**: T031/T032 可与部分视图开发并行完成。

## M1 覆盖率检查

**M1 完全覆盖:**  
- 项目脚手架和配置。  
- 全局 "朝/暮" 主题基础架构。  
- 带有保护守卫的路由配置。  
- HTTP 客户端基础。  
- 完整的登录和注册流程 (UI + API + 状态)。  
- 基础的加载/空/错误状态模式（StateBlock + useRequestState），可被后续页面复用。

**仅占位符/外壳 (将在 M2+ 扩展):**  
- **首页/菜单**: 仅存在占位符；没有真实的商品获取或渲染。  
- **购物车**: 仅存在 Store 骨架和空视图；没有会员/积分显示。  
- **个人中心**: 仅存在占位视图；没有会员/积分显示。  
- **订单**: M1 任务中完全省略 (甚至不需要外壳)。

**不确定性/备注:**  
- M1 的访客购物车持久化策略设定为 `localStorage`。与后端购物车合并的逻辑推迟到 M2/M3。  
- 确切的 "朝/暮" 时间分界最初将由前端逻辑处理，或默认为 "朝"，直到 M2 集成推荐 API (返回时间段)。  
- StateBlock 文案与视觉仅做基础实现，后续可根据品牌设计进一步微调。