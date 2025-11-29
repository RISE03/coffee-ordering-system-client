/**
 * API 响应类型定义
 *
 * 定义与后端 API 通信的统一响应格式和通用类型
 */

// ============================================================================
// 通用响应类型
// ============================================================================

/**
 * 统一 API 响应结构
 * 后端返回格式: { code, message, data }
 */
export interface ApiResponse<T = unknown> {
  /** 响应码：0 = 成功，非 0 = 失败 */
  code: number
  /** 提示信息 */
  message: string
  /** 业务数据 */
  data: T
}

/**
 * 分页数据结构
 */
export interface PaginatedData<T> {
  /** 总记录数 */
  total: number
  /** 当前页码（从 1 开始） */
  page: number
  /** 每页条数 */
  size: number
  /** 数据列表 */
  list: T[]
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  /** 页码，默认 1 */
  page?: number
  /** 每页条数，默认 10 */
  size?: number
}

// ============================================================================
// 错误码常量
// ============================================================================

/**
 * API 业务错误码
 */
export const ApiErrorCode = {
  /** 成功 */
  SUCCESS: 0,
  /** 参数校验错误 */
  PARAM_ERROR: 4001,
  /** 未登录/登录过期 */
  UNAUTHORIZED: 4010,
  /** 无访问权限 */
  FORBIDDEN: 4030,
  /** 资源不存在 */
  NOT_FOUND: 4040,
  /** 业务冲突 */
  CONFLICT: 4090,
  /** 系统内部错误 */
  INTERNAL_ERROR: 5000,
} as const

export type ApiErrorCodeType = (typeof ApiErrorCode)[keyof typeof ApiErrorCode]

/**
 * 错误码对应的用户友好提示信息
 */
export const ApiErrorMessages: Record<number, string> = {
  [ApiErrorCode.PARAM_ERROR]: '输入信息有误，请检查后重试',
  [ApiErrorCode.UNAUTHORIZED]: '请先登录后再操作',
  [ApiErrorCode.FORBIDDEN]: '暂无权限进行此操作',
  [ApiErrorCode.NOT_FOUND]: '请求的内容不存在',
  [ApiErrorCode.CONFLICT]: '操作冲突，请刷新页面后重试',
  [ApiErrorCode.INTERNAL_ERROR]: '系统繁忙，请稍后再试',
}

// ============================================================================
// API 请求相关类型
// ============================================================================

/**
 * API 请求配置选项
 */
export interface RequestOptions {
  /** 是否显示加载状态 */
  showLoading?: boolean
  /** 是否显示错误提示 */
  showError?: boolean
  /** 自定义错误提示信息 */
  errorMessage?: string
  /** 请求超时时间（毫秒） */
  timeout?: number
}

/**
 * API 错误对象
 */
export interface ApiError {
  /** 错误码 */
  code: number
  /** 错误信息 */
  message: string
  /** 原始错误 */
  originalError?: unknown
}

// ============================================================================
// 类型守卫
// ============================================================================

/**
 * 检查响应是否成功
 */
export function isApiSuccess<T>(response: ApiResponse<T>): boolean {
  return response.code === ApiErrorCode.SUCCESS
}

/**
 * 检查是否为未授权错误
 */
export function isUnauthorizedError(code: number): boolean {
  return code === ApiErrorCode.UNAUTHORIZED
}

/**
 * 创建分页参数
 */
export function createPaginationParams(
  page = 1,
  size = 10
): Required<PaginationParams> {
  return { page, size }
}
