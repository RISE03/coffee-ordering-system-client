/**
 * 下单可用性守卫
 *
 * 统一判断当前是否允许「下单/支付」：
 * - 允许加入购物车
 * - 打烊时禁止提交订单和支付
 */

import { getBusinessHours, isBusinessOpen, type BusinessHours } from '@/api/config'

const CACHE_TTL_MS = 60 * 1000
const DEFAULT_BUSINESS_HOURS: BusinessHours = { start: '08:00', end: '22:00' }

let cachedHours: BusinessHours = { ...DEFAULT_BUSINESS_HOURS }
let cachedAt = 0

export interface OrderAvailabilityStatus {
  isOpen: boolean
  businessHours: BusinessHours
}

/**
 * 打烊提示文案
 */
export function formatStoreClosedMessage(businessHours: BusinessHours): string {
  return `当前已打烊，可先加入购物车，预计 ${businessHours.start} 恢复下单`
}

/**
 * 获取下单可用性（带短缓存，避免频繁请求）
 */
export async function getOrderAvailabilityStatus(force = false): Promise<OrderAvailabilityStatus> {
  const now = Date.now()

  if (force || cachedAt === 0 || now - cachedAt >= CACHE_TTL_MS) {
    cachedHours = await getBusinessHours()
    cachedAt = now
  }

  return {
    isOpen: isBusinessOpen(cachedHours, new Date()),
    businessHours: cachedHours
  }
}

/**
 * 断言当前允许下单/支付
 * 打烊时抛错，由上层统一展示文案
 */
export async function ensureCanOrderNow(force = false): Promise<void> {
  const status = await getOrderAvailabilityStatus(force)
  if (!status.isOpen) {
    throw new Error(formatStoreClosedMessage(status.businessHours))
  }
}

