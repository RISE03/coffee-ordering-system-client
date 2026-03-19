import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'
import { createDiscreteApi } from 'naive-ui'
import {
  ApiErrorCode,
  type ApiResponse,
  isUnauthorizedError
} from '@/types/api'
import {
  normalizeError,
  mapMessageFromCode,
  STORE_CLOSED_ERROR_CODE
} from '@/utils/error'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

type RequestConfigWithAuthFlag = InternalAxiosRequestConfig & {
  skipAuthRedirect?: boolean
  skipErrorMessage?: boolean
}

// 仅这些接口返回 401 时，才认为登录态失效并触发强制登出
const FORCE_LOGOUT_ON_401_PREFIXES = ['/auth', '/member', '/user']

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

      // 业务 401 处理：允许调用方通过 config.skipAuthRedirect 跳过全局登出
      if (isUnauthorizedError(res.code)) {
        const config = response.config as RequestConfigWithAuthFlag
        if (config?.skipAuthRedirect) {
          return Promise.reject(buildError(displayMsg, res.code))
        }
        handleUnauthorized(displayMsg, config)
      } else {
        const config = response.config as RequestConfigWithAuthFlag
        if (!config?.skipErrorMessage) {
          if (res.code === STORE_CLOSED_ERROR_CODE) {
            message.warning(displayMsg)
          } else {
            message.error(displayMsg)
          }
        }
      }

      return Promise.reject(buildError(displayMsg, res.code))
    }

    // 未包装的响应，直接返回原始 response
    return response
  },
  (error: AxiosError<ApiResponse>) => {
    const normalized = normalizeError(error)
    const config = error.config as RequestConfigWithAuthFlag | undefined

    const is401 = error.response?.status === 401 || isUnauthorizedError(Number(normalized.code))
    if (is401) {
      if (config?.skipAuthRedirect) {
        return Promise.reject(error)
      }
      handleUnauthorized(normalized.message, config)
    } else if (!config?.skipErrorMessage) {
      message.error(normalized.message)
    }

    return Promise.reject(error)
  }
)

/**
 * 处理业务 / HTTP 401
 * - 已登录：仅认证关键接口触发强制登出，其它接口仅提示
 * - 游客：仅在当前路由需要登录时跳转；公共路由不再强制跳转，避免首屏接口 401 导致空白
 */
function handleUnauthorized(msg?: string, requestConfig?: RequestConfigWithAuthFlag) {
  const authStore = useAuthStore()
  const currentRoute = router.currentRoute.value
  const requiresAuth = Boolean(currentRoute.meta.requiresAuth)
  const shouldForceLogout = shouldForceLogoutOnUnauthorized(requestConfig)

  // 已登录：仅在认证关键接口返回 401 时，认为 token 失效
  if (authStore.isLoggedIn) {
    if (!shouldForceLogout) {
      message.warning(msg || '请求未通过权限校验')
      return
    }
    message.warning(msg || '登录已过期，请重新登录')
    authStore.logout(false)
  } else {
    // 游客：仅在必须登录的场景跳转，公共接口 401 只提示不跳转
    if (!requiresAuth) {
      message.warning(msg || '请先登录后再操作')
      return
    }
  }

  // 跳转登录页 (带上 redirect 参数以便登录后跳回)
  if (currentRoute.path !== '/login') {
    router.push({
      path: '/login',
      query: { redirect: currentRoute.fullPath }
    })
  }
}

function shouldForceLogoutOnUnauthorized(config?: RequestConfigWithAuthFlag): boolean {
  const requestPath = parseRequestPath(config?.url)
  if (!requestPath) {
    return false
  }
  return FORCE_LOGOUT_ON_401_PREFIXES.some((prefix) => requestPath.startsWith(prefix))
}

function parseRequestPath(rawUrl?: string): string {
  if (!rawUrl) {
    return ''
  }

  if (/^https?:\/\//i.test(rawUrl)) {
    try {
      return new URL(rawUrl).pathname
    } catch {
      return ''
    }
  }

  return rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
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
