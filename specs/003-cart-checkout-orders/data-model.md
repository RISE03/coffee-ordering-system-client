# data-model.md — 003-cart-checkout-orders（前端视角）

> 仅描述前端关心的接口返回/提交结构与本地状态，遵循 Backend-First，不在前端重算业务规则。

## 实体与字段

### CartItemSnapshot（购物车/结算项）
- `productId: number`
- `name: string`
- `image: string`
- `unitPrice: number`
- `quantity: number`（1–99，超出时需前端校验并回退）
- `subtotal: number`（后端返回；前端用于展示与合计）

### CartSummary
- `totalQty: number`
- `totalAmount: number`

### Coupon（优惠券）
- `id: number`
- `name: string`
- `discountAmount: number`
- `threshold: number`
- `validFrom: string`（ISO）
- `validTo: string`
- `usable: boolean`
- `reason?: string`（不可用原因，需展示）

### CheckoutPreview
- `items: PreviewItem[]`（含可用性与原因）
- `coupons: { usable: Coupon[]; unusable: Coupon[] }`（若后端按单列表返回则前端分组）
- `price: { itemsAmount: number; discountAmount: number; payAmount: number }`
- `pointsEstimate: number`（光阴值预估）
- `generatedAt?: string`（若后端返回时间戳，用于“预览已刷新”提示）

### CheckoutSubmitPayload
- `items: CheckoutItem[]`（来源 cart / buyNow）
- `source: 'cart' | 'buyNow'`
- `pickupType: 'SELF_PICKUP' | 'DELIVERY'`
- `contact: { name: string; phone: string }`
- `addressId?: number` / `addressInput?: string`
- `couponId?: number`
- `remark?: string`

### OrderSummary（列表卡片）
- `orderNo: string`
- `status: OrderStatus`（`PENDING_PAYMENT` | `PAID_WAITING` | `IN_PREPARATION` | `READY_FOR_PICKUP` | `COMPLETED` | `CANCELLED` | `REFUNDING` | `REFUNDED` *注：types 中需补充后两项*）
- `createdAt: string`
- `itemsPreview: string`
- `itemsAmount: number`
- `discountAmount: number`
- `payAmount: number`

### OrderDetail
- `orderNo: string`
- `status: OrderStatus`
- `timeline: { status: OrderStatus; time: string; description?: string }[]`
- `pickupInfo: { type: PickupType; name: string; phone: string; pickupCode?: string; address?: string }`
- `coupon?: { name: string; discountAmount: number }`
- `items: OrderItem[]`
- `priceBreakdown: { itemsAmount: number; discountAmount: number; payAmount: number }`
- `pointsEarned?: number`
- `pointsEstimate?: number`
- `remark?: string`
- `createdAt: string`

### BuyNowSnapshot（本地态）
- `productId: number`
- `name: string`
- `image: string`
- `unitPrice: number`
- `quantity: number`
- 用途：路由 state 或 Pinia 暂存，不污染购物车。

## 状态与关系
- 购物车状态：`CartStore`（远端拉取 + 本地更新）；`summary` 与 `items` 同步。
- 结算状态：`CheckoutStore`（暂存 preview 结果、选中优惠券、idempotency key、来源标记 cart/buyNow）。
- 订单状态：`OrderStore`（列表分页、过滤状态；详情缓存；取消/支付后刷新）。
- 认证状态：`AuthStore`（JWT 注入 axios；401 触发重新登录保持场景数据）。
- 主题状态：`ThemeStore`（晨/暮主题，与本特性 UI 风格保持一致）。

## 校验与前端规则
- 数量输入：1–99，非数字或越界回退上次有效值并提示。
- 优惠券有效性：以预览接口返回为准；当 `usable=false` 或金额低于 `threshold` 时自动移除并提示。
- 支付提交需使用最近一次有效 preview（可通过预览时间/版本号或刷新标志提示用户）。
- 取消订单仅允许 `PENDING_PAYMENT` 状态；其他状态隐藏/禁用取消按钮并显示原因。
