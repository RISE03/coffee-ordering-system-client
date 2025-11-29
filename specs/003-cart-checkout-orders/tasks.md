# tasks-frontend-client.md — 003-cart-checkout-orders（仅会员前端）

> 范围限定：仅会员 SPA 前端；后端与数据库已就绪且不可改动；不含 admin/staff UI。

## Phase 1 — 前端地基与路由

- [X] F201 [P] 在 `src/router/index.ts` 补充 `/member/cart` 路由别名并复核守卫/标题/滚动
  - Files/paths: `src/router/index.ts`, `src/components/layout/MainLayout.vue`
  - Intent: 让 cart/checkout/orders 路由与规范一致，未登录统一重定向登录且带回跳，标题与滚动行为符合全局体验。
  - Acceptance criteria: `/member/cart`、`/member/checkout`、`/member/orders`、`/member/orders/:orderNo` 均可直接访问且受 requiresAuth 保护；未登录跳登录后返回原页；meta.title 生效；滚动恢复正常。
  - Dependencies: 无，可并行。

- [X] F202 校准主导航/CTA 入口指向会员路由（`src/components/layout/MainLayout.vue`、`src/views/*` CTA）
  - Files/paths: `src/components/layout/MainLayout.vue`, `src/views/HomeView.vue`, `src/views/MenuView.vue`
  - Intent: 主页/菜单/购物车按钮正确导航到 cart、checkout、orders，避免用户走到 404 或未登录路径。
  - Acceptance criteria: 顶部/底部导航与页面 CTA 可正常进入上述路由；当前路由高亮正确；无死链。
  - Dependencies: F201。

## Phase 2 — API 与状态基线

- [X] F203 [P] 对齐 Cart/Checkout/Order/Coupon API 类型与常量到契约（`src/api/*.ts`、`src/types/*`）
  - Files/paths: `src/api/cart.ts`, `src/api/checkout.ts`, `src/api/order.ts`, `src/types/cart.ts`, `src/types/order.ts`
  - Intent: 依据 `contracts/frontend-apis.yaml` 补全请求/响应类型（含 REFUNDING/REFUNDED、预览时间戳、分页结构）并移除 any。
  - Acceptance criteria: 类型与契约字段一致；导出枚举覆盖全部状态；API 返回值在调用处具备完整类型提示；通过 TS 编译。
  - Dependencies: 无，可并行。

- [X] F204 建立 Pinia store 雏形（`src/stores/cart.ts`、新增 `src/stores/checkout.ts`、`src/stores/order.ts`）
  - Files/paths: `src/stores/cart.ts`, `src/stores/checkout.ts`, `src/stores/order.ts`
  - Intent: 预置 state/getters/actions：cart 同步接口、checkout 会话（来源、券、预览结果、idempotency key）、orders 列表/详情缓存，支持持久化策略。
  - Acceptance criteria: stores 均可被组件导入使用；默认 state 合理；无未定义引用；持久化键与现有命名一致；TS 通过。
  - Dependencies: F203。

- [X] F205 统一全局错误/提示模式（`src/api/client.ts`、`src/components/common/*` 如需）
  - Files/paths: `src/api/client.ts`, `src/components/common/Toast.ts`（如需新增）, `src/utils/error.ts`
  - Intent: 归一化网络错误、业务错误（价格变动、库存不足、优惠券失效、会话过期）到品牌语气的 message/notification；保证重试入口。
  - Acceptance criteria: 以上错误可复现并显示非技术化文案；401 触发登出+回跳；无 alert；错误处理被复用而非分散硬编码。
  - Dependencies: F203。

## Phase 3 — 购物车 UI 与状态（US1）

- [X] F206 [US1] 购物车 store 同步与数量校验（`src/stores/cart.ts`、`src/api/cart.ts`）
  - Files/paths: `src/stores/cart.ts`, `src/api/cart.ts`
  - Intent: 调用后台加载/更新/删除/清空购物车；内建 1–99 校验与回退逻辑；保持本地缓存与远端合并。
  - Acceptance criteria: 进入 `/cart` 自动拉取；越界或非数字时恢复上次有效值并提示；删除需确认；总计实时更新。
  - Dependencies: F204。

- [X] F207 [US1] 购物车页面交互完成（`src/views/CartView.vue`、`src/components/common/EmptyState.vue`）
  - Files/paths: `src/views/CartView.vue`, `src/components/common/EmptyState.vue`
  - Intent: 展示商品行（图/名/单价/小计）、数量控件、删除确认、空态与“去结算”按钮，保持移动端优先布局。
  - Acceptance criteria: 列表渲染正确；数量变化刷新小计/总计；空态显示品牌文案+返回菜单 CTA；“去结算”携带当前购物车进入 checkout。
  - Dependencies: F206。

## Phase 4 — 购物车到结算（US2）

- [X] F208 [US2] 结算入口与表单预填（`src/views/member/CheckoutPage.vue`、`src/router/index.ts`）
  - Files/paths: `src/views/member/CheckoutPage.vue`, `src/router/index.ts`
  - Intent: 从 `/cart` 进入 `/member/checkout` 时带上购物车快照；无快照时引导返回购物车；保留回跳参数。
  - Acceptance criteria: 正常路径可见购物车商品快照；无商品时提示并回 cart；返回后继续保持输入；导航栈正确。
  - Dependencies: F207。

- [X] F209 [US2] 结算表单与预览触发（`src/views/member/CheckoutPage.vue`、`src/components/member/CheckoutSummary.vue`）
  - Files/paths: `src/views/member/CheckoutPage.vue`, `src/components/member/CheckoutSummary.vue`
  - Intent: 实现自提/配送切换、联系人、地址选择/录入、备注（<=120 字）；表单变化触发 `/member/checkout/preview` 并锁定提交所用预览版本。
  - Acceptance criteria: 表单校验后才可点击支付；每次切换/修改都会刷新预览与光阴值；预览时间戳或版本可见；预览失效时禁止支付并提示刷新。
  - Dependencies: F208、F204。

## Phase 5 — Buy Now 独立流程（US3）

- [X] F210 [US3] Buy Now 快照与状态隔离（`src/views/product/ProductDetail.vue`、`src/stores/checkout.ts`）
  - Files/paths: `src/views/product/ProductDetail.vue`, `src/stores/checkout.ts`
  - Intent: 在商品详情点击 Buy now 创建本地快照（不改动购物车），含商品/数量；中途返回可恢复；缺快照时防御跳转。
  - Acceptance criteria: 完成 buy now 支付后 `/cart` 仍保留原内容；中断返回后快照仍可继续结算；无快照访问 checkout 时重定向回商品详情或菜单。
  - Dependencies: F209。

- [X] F211 [US3] Checkout 支持 Buy Now 入口（`src/views/member/CheckoutPage.vue`）
  - Files/paths: `src/views/member/CheckoutPage.vue`, `src/components/member/CheckoutSummary.vue`
  - Intent: 根据 checkout store 的来源（cart/buyNow）选择渲染快照与提交 payload，避免污染购物车；UI 提示来源。
  - Acceptance criteria: buy now 路径不修改购物车；提交 payload 的 source=buyNow；切换回 cart 结算不携带 buy now 快照；界面能显示来源提示。
  - Dependencies: F210。

## Phase 6 — 优惠券选择与自动失效（US4）

- [X] F212 [US4] 优惠券选择器分组展示（`src/components/member/CouponSelector.vue`）
  - Files/paths: `src/components/member/CouponSelector.vue`, `src/api/checkout.ts`
  - Intent: 展示可用/不可用分组，显示门槛/折扣/有效期/不可用原因；选择/移除时触发预览刷新。
  - Acceptance criteria: 切换选中立即更新预览金额与光阴值；不可用券显示具体原因；无可用券时显示空态文案。
  - Dependencies: F209。

- [X] F213 [US4] 金额变化自动移除失效优惠券（`src/stores/checkout.ts`、`src/views/member/CheckoutPage.vue`）
  - Files/paths: `src/stores/checkout.ts`, `src/views/member/CheckoutPage.vue`
  - Intent: 当预览返回券失效或金额低于门槛时，自动移除已选券并提示原因；保留重新选择入口。
  - Acceptance criteria: 触发门槛下降后券被移除且 toast/inline 提示原因；状态与 UI 同步；再次选择可恢复正常预览。
  - Dependencies: F212。

## Phase 7 — 价格拆分与模拟支付（US5）

- [X] F214 [US5] 价格拆分与光阴值呈现组件（`src/components/member/CheckoutSummary.vue`）
  - Files/paths: `src/components/member/CheckoutSummary.vue`
  - Intent: 固定展示商品总额、优惠、应付金额高亮、预计光阴值；适配移动端折叠/展开；用于 checkout 与支付后确认。
  - Acceptance criteria: 任一表单/券变更后金额与光阴值同步；金额数值与后端预览一致；移动端不溢出；颜色/语气符合品牌。
  - Dependencies: F209、F212。

- [X] F215 [US5] Pay now 提交与幂等处理（`src/views/member/CheckoutPage.vue`、`src/api/checkout.ts`）
  - Files/paths: `src/views/member/CheckoutPage.vue`, `src/api/checkout.ts`
  - Intent: 使用 `/member/checkout/pay` 并带 `X-Idempotency-Key`，确认提交前校验预览版本；成功跳转订单详情，失败提示可重试。
  - Acceptance criteria: 重复点击不重复扣款；预览过期/价格变动时阻止支付并提示刷新；支付成功进入订单详情且金额一致；失败展示友好原因与重试按钮。
  - Dependencies: F214。

## Phase 8 — 订单列表（US6）

- [X] F216 [US6] 订单列表状态筛选与分页（`src/views/member/OrderListPage.vue`、`src/stores/order.ts`）
  - Files/paths: `src/views/member/OrderListPage.vue`, `src/stores/order.ts`, `src/api/order.ts`
  - Intent: 实现 All/待支付/制作中/已完成/已取消/退款中/已退款 标签切换、分页或"加载更多"，并缓存列表。
  - Acceptance criteria: 切换标签触发接口并更新列表与计数；加载态/空态/错误重试可见；分页或加载更多工作正常；移动端排版不溢出。
  - Dependencies: F204、F203。

- [X] F217 [US6] 列表内快捷动作（继续支付/查看详情）（`src/views/member/OrderListPage.vue`、`src/components/member/OrderActions.vue`）
  - Files/paths: `src/views/member/OrderListPage.vue`, `src/components/member/OrderActions.vue`
  - Intent: 在待支付订单卡片展示"Pay now"与"查看详情"，其余状态隐藏或置灰；点击支付跳转到支付/详情并刷新状态。
  - Acceptance criteria: 待支付卡片显示按钮且可跳转；非待支付不显示或禁用并有说明；状态刷新后按钮与 badge 同步。
  - Dependencies: F216。

## Phase 9 — 订单详情（US7）

- [X] F218 [US7] 订单详情信息与时间线展示（`src/views/member/OrderDetailPage.vue`）
  - Files/paths: `src/views/member/OrderDetailPage.vue`, `src/components/member/OrderActions.vue`
  - Intent: 展示订单号、创建/支付时间、取餐/配送信息、商品快照、优惠券、价格拆分、光阴值、状态时间线。
  - Acceptance criteria: 字段完整显示且与列表金额一致；时间线按时间排序；缺失字段有占位或隐藏；移动端可读。
  - Dependencies: F216。

- [X] F219 [US7] 详情页动作可见性与文案（`src/components/member/OrderActions.vue`）
  - Files/paths: `src/components/member/OrderActions.vue`, `src/views/member/OrderDetailPage.vue`
  - Intent: 根据订单状态决定显示 Pay now / Cancel / 返回列表；非待支付状态隐藏或置灰并提供原因提示。
  - Acceptance criteria: 待支付显示 Pay now + Cancel；支付后隐藏取消；退款状态显示说明；按钮点击与路由跳转正常。
  - Dependencies: F218。

## Phase 10 — 取消待支付订单（US8）

- [X] F220 [US8] 列表与详情的取消流程（`src/api/order.ts`、`src/components/member/OrderActions.vue`）
  - Files/paths: `src/api/order.ts`, `src/components/member/OrderActions.vue`, `src/views/member/OrderDetailPage.vue`, `src/views/member/OrderListPage.vue`
  - Intent: 实现 `/member/orders/{orderNo}/cancel` 调用与确认弹窗；成功后刷新列表/详情并隐藏动作；拒绝取消时显示后端原因。
  - Acceptance criteria: 待支付订单可取消且需二次确认；成功后状态变为已取消并禁用操作；拒绝时提示原因且状态不变；空态/错误友好。
  - Dependencies: F217、F219。

## Phase 11 — 品牌文案与空/错误态

- [X] F221 [P] 文案与空态审校（`src/views/*`、`src/components/common/EmptyState.vue`）
  - Files/paths: `src/views/CartView.vue`, `src/views/member/CheckoutPage.vue`, `src/views/member/OrderListPage.vue`, `src/views/member/OrderDetailPage.vue`, `src/components/common/EmptyState.vue`
  - Intent: 统一“光阴值”称谓、错误提示、空态/确认文案，确保晨/暮主题语气一致；避免技术术语。
  - Acceptance criteria: 文案用语统一、无英文残留；空态包含 CTA；错误提示温和可重试；视觉与主题变量一致。
  - Dependencies: F207、F214、F216、F218。

## Phase 12 — 测试与手工 QA

- [X] F222 搭建前端测试基线（`package.json`、`vitest.config.ts`、`tsconfig.*`）
  - Files/paths: `package.json`, `vitest.config.ts`, `tsconfig.vitest.json`（如需）
  - Intent: 接入 Vitest + Vue Test Utils，配置别名/JSX 支持，与 Vite/Pinia 对齐；新增 `npm test` 脚本。
  - Acceptance criteria: `npm test` 可运行空测试并退出码 0；别名解析正常；CI 可用。
  - Dependencies: F203。

- [X] F223 编写购物车与结算核心单测（`src/stores/cart.spec.ts`、`src/stores/checkout.spec.ts`）
  - Files/paths: `src/stores/cart.spec.ts`, `src/stores/checkout.spec.ts`
  - Intent: 覆盖数量校验/回退、总计刷新、优惠券门槛下降自动移除与预览金额更新。
  - Acceptance criteria: 用例模拟 API/Pinia，无真实网络；断言上述逻辑；测试通过。
  - Dependencies: F207、F213、F222。

- [X] F224 编写订单列表/动作单测（`src/stores/order.spec.ts`）
  - Files/paths: `src/stores/order.spec.ts`
  - Intent: 覆盖状态筛选、分页加载、待支付按钮可见性与跳转、取消动作状态切换。
  - Acceptance criteria: 模拟不同状态返回；按钮可见性与跳转符合期望；取消成功/失败分支断言；测试通过。
  - Dependencies: F217、F220、F222。

- [X] F225 手工 QA 清单更新（`specs/003-cart-checkout-orders/checklists/frontend-qa.md`）
  - Files/paths: `specs/003-cart-checkout-orders/checklists/frontend-qa.md`
  - Intent: 列出手工路径：cart→checkout→pay→orders、buy now 不污染购物车、优惠券自动移除、订单取消/支付状态刷新、断网/401 提示。
  - Acceptance criteria: 清单覆盖上述路径，开发者可按步骤复测；与最新 UI 对齐；无缺项。
  - Dependencies: 核心功能完成后执行（F215、F220）。

---

### 依赖关系概览
- 路由/导航（F201–F202）→ API/状态基线（F203–F205）→ Cart（F206–F207）→ Checkout（F208–F209）→ Buy Now（F210–F211）→ Coupon/预览（F212–F213）→ 支付（F214–F215）→ 订单列表/详情/取消（F216–F220）→ 文案与测试收尾（F221–F225）。

### 并行建议
- 可并行：F201/F203/F205；F216 与 F218 在 API 类型稳定后可部分并行；测试编写 F223/F224 可穿插在对应功能完成后进行。

### MVP 建议
- 最小可交付路径：完成 F201–F209、F212–F215、F216（列表基本显示）即覆盖 US1–US6 的核心“购物车→结算→支付→查看订单”闭环。
