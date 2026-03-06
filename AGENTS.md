# Repository Guidelines

> **⚠️ 核心指令 / CRITICAL**
> **请务必全程使用【简体中文】进行对话、回复、解释代码和编写文档。**
> **Always use Simplified Chinese for all interactions, responses, and documentation.**

## 重要规范

### 规范
- 所有代码注释、文档、提交信息使用中文，专有名词保留原文即可。
- 所有文件的读取、写入、提交等操作必须统一使用 UTF-8 编码。
- `src/` 下存在少量 `.backup` 文件，它们属于历史备份，不作为当前实现和修改依据。

## 工具约定
- 在本仓库执行代码搜索、文件枚举时，优先使用项目内 ripgrep：`.\tools\rg\rg.exe`。
- 仅当 `.\tools\rg\rg.exe` 不存在或不可执行时，才回退到系统 `rg` 或其他等价工具。
- 仓库当前默认在 Windows + PowerShell 环境下工作，命令示例优先按该环境书写。

## 项目概览
- 本项目是“朝暮”咖啡厅在线点餐与会员体系的用户端 / 会员端前端，基于 Vue 3 + TypeScript + Vite 构建。
- 主要技术栈：Vue 3、Vue Router 4、Pinia、Axios、Naive UI、Tailwind CSS v4、Vitest。
- `main.ts` 启动时会先应用主题，再执行认证检查、绑定购物车用户并在已登录时预拉取购物车，随后才挂载应用。
- `App.vue` 统一挂载 Naive UI Provider，并在应用级别启用订单 SSE 通知监听。

## 项目结构与模块组织
- `src/views/` 为页面入口：
  - 顶层页面包括 `HomeView`、`MenuView`、`CartView`、`LoginView`、`RegisterView`、`ProfileView`、`PointsCenterView`、`MyCouponsView`、`NotFoundView`。
  - `src/views/member/` 包含会员相关页面：`CheckoutPage`、`OrderListPage`、`OrderDetailPage`、`LevelDetailPage`。
  - `src/views/product/` 包含商品详情页：`ProductDetail`。
- `src/components/` 按业务分组：
  - `common/`：`ThemeSwitcher`、`SearchBar`、`EmptyState`、`StateBlock`、`CartFloatingBall`、`ProductSkeleton` 等通用组件。
  - `layout/`：`MainLayout`、`HomeHeader`、`BottomNav`、`AppHeader`、`AppFooter`。
  - `home/`：时间流首页相关组件，如 `DynamicTimeHeader`、`HorizontalTimeline`、`BentoProductGrid`、`ThemeCountdown`、`TimeSlotCard`。
  - `login/`：登录/注册视觉组件，如 `ShapeBackground`、`ElegantShape`、`CoffeeIcon`。
  - `member/`：会员结算与订单组件，如 `CheckoutSummary`、`CouponSelector`、`OrderActions`、`OrderProgress`、`RefundDialog`。
  - `product/`：商品组件，目前核心为 `ProductCard`。
  - 根级还保留 `LoadingSpinner.vue`、`HelloWorld.vue` 等独立组件。
- `src/stores/` 当前实际包含 7 个 Pinia store：`auth`、`cart`、`theme`、`product`、`timeflow`、`checkout`、`order`。
- `src/api/` 以 `client.ts` 为 Axios 入口，实际模块包括 `auth`、`cart`、`checkout`、`config`、`coupon`、`file`、`order`、`points`、`products`、`user`。`client.ts` 还负责 token 注入、统一错误处理、401 跳转与可选跳过认证重定向。
- `src/router/index.ts` 集中定义全部静态路由，并处理页面标题、登录守卫、访客守卫与登录后跳回逻辑。
- `src/composables/` 主要放可复用业务逻辑，目前包括 `useOrderNotification`、`useOrderAvailabilityGuard`、`useRequestState`、`useTimeSlot` 等。
- `src/utils/` 包含错误处理、优惠券文案归一化、SSE 封装、营业时间与下单可用性判断等工具。
- `src/constants/timeflow.ts` 存放时间流首页的时段配置与映射。
- `src/types/` 包含 `api`、`cart`、`order`、`user`、`product`、`points`、`timeflow` 等类型定义。
- `src/types/index.ts` 当前**只**统一导出 `api/cart/order/user`，不要默认 `product/points/timeflow` 也能从这里直接导入。
- 测试文件并不只在 `src/tests/`：初始化与示例在 `src/tests/`，业务测试主要分布在 `src/stores/*.spec.ts` 和 `src/utils/*.spec.ts`。
- `public/` 存放原样输出静态资源；`public/images/` 下有 logo 与 Dawn / Dusk 背景图。
- `bug/` 目录用于存放问题复盘与排查记录。
- `tools/rg/rg.exe` 为仓库内置搜索工具。

## 当前主要路由
- 游客页：`/login`、`/register`。
- 公共页：`/`、`/menu`、`/product/:id`、`/:pathMatch(.*)*`。
- 需要登录的页面：`/cart`（别名，对应 `/member/cart`）、`/member/cart`、`/profile`、`/member/checkout`、`/member/orders`、`/member/orders/:orderNo`、`/member/level`、`/points`、`/coupons`。

## 构建、测试与开发命令
- `npm install`：安装依赖。建议使用 Node `20.19+` 或 `22.12+`，以满足 Vite 7 运行要求。
- `npm run dev`：启动 Vite 开发服务器，监听 `0.0.0.0:5174`，自动打开浏览器，并将 `/api` 代理到 `http://localhost:8080`。
- `npm run build`：执行 `vue-tsc -b` 后产出生产包到 `dist/`。
- `npm run preview`：预览生产构建结果。
- `npm run test`：以 watch 模式运行 Vitest。
- `npm run test:run`：单次运行 Vitest，适合本地回归或 CI。
- `npm run test:ui`：启动 Vitest UI。
- 当前仓库**没有** `lint` 或 `format` 脚本，相关检查不要默认存在。
- `tsconfig.app.json` 当前排除了 `src/**/*.spec.ts` 与 `src/**/*.test.ts`，因此 `npm run build` 的类型检查默认**不覆盖测试文件**。

## 代码风格与命名约定
- 使用 Vue 3 + TypeScript + Composition API + `<script setup>`；统一 2 空格缩进，避免滥用 `any`。
- 组件与页面文件使用 PascalCase 命名；路由名保持 kebab-case。
- 通过 `@` 别名导入 `src/` 下模块。
- 全局主题由 `src/style.css` 中的 CSS 变量驱动，通过 `data-theme="dusk"` 切换 Dawn / Dusk，并由 `useThemeStore` 管理自动 / 手动模式。
- UI 以 Tailwind 工具类、CSS 变量和 Naive UI 为主；涉及主题样式时优先复用现有变量和玻璃态样式类。
- 修改登录、购物车、结算、订单、积分等业务时，通常需要同时检查 `views`、`components`、`stores`、`api`、`types` 与对应测试，避免只改单层导致状态漂移。
- 修改认证或全局请求逻辑时，要同时留意 `src/api/client.ts`、`src/router/index.ts`、`src/stores/auth.ts`、`src/utils/sse.ts` 与 `src/composables/useOrderNotification.ts` 的联动。

## 测试指南
- 已接入 Vitest，配置文件为 `vitest.config.ts`，运行环境为 `happy-dom`，初始化文件是 `src/tests/setup.ts`。
- 新增测试优先使用 `*.spec.ts` 命名；可以放在 `src/tests/`，也可以按当前习惯与被测模块同目录放置。
- 涉及 Axios / API 调用的测试，优先在模块层 mock，不直接依赖真实后端。
- 当前需要重点人工验证的路径包括：
  - 登录 / 注册 / 登录失效跳转。
  - 首页时间流切换、时段商品加载、营业时间提示。
  - 菜单页分类切换、全局搜索、加入购物车。
  - 购物车、立即购买、结算预览、优惠券选择、下单与支付。
  - 订单列表 / 详情、取消订单、退款申请 / 撤销、SSE 通知联动。
  - 个人中心、头像上传、密码修改、等级页、积分页、优惠券页。

## 提交与 Pull Request 指南
- 建议遵循 Conventional Commits，例如 `feat: 增加积分兑换列表`、`fix: 修复购物车回退同步逻辑`。
- 提交前至少确保 `npm run build` 通过；如果改动触及现有测试覆盖范围，补跑 `npm run test:run`。
- PR 说明建议包含：改动摘要、关联任务 / issue、受影响页面、必要的截图或录屏、后端接口假设。
- 当前开发代理默认指向 `http://localhost:8080`；若接口契约、认证策略或代理行为变化，请在 PR 中明确说明。
