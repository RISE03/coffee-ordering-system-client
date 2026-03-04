/**
 * 积分（光阴值）与优惠券类型定义
 */

// ============================================================================
// 积分流水类型
// ============================================================================

/**
 * 积分变动类型
 */
export type PointsChangeType =
  | 'ORDER_EARN'       // 下单获得
  | 'ORDER_CANCEL'     // 订单取消扣回
  | 'REDEEM_COUPON'    // 兑换优惠券消费
  | 'ADMIN_ADJUST'     // 管理员调整
  | 'REFUND_RETURN'    // 退款返还

/**
 * 积分流水记录
 */
export interface PointsHistoryItem {
  id: number
  /** 变动金额（正数为获得，负数为消费） */
  changeAmount: number
  /** 变动类型 */
  type: string
  /** 关联订单 ID */
  orderId?: number
  /** 关联优惠券 ID */
  couponId?: number
  /** 描述 */
  description: string
  /** 创建时间 */
  createTime: string
}

// ============================================================================
// 优惠券模板类型
// ============================================================================

/**
 * 优惠券模板（积分商城展示用）
 */
export interface CouponTemplate {
  id: number
  /** 优惠券名称 */
  name: string
  /** 优惠类型：full_reduction=满减，discount=折扣 */
  type: string
  /** 满减门槛金额 */
  thresholdAmount: number
  /** 满减优惠金额（仅 full_reduction 类型有效） */
  discountAmount: number
  /** 折扣率，如 0.85 表示 8.5 折（仅 discount 类型有效） */
  discountRate?: number | null
  /** 折扣最高优惠上限（仅 discount 类型有效） */
  maxDiscountAmount?: number | null
  /** 所需积分 */
  requiredPoints: number
  /** 领取后有效天数 */
  validDays: number
  /** 状态 */
  status: string
}

// ============================================================================
// 用户优惠券类型
// ============================================================================

/**
 * 用户优惠券状态
 */
export type UserCouponStatus = 'unused' | 'used' | 'expired'

/**
 * 用户持有的优惠券
 */
export interface UserCoupon {
  id: number
  /** 模板 ID */
  templateId: number
  /** 优惠券名称 */
  name: string
  /** 优惠类型：full_reduction=满减，discount=折扣 */
  type: string
  /** 满减门槛 */
  thresholdAmount: number
  /** 满减优惠金额（仅 full_reduction 类型有效） */
  discountAmount: number
  /** 折扣率，如 0.85 表示 8.5 折（仅 discount 类型有效） */
  discountRate?: number | null
  /** 折扣最高优惠上限（仅 discount 类型有效） */
  maxDiscountAmount?: number | null
  /** 状态 */
  status: UserCouponStatus
  /** 领取时间 */
  receiveTime: string
  /** 过期时间 */
  expireTime: string
  /** 使用时间 */
  useTime?: string
  /** 关联订单 ID */
  orderId?: number
}

// ============================================================================
// 兑换响应
// ============================================================================

/**
 * 积分兑换优惠券响应
 */
export interface RedeemCouponResponse {
  /** 新优惠券信息 */
  coupon: UserCoupon
  /** 兑换后剩余积分 */
  remainingPoints: number
}

// ============================================================================
// 分页类型
// ============================================================================

/**
 * 积分流水分页请求参数
 */
export interface PointsHistoryParams {
  page?: number
  size?: number
  type?: PointsChangeType
}

/**
 * 积分流水分页响应
 */
export interface PointsHistoryResponse {
  list: PointsHistoryItem[]
  page: {
    total: number
    page: number
    size: number
  }
}
