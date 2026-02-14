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
  PayOrderRequest,
  PayOrderResponse,
  PickupType,
  UsableCouponsResponse,
} from '@/types/cart'

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
  const res = await apiClient.post<CheckoutPreviewResponse>('/member/checkout/preview', data)
  return res.data as CheckoutPreviewResponse
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
  const res = await apiClient.get<UsableCouponsResponse>('/member/coupons/usable', {
    params: { amount }
  })
  return res.data as UsableCouponsResponse
}

// 兼容旧命名，避免调用方变更遗漏
export const getUsableCoupons = getUsableCouponsForAmount
