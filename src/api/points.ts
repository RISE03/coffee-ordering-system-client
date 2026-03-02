/**
 * 积分（光阴值）API 模块
 *
 * 提供积分流水查询、优惠券模板列表、积分兑换优惠券等接口
 */

import apiClient from './client'
import type {
  PointsHistoryParams,
  PointsHistoryResponse,
  PointsHistoryItem,
  CouponTemplate,
  RedeemCouponResponse,
} from '@/types/points'

/**
 * 查询积分流水（分页）
 * GET /api/points/history
 */
export async function getPointsHistory(
  params: PointsHistoryParams = {}
): Promise<PointsHistoryResponse> {
  const { page = 1, size = 20, type } = params
  const res = await apiClient.get<any>('/points/history', {
    params: {
      page,
      size,
      ...(type && { type }),
    },
  })

  const raw = res.data as any
  return {
    list: (raw.list ?? []).map((item: any): PointsHistoryItem => ({
      id: item.id,
      changeAmount: item.changeAmount,
      type: item.type,
      orderId: item.orderId ?? undefined,
      couponId: item.couponId ?? undefined,
      description: item.description,
      createTime: item.createTime,
    })),
    page: {
      total: raw.page?.total ?? 0,
      page: raw.page?.current ?? raw.page?.page ?? page,
      size: raw.page?.size ?? size,
    },
  }
}

/**
 * 获取可兑换优惠券模板列表
 * GET /api/points/coupon-templates
 */
export async function getCouponTemplates(): Promise<CouponTemplate[]> {
  const res = await apiClient.get<any>('/points/coupon-templates')
  const raw = res.data
  return Array.isArray(raw) ? raw : (raw?.list ?? [])
}

/**
 * 积分兑换优惠券
 * POST /api/points/redeem-coupon
 */
export async function redeemCoupon(templateId: number): Promise<RedeemCouponResponse> {
  const res = await apiClient.post<any>('/points/redeem-coupon', { templateId })
  return res.data as RedeemCouponResponse
}
