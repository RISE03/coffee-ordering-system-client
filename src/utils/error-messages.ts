/**
 * Error Messages Mapping
 *
 * Maps backend error codes to user-friendly messages
 * with Dawn & Dusk brand tone (warm, calm, time & companionship theme)
 *
 * 品牌语气：温暖、从容、时光与陪伴主题
 * 术语统一：积分统一称为"光阴值"
 */

/**
 * Business error codes from backend
 */
export const BusinessErrorCode = {
  // Cart errors
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  CART_ITEM_INVALID: 'CART_ITEM_INVALID',
  CART_EMPTY: 'CART_EMPTY',
  QUANTITY_INVALID: 'QUANTITY_INVALID',

  // Checkout errors
  PRICE_CHANGED: 'PRICE_CHANGED',
  STOCK_UNAVAILABLE: 'STOCK_UNAVAILABLE',
  STOCK_DEDUCT_FAILED: 'STOCK_DEDUCT_FAILED',
  COUPON_INVALID: 'COUPON_INVALID',
  COUPON_EXPIRED: 'COUPON_EXPIRED',
  COUPON_USED: 'COUPON_USED',
  COUPON_THRESHOLD_NOT_MET: 'COUPON_THRESHOLD_NOT_MET',
  PREVIEW_EXPIRED: 'PREVIEW_EXPIRED',
  STORE_CLOSED: 'STORE_CLOSED',

  // Order errors
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  ORDER_CANNOT_CANCEL: 'ORDER_CANNOT_CANCEL',
  ORDER_ALREADY_PAID: 'ORDER_ALREADY_PAID',
  ORDER_EXPIRED: 'ORDER_EXPIRED',

  // Refund errors
  REFUND_NOT_ALLOWED: 'REFUND_NOT_ALLOWED',
  REFUND_TIMEOUT: 'REFUND_TIMEOUT',
  REFUND_ALREADY_APPLIED: 'REFUND_ALREADY_APPLIED',
  REFUND_IMAGE_REQUIRED: 'REFUND_IMAGE_REQUIRED',
  REFUND_DESCRIPTION_REQUIRED: 'REFUND_DESCRIPTION_REQUIRED',

  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  IDEMPOTENT_REPLAY: 'IDEMPOTENT_REPLAY',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',

  // General errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
} as const

export type BusinessErrorCodeType = (typeof BusinessErrorCode)[keyof typeof BusinessErrorCode]

/**
 * Error messages with Dawn & Dusk brand tone
 * 品牌文案：温暖、从容、时光主题
 */
export const ErrorMessages: Record<string, string> = {
  // Cart errors - 购物车相关
  [BusinessErrorCode.PRODUCT_NOT_FOUND]: '这款饮品暂时不在菜单上，换一杯试试？',
  [BusinessErrorCode.CART_ITEM_INVALID]: '购物车里有些小变化，请刷新后重新确认',
  [BusinessErrorCode.CART_EMPTY]: '购物车还在打盹，先去挑选心仪的饮品吧',
  [BusinessErrorCode.QUANTITY_INVALID]: '数量需在 1-99 之间，请调整后重试',

  // Checkout errors - 结算相关
  [BusinessErrorCode.PRICE_CHANGED]: '价格刚刚有了小变动，请确认后再下单',
  [BusinessErrorCode.STOCK_UNAVAILABLE]: '抱歉，部分商品库存不足，请调整数量后重试',
  [BusinessErrorCode.STOCK_DEDUCT_FAILED]: '手慢了一步，商品库存刚刚被抢光了，请调整订单后重试',
  [BusinessErrorCode.COUPON_INVALID]: '这张优惠券暂时无法使用，换一张试试？',
  [BusinessErrorCode.COUPON_EXPIRED]: '这张优惠券已过期，下次记得早点用哦',
  [BusinessErrorCode.COUPON_USED]: '这张优惠券已经用过了，看看其他优惠吧',
  [BusinessErrorCode.COUPON_THRESHOLD_NOT_MET]: '订单金额未达到优惠券使用门槛，再加点好物？',
  [BusinessErrorCode.PREVIEW_EXPIRED]: '预览已过期，请刷新后重新确认',
  [BusinessErrorCode.STORE_CLOSED]: '当前已打烊，可先加入购物车，营业后再下单',

  // Order errors - 订单相关
  [BusinessErrorCode.ORDER_NOT_FOUND]: '找不到这个订单，请检查订单号',
  [BusinessErrorCode.ORDER_CANNOT_CANCEL]: '订单状态已变更，暂时无法取消',
  [BusinessErrorCode.ORDER_ALREADY_PAID]: '订单已支付，无需重复操作',
  [BusinessErrorCode.ORDER_EXPIRED]: '订单已超时关闭，欢迎重新下单',

  // Refund errors - 退款相关
  [BusinessErrorCode.REFUND_NOT_ALLOWED]: '当前订单状态不允许申请退款',
  [BusinessErrorCode.REFUND_TIMEOUT]: '售后申请已超时，完成订单后2小时内可申请',
  [BusinessErrorCode.REFUND_ALREADY_APPLIED]: '该订单已提交退款申请，请勿重复提交',
  [BusinessErrorCode.REFUND_IMAGE_REQUIRED]: '售后申请需要上传商品问题图片',
  [BusinessErrorCode.REFUND_DESCRIPTION_REQUIRED]: '请填写详细的问题说明',

  // Payment errors - 支付相关
  [BusinessErrorCode.PAYMENT_FAILED]: '支付遇到了小问题，请稍后重试',
  [BusinessErrorCode.IDEMPOTENT_REPLAY]: '订单正在处理中，请勿重复提交',
  [BusinessErrorCode.INSUFFICIENT_BALANCE]: '余额不足，请选择其他支付方式',

  // General errors - 通用错误
  [BusinessErrorCode.VALIDATION_ERROR]: '输入信息有误，请检查后重试',
  [BusinessErrorCode.UNAUTHORIZED]: '登录已过期，请重新登录',
  [BusinessErrorCode.FORBIDDEN]: '暂无权限进行此操作',
}

/**
 * Default error message - 默认错误提示
 */
export const DEFAULT_ERROR_MESSAGE = '系统开了个小差，请稍后再试'

/**
 * Network error message - 网络错误提示
 */
export const NETWORK_ERROR_MESSAGE = '网络连接不太顺畅，请检查后重试'

/**
 * 品牌术语常量
 */
export const BRAND_TERMS = {
  /** 积分的品牌称谓 */
  POINTS: '光阴值',
  /** 品牌名称 */
  BRAND_NAME: '朝暮',
} as const

/**
 * Get user-friendly error message from error code or message
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return DEFAULT_ERROR_MESSAGE
  }

  // Handle string error code
  if (typeof error === 'string') {
    return ErrorMessages[error] || error || DEFAULT_ERROR_MESSAGE
  }

  // Handle Error object
  if (error instanceof Error) {
    // Check if message is an error code
    const msg = ErrorMessages[error.message]
    if (msg) {
      return msg
    }
    return error.message || DEFAULT_ERROR_MESSAGE
  }

  // Handle object with code/message
  if (typeof error === 'object' && error !== null) {
    const err = error as { code?: string | number; message?: string }

    // Try to match by code
    if (err.code && typeof err.code === 'string') {
      const msg = ErrorMessages[err.code]
      if (msg) {
        return msg
      }
    }

    // Try to match by message
    if (err.message) {
      const msg = ErrorMessages[err.message]
      if (msg) {
        return msg
      }
    }

    // Return message if available
    if (err.message) {
      return err.message
    }
  }

  return DEFAULT_ERROR_MESSAGE
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('Network Error') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED')
    )
  }
  return false
}

/**
 * Get appropriate error message, handling network errors specially
 */
export function getDisplayErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return NETWORK_ERROR_MESSAGE
  }
  return getErrorMessage(error)
}
