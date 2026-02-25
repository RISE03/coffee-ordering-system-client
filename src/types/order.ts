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
  completeTime?: string
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
  refundRejectReason?: string
}

export interface CancelOrderResponse {
  status: OrderStatus
}

/**
 * 退款申请请求
 */
export interface RefundApplyRequest {
  reason: string
  description?: string
  images?: string[]
}

/**
 * 退款申请响应
 */
export interface RefundApplyResponse {
  status: OrderStatus
  message?: string
}

/**
 * 退款原因选项配置
 */
export interface RefundReasonOption {
  value: string
  label: string
  applicableStatus: OrderStatus[]
  requiresImages: boolean
  requiresDescription: boolean
}

/**
 * 退款原因选项列表
 */
export const REFUND_REASON_OPTIONS: RefundReasonOption[] = [
  // PAID_WAITING 状态的退款原因
  {
    value: 'WRONG_ORDER',
    label: '下错单了',
    applicableStatus: ['PAID_WAITING'],
    requiresImages: false,
    requiresDescription: false
  },
  {
    value: 'CANNOT_PICKUP',
    label: '临时有事无法取餐',
    applicableStatus: ['PAID_WAITING'],
    requiresImages: false,
    requiresDescription: false
  },
  {
    value: 'CHANGED_MIND',
    label: '不想要了',
    applicableStatus: ['PAID_WAITING'],
    requiresImages: false,
    requiresDescription: false
  },
  {
    value: 'OTHER',
    label: '其他原因',
    applicableStatus: ['PAID_WAITING'],
    requiresImages: false,
    requiresDescription: true
  },

  // COMPLETED 状态的售后原因
  {
    value: 'QUALITY_ISSUE',
    label: '商品变质/有异物',
    applicableStatus: ['COMPLETED'],
    requiresImages: true,
    requiresDescription: true
  },
  {
    value: 'TASTE_ISSUE',
    label: '口味不对',
    applicableStatus: ['COMPLETED'],
    requiresImages: true,
    requiresDescription: true
  },
  {
    value: 'DESCRIPTION_MISMATCH',
    label: '与描述不符',
    applicableStatus: ['COMPLETED'],
    requiresImages: true,
    requiresDescription: true
  },
  {
    value: 'MISSING_ITEMS',
    label: '少货',
    applicableStatus: ['COMPLETED'],
    requiresImages: true,
    requiresDescription: true
  },
]

/**
 * 根据订单状态获取适用的退款原因选项
 */
export function getRefundReasonsByStatus(status: OrderStatus): RefundReasonOption[] {
  return REFUND_REASON_OPTIONS.filter(opt => opt.applicableStatus.includes(status))
}