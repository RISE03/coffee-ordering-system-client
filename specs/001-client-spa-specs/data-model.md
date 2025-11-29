# Data Model: Frontend Client SPA

**Branch**: `001-client-spa-specs` | **Date**: 2025-11-27

本文档定义 frontend-client 前端应用的 TypeScript 数据模型，与后端 API 响应结构对齐。

---

## 1. 通用类型

### 1.1 API 响应包装

```typescript
// types/api.ts

/** 统一 API 响应结构 */
interface ApiResponse<T> {
  code: number;       // 0 = 成功，非 0 = 失败
  message: string;    // 提示信息
  data: T;            // 业务数据
}

/** 分页响应结构 */
interface PaginatedData<T> {
  total: number;      // 总记录数
  page: number;       // 当前页码（从 1 开始）
  size: number;       // 每页条数
  list: T[];          // 数据列表
}

/** 分页请求参数 */
interface PaginationParams {
  page?: number;      // 页码，默认 1
  size?: number;      // 每页条数，默认 10
}
```

---

## 2. 用户与认证

### 2.1 用户实体

```typescript
// types/user.ts

/** 用户角色 */
type UserRole = 'member' | 'staff' | 'admin';

/** 会员等级 */
type MemberLevel = 1 | 2 | 3 | 4;

/** 会员等级名称映射 */
const LEVEL_NAMES: Record<MemberLevel, string> = {
  1: '晨曦',
  2: '烈阳',
  3: '晚霞',
  4: '繁星',
};

/** 用户信息 */
interface User {
  id: number;
  username: string;
  nickname: string;
  mobile?: string;
  avatar?: string;
  role: UserRole;
  level: MemberLevel;
  levelName: string;    // 后端返回的等级名称
}

/** 登录请求 */
interface LoginRequest {
  username: string;
  password: string;
}

/** 登录响应 */
interface LoginResponse {
  token: string;
  user: User;
}

/** 注册请求 */
interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
  mobile?: string;
}

/** 注册响应 */
interface RegisterResponse {
  userId: number;
  username: string;
}
```

---

## 3. 商品与分类

### 3.1 商品分类

```typescript
// types/product.ts

/** 商品分类 */
interface Category {
  id: number;
  name: string;
}
```

### 3.2 商品实体

```typescript
/** 商品列表项 */
interface ProductListItem {
  id: number;
  name: string;
  price: number;          // 单位：元，两位小数
  imageUrl: string;
  categoryId: number;
}

/** 商品详情 */
interface Product extends ProductListItem {
  description: string;
  status: number;         // 1 = 上架, 0 = 下架
}

/** 商品列表查询参数 */
interface ProductQueryParams extends PaginationParams {
  categoryId?: number;
  keyword?: string;
}
```

### 3.3 时间段推荐

```typescript
/** 时间段编码 */
type TimeSlotCode = 'dawn' | 'midday' | 'dusk';

/** 时间段推荐商品 */
interface RecommendedProduct {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  tag?: string;           // 推荐标签，如"醒神推荐"
}

/** 时间段推荐响应 */
interface TimeSlotRecommendation {
  timeSlotCode: TimeSlotCode;
  timeSlotName: string;   // 如"朝·醒"
  products: RecommendedProduct[];
}
```

---

## 4. 购物车

```typescript
// types/cart.ts

/** 购物车条目 */
interface CartItem {
  id: number;             // 购物车条目 ID
  productId: number;
  productName: string;
  productImageUrl: string;
  price: number;
  quantity: number;
  subtotal: number;       // price * quantity
}

/** 添加购物车请求 */
interface AddToCartRequest {
  productId: number;
  quantity: number;
}

/** 更新购物车数量请求 */
interface UpdateCartItemRequest {
  quantity: number;
}

/** 本地购物车条目（游客模式） */
interface LocalCartItem {
  productId: number;
  productName: string;
  productImageUrl: string;
  price: number;
  quantity: number;
}
```

---

## 5. 订单

### 5.1 订单状态

```typescript
// types/order.ts

/** 订单状态枚举 */
enum OrderStatus {
  PENDING_PAYMENT = 0,      // 待支付
  PAID_PENDING_ACCEPT = 1,  // 已支付待接单
  PREPARING = 2,            // 制作中
  READY_FOR_PICKUP = 3,     // 待取餐
  COMPLETED = 4,            // 已完成
  CANCELLED = 5,            // 已取消
  REFUND_PROCESSING = 6,    // 退款处理中
  REFUNDED = 7,             // 已退款
  REFUND_REJECTED = 8,      // 退款拒绝
}

/** 订单状态名称映射 */
const ORDER_STATUS_NAMES: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: '待支付',
  [OrderStatus.PAID_PENDING_ACCEPT]: '已支付待接单',
  [OrderStatus.PREPARING]: '制作中',
  [OrderStatus.READY_FOR_PICKUP]: '待取餐',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消',
  [OrderStatus.REFUND_PROCESSING]: '退款处理中',
  [OrderStatus.REFUNDED]: '已退款',
  [OrderStatus.REFUND_REJECTED]: '退款拒绝',
};

/** 取餐方式 */
enum PickupType {
  SELF_PICKUP = 0,    // 到店自取
  DELIVERY = 1,       // 外卖配送
}
```

### 5.2 订单实体

```typescript
/** 订单列表项 */
interface OrderListItem {
  orderId: number;
  orderNo: string;
  status: OrderStatus;
  statusName: string;
  orderTime: string;      // yyyy-MM-dd HH:mm:ss
  payableAmount: number;
}

/** 订单商品明细 */
interface OrderItem {
  productId: number;
  productName: string;
  productImageUrl: string;
  price: number;
  quantity: number;
  subtotal: number;
}

/** 订单金额信息 */
interface OrderAmountInfo {
  totalAmount: number;      // 原价总额
  discountAmount: number;   // 优惠金额
  payableAmount: number;    // 应付金额
  paidAmount: number;       // 实付金额
}

/** 订单优惠券信息 */
interface OrderCouponInfo {
  couponId: number;
  couponName: string;
}

/** 订单积分信息 */
interface OrderPointsInfo {
  gainedPoints: number;     // 获得的积分
}

/** 收货地址 */
interface OrderAddress {
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
}

/** 订单详情 */
interface OrderDetail {
  orderId: number;
  orderNo: string;
  status: OrderStatus;
  statusName: string;
  orderTime: string;
  payTime?: string;
  pickupType: PickupType;
  pickupTypeName: string;
  pickupName: string;
  pickupPhone: string;
  pickupCode?: string;
  address?: OrderAddress;
  items: OrderItem[];
  amountInfo: OrderAmountInfo;
  coupon?: OrderCouponInfo;
  pointsInfo?: OrderPointsInfo;
}

/** 创建订单请求 */
interface CreateOrderRequest {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
  pickupType: PickupType;
  pickupName: string;
  pickupPhone: string;
  addressId?: number;       // 外卖配送时必填
  couponId?: number;
  remark?: string;
}

/** 创建订单响应 */
interface CreateOrderResponse {
  orderId: number;
  orderNo: string;
  payableAmount: number;
}

/** 订单列表查询参数 */
interface OrderQueryParams extends PaginationParams {
  status?: OrderStatus;
}
```

---

## 6. 积分（光阴值）

```typescript
// types/points.ts

/** 积分账户信息 */
interface PointsAccount {
  balance: number;        // 当前余额
  totalEarned: number;    // 累计获得
  totalSpent: number;     // 累计消费
}

/** 积分变动类型 */
type PointsChangeType = 'order_gain' | 'coupon_redeem' | 'refund_deduct' | 'admin_adjust';

/** 积分流水记录 */
interface PointsHistoryItem {
  id: number;
  changeAmount: number;   // 变动数量（正数为获得，负数为消费）
  type: PointsChangeType;
  typeName: string;
  orderId?: number;
  couponId?: number;
  description: string;
  createdTime: string;
}

/** 积分流水查询参数 */
interface PointsHistoryParams extends PaginationParams {
  type?: PointsChangeType;
}
```

---

## 7. 优惠券

```typescript
// types/coupon.ts

/** 优惠券类型 */
type CouponType = 'full_reduction';   // 满减券

/** 优惠券状态 */
type CouponStatus = 'unused' | 'used' | 'expired';

/** 优惠券 */
interface Coupon {
  id: number;
  templateId: number;
  name: string;
  type: CouponType;
  thresholdAmount: number;    // 满减门槛
  discountAmount: number;     // 减免金额
  status: CouponStatus;
  statusName: string;
  receiveTime: string;
  expireTime: string;
  description?: string;
}

/** 优惠券模板（积分兑换用） */
interface CouponTemplate {
  id: number;
  name: string;
  type: CouponType;
  thresholdAmount: number;
  discountAmount: number;
  requiredPoints: number;     // 所需积分
  validDays: number;          // 有效天数
  status: number;
}

/** 优惠券查询参数 */
interface CouponQueryParams {
  status?: CouponStatus;
}
```

---

## 8. 收货地址

```typescript
// types/address.ts

/** 收货地址 */
interface Address {
  id: number;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  isDefault: number;        // 1 = 默认, 0 = 非默认
}

/** 创建/更新地址请求 */
interface AddressRequest {
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  isDefault?: number;
}
```

---

## 9. 主题

```typescript
// types/theme.ts

/** 主题模式 */
type ThemeMode = 'auto' | 'dawn' | 'dusk';

/** 主题状态 */
interface ThemeState {
  mode: ThemeMode;
  currentTheme: 'dawn' | 'dusk';  // 实际应用的主题
}
```

---

## 10. 实体关系图

```
┌─────────────┐     ┌─────────────┐
│    User     │     │  Category   │
│  (会员)     │     │  (分类)     │
└─────────────┘     └──────┬──────┘
       │                   │
       │                   │ 1:N
       │           ┌───────┴───────┐
       │           │    Product    │
       │           │   (商品)      │
       │           └───────┬───────┘
       │                   │
       │ 1:N               │
┌──────┴──────┐    ┌───────┴───────┐
│    Cart     │    │ TimeSlotRec   │
│  (购物车)   │    │ (时间段推荐)  │
└──────┬──────┘    └───────────────┘
       │
       │ 1:N
┌──────┴──────┐
│   Order     │
│  (订单)     │
├─────────────┤
│ - items     │
│ - coupon    │
│ - points    │
└──────┬──────┘
       │
       │ 1:N
┌──────┴──────┐     ┌─────────────┐
│PointsHist   │     │   Coupon    │
│(积分流水)   │     │  (优惠券)   │
└─────────────┘     └─────────────┘
```

---

## 11. 验证规则

### 11.1 用户注册

| 字段 | 规则 |
|------|------|
| username | 必填，唯一 |
| password | 必填，最小长度 6 |
| confirmPassword | 必填，与 password 一致 |
| mobile | 可选，手机号格式 |

### 11.2 创建订单

| 字段 | 规则 |
|------|------|
| items | 必填，至少 1 项 |
| pickupType | 必填，0 或 1 |
| pickupName | 必填 |
| pickupPhone | 必填，手机号格式 |
| addressId | pickupType=1 时必填 |

### 11.3 收货地址

| 字段 | 规则 |
|------|------|
| receiverName | 必填 |
| receiverPhone | 必填，手机号格式 |
| province/city/district | 必填 |
| detailAddress | 必填 |
