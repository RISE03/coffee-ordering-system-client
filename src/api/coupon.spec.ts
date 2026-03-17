import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from './client'
import { getMyCoupons, normalizeUserCouponStatus } from './coupon'

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('coupon api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-12T12:00:00+08:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应将已过期但仍标记为未使用的优惠券归类为已过期', () => {
    const status = normalizeUserCouponStatus({
      status: 'unused',
      expireTime: '2026-03-11 23:59:59',
    })

    expect(status).toBe('expired')
  })

  it('已使用优惠券即使过期也应保留为已使用', () => {
    const status = normalizeUserCouponStatus({
      status: 'unused',
      useTime: '2026-03-10 10:00:00',
      expireTime: '2026-03-11 23:59:59',
    })

    expect(status).toBe('used')
  })

  it('查询指定状态时应基于归一化后的状态在前端过滤', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [
        {
          id: 1,
          templateId: 11,
          name: '过期券',
          type: 'full_reduction',
          thresholdAmount: 52,
          discountAmount: 6,
          status: 'unused',
          receiveTime: '2026-03-04 00:00:00',
          expireTime: '2026-03-11 23:59:59',
        },
        {
          id: 2,
          templateId: 12,
          name: '正常未使用券',
          type: 'full_reduction',
          thresholdAmount: 52,
          discountAmount: 6,
          status: 'unused',
          receiveTime: '2026-03-10 00:00:00',
          expireTime: '2026-03-18 23:59:59',
        },
        {
          id: 3,
          templateId: 13,
          name: '已使用券',
          type: 'full_reduction',
          thresholdAmount: 52,
          discountAmount: 6,
          status: 'unused',
          receiveTime: '2026-03-04 00:00:00',
          expireTime: '2026-03-18 23:59:59',
          useTime: '2026-03-08 12:00:00',
        },
      ],
    })

    const expiredCoupons = await getMyCoupons('expired')
    const unusedCoupons = await getMyCoupons('unused')
    const usedCoupons = await getMyCoupons('used')

    expect(expiredCoupons.map(coupon => coupon.id)).toEqual([1])
    expect(unusedCoupons.map(coupon => coupon.id)).toEqual([2])
    expect(usedCoupons.map(coupon => coupon.id)).toEqual([3])
    expect(apiClient.get).toHaveBeenNthCalledWith(1, '/coupons/my')
    expect(apiClient.get).toHaveBeenNthCalledWith(2, '/coupons/my')
    expect(apiClient.get).toHaveBeenNthCalledWith(3, '/coupons/my')
  })
})
