/**
 * 用户信息与积分 API 模块
 *
 * 提供用户信息、积分（光阴值）查询等接口
 */

import apiClient from './client'
import type { User } from '@/types/user'

// ============================================================================
// 用户信息接口
// ============================================================================

/**
 * 获取当前登录用户信息
 * GET /api/user/me
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>('/user/me')
  return response.data
}

// ============================================================================
// 积分（光阴值）接口
// ============================================================================

/**
 * 积分账户信息
 */
export interface PointsInfo {
  /** 当前余额 */
  balance: number
  /** 累计获得 */
  totalEarned: number
  /** 累计消费 */
  totalSpent: number
}

/**
 * 获取当前用户的积分信息
 * GET /api/points/me
 */
export async function getMyPoints(): Promise<PointsInfo> {
  // 说明：
  // 积分接口在部分环境中会返回 401（业务码 4010）但并不影响登录态本身。
  // 默认拦截器会在 401 时触发全局登出，导致刚登录的用户被立即重定向回登录页。
  // 这里显式跳过全局 401 重定向，让登录流程先保持成功状态，积分获取失败时交由调用方自行处理。
  const response = await apiClient.get<PointsInfo>('/points/me', {
    // 自定义字段，Axios 类型未声明，拦截器中已读取该字段
    // @ts-expect-error custom flag for auth handling
    skipAuthRedirect: true
  })
  return response.data as PointsInfo
}
