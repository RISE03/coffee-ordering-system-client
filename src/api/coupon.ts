/**
 * 优惠券 API 模块
 *
 * 提供用户优惠券查询接口
 */

import apiClient from './client'
import type { UserCoupon, UserCouponStatus } from '@/types/points'

/**
 * 查询我的优惠券列表
 * GET /api/coupons/my
 */
export async function getMyCoupons(status?: UserCouponStatus): Promise<UserCoupon[]> {
  const res = await apiClient.get<any>('/coupons/my', {
    params: {
      ...(status && { status }),
    },
  })
  const raw = res.data
  return Array.isArray(raw) ? raw : (raw?.list ?? [])
}
