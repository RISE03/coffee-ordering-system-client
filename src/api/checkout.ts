/**
 * Checkout API
 *
 * API wrapper for checkout operations with idempotency support
 */

import apiClient from './client'
import type {
  CheckoutPreviewRequest,
  CheckoutPreviewResponse,
  CheckoutSubmitRequest,
  CheckoutSubmitResponse,
  CouponInfo,
  PayOrderRequest,
  PayOrderResponse,
  PickupType,
  UsableCouponsResponse,
} from '@/types/cart'
import { normalizeCouponUnusableReason } from '@/utils/coupon'

// ---- 后端原始优惠券字段 → 前端 CouponInfo 映射 ----

/** 后端返回的优惠券原始结构 */
interface RawCoupon {
  couponId: number
  name: string
  type: string
  thresholdAmount: number
  discountAmount: number
  discountRate?: number | null
  maxDiscountAmount?: number | null
  expireTime: string
  usable: boolean
  unusableReason?: string | null
}

/** 将后端原始优惠券映射为前端 CouponInfo */
function mapCoupon(raw: RawCoupon): CouponInfo {
  return {
    id: raw.couponId,
    name: raw.name,
    type: raw.type,
    discountAmount: raw.discountAmount,
    discountRate: raw.discountRate ?? null,
    maxDiscountAmount: raw.maxDiscountAmount ?? null,
    threshold: raw.thresholdAmount,
    validFrom: raw.expireTime,
    validTo: raw.expireTime,
    usable: raw.usable,
    reason: normalizeCouponUnusableReason(raw.unusableReason, raw.thresholdAmount),
  }
}

/** 将后端优惠券列表对映射为前端 { usable, unusable } 格式 */
function mapCouponsResponse(raw: {
  usableCoupons?: RawCoupon[]
  unusableCoupons?: RawCoupon[]
}): UsableCouponsResponse {
  return {
    usable: (raw.usableCoupons ?? []).map(mapCoupon),
    unusable: (raw.unusableCoupons ?? []).map(mapCoupon),
  }
}

/** 前端内部提交参数（使用语义化字符串） */
export interface InternalSubmitParams {
  items: CheckoutSubmitRequest['items']
  source: CheckoutSubmitRequest['source']
  pickupType: PickupType
  pickupName: string
  pickupPhone: string
  deliveryAddressId?: number
  addressInput?: string
  couponId?: number
  remark?: string
}

/**
 * Generate a unique idempotency key
 * Format: timestamp-random
 */
export function generateIdempotencyKey(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10)
  return `${timestamp}-${random}`
}

/**
 * Preview checkout (calculate prices, check availability, get coupons)
 */
export async function previewCheckout(
  data: CheckoutPreviewRequest
): Promise<CheckoutPreviewResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.post<any>('/member/checkout/preview', data)
  const raw = res.data

  // 后端将 usableCoupons / unusableCoupons 放在顶层，前端需要映射为 coupons: { usable, unusable }
  const mapped: CheckoutPreviewResponse = {
    items: raw.items,
    coupons: mapCouponsResponse(raw),
    price: raw.price,
    pointsEstimate: raw.pointsEstimate,
    generatedAt: raw.generatedAt,
  }
  return mapped
}

/**
 * Submit checkout (create order)
 * 接收前端语义化参数，映射为后端期望的格式后发送
 */
export async function submitCheckout(
  data: InternalSubmitParams
): Promise<CheckoutSubmitResponse> {
  const pickupTypeMap: Record<PickupType, number> = {
    SELF_PICKUP: 0,
    DELIVERY: 1
  }

  const payload: CheckoutSubmitRequest = {
    items: data.items,
    source: data.source,
    pickupType: pickupTypeMap[data.pickupType],
    pickupName: data.pickupName,
    pickupPhone: data.pickupPhone,
    deliveryAddressId: data.deliveryAddressId,
    addressInput: data.addressInput,
    couponId: data.couponId,
    remark: data.remark
  }

  const res = await apiClient.post<CheckoutSubmitResponse>('/member/checkout/submit', payload)
  return res.data as CheckoutSubmitResponse
}

/**
 * Pay order (simulated payment)
 * Includes idempotency key to prevent duplicate payments
 */
export async function payOrder(
  data: PayOrderRequest,
  idempotencyKey: string
): Promise<PayOrderResponse> {
  const res = await apiClient.post<PayOrderResponse>('/member/checkout/pay', data, {
    headers: {
      'X-Idempotency-Key': idempotencyKey,
    },
  })
  return res.data as PayOrderResponse
}

/**
 * Get usable coupons for a given order amount
 */
export async function getUsableCouponsForAmount(amount: number): Promise<UsableCouponsResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await apiClient.get<any>('/member/coupons/usable', {
    params: { amount }
  })
  // 后端返回 { usableCoupons, unusableCoupons }，映射为前端 { usable, unusable }
  return mapCouponsResponse(res.data)
}

// 兼容旧命名，避免调用方变更遗漏
export const getUsableCoupons = getUsableCouponsForAmount
