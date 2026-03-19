/**
 * 优惠券 API 模块
 *
 * 提供用户优惠券查询接口
 */

import apiClient from './client'
import type { UserCoupon, UserCouponStatus } from '@/types/points'

type RawUserCoupon = Partial<UserCoupon> & {
  status?: UserCouponStatus | string | number | null
}

const USED_STATUS_SET = new Set(['1', 'used', '已使用'])
const EXPIRED_STATUS_SET = new Set(['2', 'expired', '已过期'])

function normalizeDateInput(value: string): string {
  const normalized = value.trim().replace(/\./g, '-')

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return `${normalized}T23:59:59.999`
  }

  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?$/.test(normalized)) {
    return normalized.replace(' ', 'T')
  }

  return normalized
}

function isCouponExpired(expireTime?: string): boolean {
  if (!expireTime) return false

  const timestamp = Date.parse(normalizeDateInput(expireTime))
  return Number.isFinite(timestamp) && timestamp < Date.now()
}

export function normalizeUserCouponStatus(coupon: RawUserCoupon): UserCouponStatus {
  const rawStatus = coupon.status == null ? '' : String(coupon.status).trim().toLowerCase()

  if (coupon.useTime || USED_STATUS_SET.has(rawStatus)) {
    return 'used'
  }

  if (EXPIRED_STATUS_SET.has(rawStatus) || isCouponExpired(coupon.expireTime)) {
    return 'expired'
  }

  return 'unused'
}

function mapUserCoupon(raw: RawUserCoupon): UserCoupon {
  return {
    id: Number(raw.id ?? 0),
    templateId: Number(raw.templateId ?? 0),
    name: raw.name ?? '',
    type: raw.type ?? 'full_reduction',
    thresholdAmount: Number(raw.thresholdAmount ?? 0),
    discountAmount: Number(raw.discountAmount ?? 0),
    discountRate: raw.discountRate ?? null,
    maxDiscountAmount: raw.maxDiscountAmount ?? null,
    status: normalizeUserCouponStatus(raw),
    receiveTime: raw.receiveTime ?? '',
    expireTime: raw.expireTime ?? '',
    useTime: raw.useTime,
    orderId: raw.orderId,
  }
}

/**
 * 查询我的优惠券列表
 * GET /api/coupons/my
 */
export async function getMyCoupons(status?: UserCouponStatus): Promise<UserCoupon[]> {
  const res = await apiClient.get<any>('/coupons/my')
  const raw = res.data
  const list = (Array.isArray(raw) ? raw : (raw?.list ?? [])) as RawUserCoupon[]
  const coupons = list.map(mapUserCoupon)

  if (!status) {
    return coupons
  }

  return coupons.filter(coupon => coupon.status === status)
}
