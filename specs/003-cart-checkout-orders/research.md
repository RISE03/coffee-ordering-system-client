# research.md — 003-cart-checkout-orders（前端会员侧）

> 本阶段无“NEEDS CLARIFICATION”项，记录已确认的技术与约束，供后续设计与任务分解复用。

- Decision: 前端技术栈保持 Vue 3 + Vite + Pinia + Naive UI + Tailwind + Axios + TypeScript。  
  Rationale: `package.json` 与现有代码已采用上述组合，组件与路由均按 Composition API 编写。  
  Alternatives considered: 切换 Element Plus / Zustand 等会增加重构成本且与现有 UI/样式不符。

- Decision: 路由结构已包含 `/cart`、`/member/checkout`、`/member/orders`、`/member/orders/:orderNo`，继续复用并完善。  
  Rationale: `src/router/index.ts` 已定义对应路由并启用登录守卫。  
  Alternatives considered: 新增子路由或模块化路由暂不需要，避免引入额外维护成本。

- Decision: 统一使用已存在的 Axios 客户端与 JWT 拦截器（`src/api/client.ts`）处理 401 与业务错误。  
  Rationale: 客户端已封装 `ApiErrorCode` 映射与 message 提示，符合宪章“后端优先”与“温暖提示”要求。  
  Alternatives considered: 额外全局 toast 库或手写 fetch 封装会重复造轮子。

- Decision: 订单/购物车/结算接口按现有路径对接（`/member/cart`, `/member/checkout/preview`, `/member/checkout/submit`, `/member/checkout/pay`, `/member/orders`, `/member/orders/{orderNo}` 等），不新增后端改动。  
  Rationale: 后端已声明稳定且为单一事实来源；前端只需对齐类型与 UI。  
  Alternatives considered: 在前端做价格或优惠券计算被拒绝（违背 Backend-First）。

- Decision: 测试方案采用 Vitest + Vue Test Utils，聚焦关键前端逻辑（数量校验、结算预览、订单列表过滤/取消）。  
  Rationale: 轻量接入、与 Vite 生态兼容；满足“轻测试”宪章要求。  
  Alternatives considered: Jest 体积更大且与当前 Vite 配置不一致。
