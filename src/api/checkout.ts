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
  UsableCouponsResponse,
} from '@/types/cart'

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
 */
export async function submitCheckout(
  data: CheckoutSubmitRequest
): Promise<CheckoutSubmitResponse> {
  const res = await apiClient.post<CheckoutSubmitResponse>('/member/checkout/submit', data)
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
