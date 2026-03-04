import { describe, expect, it } from 'vitest'
import { normalizeCouponUnusableReason } from './coupon'

describe('normalizeCouponUnusableReason', () => {
  it('应将英文金额门槛提示转换为中文', () => {
    const result = normalizeCouponUnusableReason('Order amount must be at least ¥52.00')
    expect(result).toBe('订单金额需满¥52.00才可使用')
  })

  it('空原因时应回退到门槛文案', () => {
    const result = normalizeCouponUnusableReason('', 50)
    expect(result).toBe('订单金额需满¥50.00才可使用')
  })

  it('未知文案应保持原文', () => {
    const raw = 'some custom reason'
    const result = normalizeCouponUnusableReason(raw)
    expect(result).toBe(raw)
  })
})

