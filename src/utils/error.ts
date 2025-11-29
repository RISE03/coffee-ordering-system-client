import type { AxiosError } from 'axios'
import { ApiErrorMessages, isUnauthorizedError } from '@/types/api'
import {
  BusinessErrorCode,
  ErrorMessages,
  DEFAULT_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  isNetworkError
} from './error-messages'

export type NormalizedErrorType = 'network' | 'business' | 'http' | 'unknown'

export interface NormalizedError {
  code?: string | number
  status?: number
  message: string
  type: NormalizedErrorType
}

/**
 * 将后端错误码或消息映射为品牌友好的提示
 */
export function mapMessageFromCode(
  code?: string | number,
  fallback?: string
): string {
  if (typeof code === 'number' && ApiErrorMessages[code]) {
    return ApiErrorMessages[code]
  }

  if (typeof code === 'string' && ErrorMessages[code]) {
    return ErrorMessages[code]
  }

  if (fallback && ErrorMessages[fallback]) {
    return ErrorMessages[fallback]
  }

  return fallback || DEFAULT_ERROR_MESSAGE
}

/**
 * 归一化错误对象，便于统一提示与处理
 */
export function normalizeError(error: unknown): NormalizedError {
  // Axios 错误
  const axiosError = error as AxiosError<{ code?: number | string; message?: string }>
  if (axiosError?.isAxiosError) {
    const status = axiosError.response?.status
    const payload = axiosError.response?.data
    const backendCode = (() => {
      const code = (payload as { code?: number | string } | undefined)?.code
      if (typeof code !== 'undefined') {
        return code
      }
      const alt = (payload as { errorCode?: number | string } | undefined)?.errorCode
      return typeof alt !== 'undefined' ? alt : undefined
    })()
    const backendMessage = (payload as { message?: string } | undefined)?.message

    // 网络层异常（无响应或断网）
    if (!axiosError.response) {
      return {
        code: backendCode,
        status,
        message: NETWORK_ERROR_MESSAGE,
        type: 'network'
      }
    }

    // 业务或 HTTP 错误
    const displayMessage = mapMessageFromCode(backendCode, backendMessage || axiosError.message)
    const isBusiness = typeof backendCode !== 'undefined'

    return {
      code: backendCode,
      status,
      message: displayMessage,
      type: isBusiness ? 'business' : 'http'
    }
  }

  // 字符串错误（可能直接是业务错误码）
  if (typeof error === 'string') {
    const message = mapMessageFromCode(error, error)
    return { message, type: 'business' }
  }

  // Error 对象
  if (error instanceof Error) {
    const message = isNetworkError(error)
      ? NETWORK_ERROR_MESSAGE
      : mapMessageFromCode(undefined, error.message)
    return { message, type: isNetworkError(error) ? 'network' : 'unknown' }
  }

  // 兜底
  if (typeof error === 'object' && error !== null) {
    const maybe = error as { code?: string | number; message?: string }
    const message = mapMessageFromCode(maybe.code, maybe.message)
    return {
      code: maybe.code,
      message,
      type: 'business'
    }
  }

  return { message: DEFAULT_ERROR_MESSAGE, type: 'unknown' }
}

/**
 * 返回用于 UI 的展示文案
 */
export function getDisplayErrorMessage(error: unknown): string {
  const normalized = normalizeError(error)
  if (isNetworkError(error)) {
    return NETWORK_ERROR_MESSAGE
  }
  return normalized.message
}

/**
 * 是否需要触发登出逻辑
 */
export function shouldLogout(error: unknown): boolean {
  const normalized = normalizeError(error)
  if (typeof normalized.code === 'number') {
    return isUnauthorizedError(normalized.code)
  }
  if (normalized.status === 401) {
    return true
  }
  return false
}

export { BusinessErrorCode, ErrorMessages }
