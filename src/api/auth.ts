import apiClient from './client'
import type { 
  ForgotPasswordCodeRequest,
  ForgotPasswordCodeResponse,
  ForgotPasswordResetRequest,
  ForgotPasswordResetResponse,
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
   * 获取忘记密码验证码
   */
  async requestPasswordResetCode(data: ForgotPasswordCodeRequest): Promise<ForgotPasswordCodeResponse> {
    const res = await apiClient.post<ForgotPasswordCodeResponse>('/auth/password/code', data, {
      // @ts-expect-error custom flag for page-level error handling
      skipErrorMessage: true
    })
    return res.data as ForgotPasswordCodeResponse
  },

  /**
   * 通过验证码重置密码
   */
  async resetPassword(data: ForgotPasswordResetRequest): Promise<ForgotPasswordResetResponse> {
    const res = await apiClient.post<ForgotPasswordResetResponse>('/auth/password/reset', data, {
      // @ts-expect-error custom flag for page-level error handling
      skipErrorMessage: true
    })
    return res.data as ForgotPasswordResetResponse
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
