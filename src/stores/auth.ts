import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginResponse } from '@/types/user'
import { AUTH_STORAGE_KEYS } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN))
  const user = ref<User | null>(null)

  // 尝试从 localStorage 恢复用户信息
  const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER)
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (e) {
      console.error('Failed to parse stored user:', e)
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER)
    }
  }

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const isMember = computed(() => user.value?.role === 'member')

  // Actions

  /**
   * 设置登录状态 (登录成功后调用)
   */
  function setLoginState(data: LoginResponse) {
    token.value = data.token
    user.value = data.user

    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, data.token)
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(data.user))
  }

  /**
   * 更新用户信息
   */
  function setUser(newUser: User) {
    user.value = newUser
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(newUser))
  }

  /**
   * 退出登录
   * @param callApi 是否调用后端注销接口，默认 true。当 token 已失效时应传 false
   */
  async function logout(callApi = true) {
    // 只有在 token 有效且需要调用 API 时才请求后端
    if (callApi && token.value) {
      try {
        const { authApi } = await import('@/api/auth')
        await authApi.logout()
      } catch (e) {
        console.warn('Logout API failed:', e)
      }
    }

    // 无论后端是否成功，前端都执行清理
    token.value = null
    user.value = null

    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN)
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER)
  }

  /**
   * 检查认证状态 (初始化时调用)
   * 验证 Token 有效性并获取最新用户信息
   */
  async function checkAuth() {
    if (!token.value) return

    try {
      const { authApi } = await import('@/api/auth')
      const latestUser = await authApi.getProfile()
      setUser(latestUser)
    } catch (e) {
      console.error('Auth check failed:', e)
      // Token 无效或过期，仅清理本地状态，不调用后端（token 已失效）
      logout(false)
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    isMember,
    setLoginState,
    setUser,
    logout,
    checkAuth
  }
})
