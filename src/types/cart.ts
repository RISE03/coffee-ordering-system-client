/**
 * Cart & Checkout Type Definitions
 *
 * 对齐 003-cart-checkout-orders 合同接口，覆盖购物车与结算领域。
 */

import type { OrderStatus } from './order'

// ============================================================================
// Cart Types
// ============================================================================

/**
 * Cart item from API
 */
export interface CartItem {
  /** Product ID */
  productId: number
  /** Product name */
  name: string
  /** Product image URL */
  image: string
  /** Unit price (snapshot from product) */
  unitPrice: number
  /** Quantity in cart (1-99) */
  quantity: number
  /** Subtotal (unitPrice * quantity) */
  subtotal: number
}

/**
 * Cart summary
 */
export interface CartSummary {
  /** Total quantity of all items */
  totalQty: number
  /** Total amount */
  totalAmount: number
}

/**
 * Full cart response from API
 */
export interface CartResponse {
  /** Cart items */
  items: CartItem[]
  /** Cart summary */
  summary: CartSummary
}

/**
 * Add to cart request
 */
export interface AddToCartRequest {
  /** Product ID */
  productId: number
  /** Quantity to add (1-99) */
  quantity: number
}

/**
 * Update cart item quantity request
 */
export interface UpdateCartItemRequest {
  /** New quantity (1-99) */
  quantity: number
}

// ============================================================================
// Checkout Types
// ============================================================================

/**
 * Checkout source type
 */
export type CheckoutSource = 'cart' | 'buyNow'

/**
 * Pickup type
 */
export type PickupType = 'SELF_PICKUP' | 'DELIVERY'

/**
 * Checkout item for preview/submit
 */
export interface CheckoutItem {
  /** Product ID */
  productId: number
  /** Quantity */
  quantity: number
}

/**
 * Contact information
 */
export interface ContactInfo {
  /** Contact name */
  name: string
  /** Contact phone */
  phone: string
}

/**
 * Checkout preview request
 */
export interface CheckoutPreviewRequest {
  /** Items to checkout */
  items: CheckoutItem[]
  /** Source: cart or buyNow */
  source: CheckoutSource
  /** Optional coupon ID */
  couponId?: number
}

/**
 * Preview item（含可用性信息）
 */
export interface CheckoutPreviewItem {
  productId: number
  name: string
  image: string
  unitPrice: number
  quantity: number
  subtotal: number
  available: boolean
  reason?: string
}

/**
 * 价格拆分
 */
export interface PriceDetail {
  itemsAmount: number
  discountAmount: number
  payAmount: number
}

/**
 * 结算预览响应
 */
export interface CheckoutPreviewResponse {
  items: CheckoutPreviewItem[]
  coupons: {
    usable: CouponInfo[]
    unusable: CouponInfo[]
  }
  price: PriceDetail
  pointsEstimate: number
  /** 后端生成的预览时间戳/标识 */
  generatedAt?: string
}

/**
 * Checkout submit request
 */
export interface CheckoutSubmitRequest {
  /** Items to checkout */
  items: CheckoutItem[]
  /** Source: cart or buyNow */
  source: CheckoutSource
  /** Pickup type */
  pickupType: PickupType
  /** Contact information */
  contact: ContactInfo
  /** Address ID for delivery (optional) */
  addressId?: number
  /** Address input for delivery (optional) */
  addressInput?: string
  /** Coupon ID (optional) */
  couponId?: number
  /** Remark for barista (optional) */
  remark?: string
}

/**
 * Checkout submit response
 */
export interface CheckoutSubmitResponse {
  /** Order number */
  orderNo: string
  /** Order status */
  status: OrderStatus
  /** Payable amount */
  payAmount: number
  /** Pickup code (for self-pickup) */
  pickupCode?: string
  /** Estimated points to earn */
  pointsEstimate: number
}

/**
 * Pay order request
 */
export interface PayOrderRequest {
  /** Order number */
  orderNo: string
}

/**
 * Pay order response
 */
export interface PayOrderResponse {
  /** Order number */
  orderNo: string
  /** New order status */
  status: OrderStatus
  /** Pickup code (for self-pickup) */
  pickupCode?: string
  /** Estimated points to earn */
  pointsEstimate: number
}

// ============================================================================
// Coupon Types
// ============================================================================

/**
 * Coupon information
 */
export interface CouponInfo {
  /** Coupon ID */
  id: number
  /** Coupon name */
  name: string
  /** Discount amount */
  discountAmount: number
  /** Minimum order amount threshold */
  threshold: number
  /** Validity start date */
  validFrom: string
  /** Validity end date */
  validTo: string
  /** Whether coupon is usable for current order */
  usable: boolean
  /** Reason if not usable */
  reason?: string
}

/**
 * Usable coupons response
 */
export interface UsableCouponsResponse {
  /** Usable coupons */
  usable: CouponInfo[]
  /** Unusable coupons */
  unusable: CouponInfo[]
}

// ============================================================================
// Buy Now State
// ============================================================================

/**
 * Buy now state passed via router
 */
export interface BuyNowState {
  /** Product ID */
  productId: number
  /** Product name */
  name: string
  /** Product image */
  image: string
  /** Unit price */
  unitPrice: number
  /** Quantity */
  quantity: number
}
