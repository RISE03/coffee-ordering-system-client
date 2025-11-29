# quickstart.md — 003-cart-checkout-orders（前端会员侧）

1) 安装与运行  
```
npm install
npm run dev   # 默认端口 5174，已配置 /api 代理到后端
```
确保本地后端或代理可提供 Cart/Checkout/Orders/Coupons/Points 接口，否则相关页面将显示错误提示。

2) 关键路由  
- `/cart` → 会员购物车（未登录会被重定向登录后返回）  
- `/member/checkout` → 结算/支付预览（支持从购物车或 buy now 进入）  
- `/member/orders` → 订单列表（含状态筛选、分页、支付/取消动作）  
- `/member/orders/:orderNo` → 订单详情（含价格拆分、时间线、取消操作）

3) 调试提示  
- JWT 会自动注入 axios，401 触发登出与重定向。  
- 可在浏览器 localStorage 清除 `token`/`dawn_dusk_cart_items` 以重置登录和本地购物车。  
- 组件库为 Naive UI，样式使用 Tailwind v4 及主题变量，保持晨/暮主题一致性。  
- 首选移动端视图调试，关注数量输入、优惠券自动失效、支付后状态刷新等路径。  

4) 测试（待新增）  
- 计划接入 Vitest + Vue Test Utils；运行命令拟为 `npm test`（待在任务中落地配置）。*** End Patch
