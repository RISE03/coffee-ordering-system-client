import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'
import { createDiscreteApi } from 'naive-ui'
import {
  ApiErrorCode,
  type ApiResponse,
  isUnauthorizedError
} from '@/types/api'
import { normalizeError, mapMessageFromCode } from '@/utils/error'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

// 创建 Discrete API 用于在非组件环境（如 Axios 拦截器）中显示消息
const { message } = createDiscreteApi(['message'])

// 创建 Axios 实例
const apiClient = axios.create({
  baseURL: '/api', // 配合 vite.config.ts 中的 proxy
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    
    // 如果存在 token，注入到请求头
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    return config
  },
  (error: unknown) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    const res = response.data

    // 若后端使用统一的 code 包装
    if (typeof res === 'object' && res !== null && 'code' in res) {
      if (res.code === ApiErrorCode.SUCCESS) {
        // 将 data 写回 response，便于调用方继续通过 response.data 读取
        ;(response as AxiosResponse<unknown>).data = (res as ApiResponse<unknown>).data as unknown
        return response as AxiosResponse<unknown>
      }

      const displayMsg = mapMessageFromCode(res.code, res.message)

      if (isUnauthorizedError(res.code)) {
        handleUnauthorized(displayMsg)
      } else {
        message.error(displayMsg)
      }

      return Promise.reject(buildError(displayMsg, res.code))
    }

    // 未包装的响应，直接返回原始 response
    return response
  },
  (error: AxiosError<ApiResponse>) => {
    const normalized = normalizeError(error)
    const config = error.config as any

    if (error.response?.status === 401 || isUnauthorizedError(Number(normalized.code))) {
      if (config?.skipAuthRedirect) {
        return Promise.reject(error)
      }
      handleUnauthorized(normalized.message)
    } else {
      message.error(normalized.message)
    }

    return Promise.reject(error)
  }
)

/**
 * 处理业务错误码
 */
function handleUnauthorized(msg?: string) {
  const authStore = useAuthStore()

  // 如果当前已登录，说明 Token 过期，需要清理状态
  // 传 false 避免调用后端 logout 接口（token 已失效）
  if (authStore.isLoggedIn) {
    message.warning(msg || '登录已过期，请重新登录')
    authStore.logout(false)
  }

  // 跳转登录页 (带上 redirect 参数以便登录后跳回)
  const currentRoute = router.currentRoute.value
  if (currentRoute.path !== '/login') {
    router.push({
      path: '/login',
      query: { redirect: currentRoute.fullPath }
    })
  }
}

function buildError(messageText: string, code?: number | string) {
  const error = new Error(messageText)
  const enriched = error as unknown as Record<string, unknown>
  if (code !== undefined) {
    enriched.code = code
  }
  return error
}

export default apiClient
