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
  const response = await apiClient.get<PointsInfo>('/points/me')
  return response.data
}
