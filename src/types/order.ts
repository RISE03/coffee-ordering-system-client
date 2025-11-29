/**
 * Order related type definitions
 * Aligned with specs/003-cart-checkout-orders/contracts/frontend-apis.yaml
 */

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID_WAITING'
  | 'IN_PREPARATION'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDING'
  | 'REFUNDED'

/**
 * 订单状态映射 - 品牌文案
 * label: 状态标签（简短）
 * color: 状态颜色
 */
export const ORDER_STATUS_MAP: Record<
  OrderStatus,
  { label: string; color: 'default' | 'info' | 'success' | 'warning' | 'error' }
> = {
  PENDING_PAYMENT: { label: '待支付', color: 'warning' },
  PAID_WAITING: { label: '已支付', color: 'info' },
  IN_PREPARATION: { label: '制作中', color: 'info' },
  READY_FOR_PICKUP: { label: '待取餐', color: 'success' },
  COMPLETED: { label: '已完成', color: 'default' },
  CANCELLED: { label: '已取消', color: 'default' },
  REFUNDING: { label: '退款中', color: 'warning' },
  REFUNDED: { label: '已退款', color: 'default' }
}

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_MAP[status]?.label ?? status
}

export interface OrderListItem {
  orderNo: string
  status: OrderStatus
  createdAt: string
  itemsPreview: string
  itemsAmount: number
  discountAmount: number
  payAmount: number
}

export interface OrderListResponse {
  list: OrderListItem[]
  page: {
    total: number
    page: number
    size: number
  }
}

export interface OrderTimelineEvent {
  status: OrderStatus
  time: string
  description?: string
}

export interface OrderItem {
  name: string
  unitPrice: number
  quantity: number
  subtotal: number
  image?: string
}

export interface PickupInfo {
  type: 'SELF_PICKUP' | 'DELIVERY'
  name: string
  phone: string
  pickupCode?: string
  address?: string
}

export interface OrderCouponInfo {
  name: string
  discountAmount: number
}

export interface PriceBreakdown {
  itemsAmount: number
  discountAmount: number
  payAmount: number
}

export interface OrderDetailResponse {
  orderNo: string
  status: OrderStatus
  timeline: OrderTimelineEvent[]
  pickupInfo: PickupInfo
  coupon?: OrderCouponInfo
  items: OrderItem[]
  priceBreakdown: PriceBreakdown
  pointsEarned?: number
  pointsEstimate?: number
  remark?: string
  createdAt: string
}

export interface CancelOrderResponse {
  status: OrderStatus
}