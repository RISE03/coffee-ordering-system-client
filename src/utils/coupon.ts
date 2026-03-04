/**
 * 优惠券文案工具
 *
 * 将后端可能返回的英文不可用原因，统一转换为中文提示。
 */

/**
 * 格式化金额（保留 2 位小数）
 */
function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return '0.00'
  return value.toFixed(2)
}

/**
 * 归一化优惠券不可用原因
 */
export function normalizeCouponUnusableReason(
  rawReason?: string | null,
  thresholdAmount?: number
): string | undefined {
  const reason = (rawReason ?? '').trim()

  if (!reason) {
    if (typeof thresholdAmount === 'number' && thresholdAmount > 0) {
      return `订单金额需满¥${formatAmount(thresholdAmount)}才可使用`
    }
    return undefined
  }

  // Order amount must be at least ¥52.00
  const thresholdMatch = reason.match(
    /order amount must be at least\s*¥?\s*([0-9]+(?:\.[0-9]+)?)/i
  )
  if (thresholdMatch?.[1]) {
    const amount = Number(thresholdMatch[1])
    const normalized = Number.isFinite(amount) ? amount : thresholdAmount ?? 0
    return `订单金额需满¥${formatAmount(normalized)}才可使用`
  }

  if (/coupon.*expired|expired/i.test(reason)) {
    return '优惠券已过期'
  }

  if (/already used|has been used/i.test(reason)) {
    return '优惠券已使用'
  }

  if (/not within.*valid|outside.*valid|valid period/i.test(reason)) {
    return '不在优惠券有效期内'
  }

  if (/not eligible|not applicable|cannot be used|unavailable/i.test(reason)) {
    return '当前订单不满足使用条件'
  }

  return reason
}

