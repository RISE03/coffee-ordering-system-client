/**
 * 公开配置 API 模块
 *
 * 获取店铺营业时间等公开配置信息
 */

import client from './client'

/**
 * 营业时间配置
 */
export interface BusinessHours {
  /** 开始时间，格式 HH:mm */
  start: string
  /** 结束时间，格式 HH:mm */
  end: string
}

/**
 * 获取营业时间配置
 * 调用 GET /api/public/config/business-hours
 * 若接口不存在，返回默认值 08:00-22:00
 */
export async function getBusinessHours(): Promise<BusinessHours> {
  try {
    const response = await client.get<BusinessHours>('/public/config/business-hours')
    return response.data
  } catch {
    // 接口不存在或请求失败时，返回默认营业时间
    return {
      start: '08:00',
      end: '22:00'
    }
  }
}

/**
 * 判断当前是否在营业时间内
 * @param businessHours 营业时间配置
 * @param currentTime 当前时间（可选，默认为当前时间）
 */
export function isBusinessOpen(
  businessHours: BusinessHours,
  currentTime: Date = new Date()
): boolean {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()

  const [startHour, startMin] = businessHours.start.split(':').map(Number)
  const [endHour, endMin] = businessHours.end.split(':').map(Number)

  const startMinutes = (startHour ?? 0) * 60 + (startMin ?? 0)
  const endMinutes = (endHour ?? 0) * 60 + (endMin ?? 0)

  // 处理跨午夜的情况（如 22:00 - 02:00）
  if (endMinutes < startMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes
}
