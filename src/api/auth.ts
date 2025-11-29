import apiClient from './client'
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse, 
  User 
} from '@/types/user'

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 用户登录
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await apiClient.post<LoginResponse>('/auth/login', data)
    return res.data as LoginResponse
  },

  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const res = await apiClient.post<RegisterResponse>('/auth/register', data)
    return res.data as RegisterResponse
  },

  /**
   * 退出登录
   */
  async logout(): Promise<void> {
    await apiClient.post<void>('/auth/logout')
  },

  /**
   * 获取当前用户信息
   */
  async getProfile(): Promise<User> {
    const res = await apiClient.get<User>('/auth/me')
    return res.data as User
  }
}
