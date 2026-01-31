/**
 * 时间流动主题首页 - 类型定义
 *
 * 定义 5 个时段的类型、配色方案和配置结构
 */

import type { Product } from './product'

// ============================================================================
// 时段枚举
// ============================================================================

/**
 * 时间流时段编码
 * - morning: 晨曦时光 (06:00-10:59)
 * - noon: 午间活力 (11:00-13:59)
 * - afternoon: 午后漫时 (14:00-16:59)
 * - evening: 暮色降临 (17:00-20:59)
 * - night: 夜幕低垂 (21:00-05:59)
 */
export type TimeFlowSlot =
  | 'morning'
  | 'noon'
  | 'afternoon'
  | 'evening'
  | 'night'

/**
 * 所有时段编码列表（用于遍历和验证）
 */
export const TIME_FLOW_SLOT_CODES: TimeFlowSlot[] = [
  'morning',
  'noon',
  'afternoon',
  'evening',
  'night'
]

// ============================================================================
// 时段配色
// ============================================================================

/**
 * 时段视觉配色方案
 */
export interface TimeFlowColors {
  /** 主色调（用于按钮、强调元素） */
  primary: string
  /** 辅助色（用于图标、边框） */
  accent: string
  /** 背景渐变 */
  gradient: string
  /** 文字颜色 */
  text: string
  /** 次要文字颜色 */
  textSecondary: string
  /** 玻璃卡片背景 */
  glassBg: string
}

// ============================================================================
// 时段配置
// ============================================================================

/**
 * 时段专属优惠信息
 */
export interface TimeFlowPromotion {
  /** 优惠标题 */
  title: string
  /** 优惠描述 */
  description?: string
  /** 优惠标签（如「限时」「专属」） */
  tag?: string
  /** 优惠链接（可选） */
  link?: string
}

/**
 * 单个时段的完整配置
 */
export interface TimeFlowConfig {
  /** 时段编码（唯一标识） */
  code: TimeFlowSlot
  /** 时段名称（中文） */
  name: string
  /** 时段英文名称（用于 CSS 类名） */
  nameEn: string
  /** 时间范围 [startHour, endHour)，endHour 为 exclusive */
  hours: [number, number]
  /** 氛围描述（主文案） */
  description: string
  /** 副标语（短文案） */
  slogan: string
  /** 视觉配色 */
  colors: TimeFlowColors
  /** 图标名称（可选，用于导航） */
  icon?: string
  /** 时段专属优惠（可选） */
  promotion?: TimeFlowPromotion
}

// ============================================================================
// Store 状态
// ============================================================================

/**
 * 时间流 Store 状态接口
 */
export interface TimeFlowState {
  /** 当前真实时段（根据本地时间计算） */
  currentSlot: TimeFlowSlot
  /** 当前活跃时段（用户滚动或点击导航后的位置） */
  activeSlot: TimeFlowSlot
  /** 各时段的推荐商品 */
  productsBySlot: Record<TimeFlowSlot, Product[]>
  /** 正在加载的时段集合 */
  loadingSlots: Set<TimeFlowSlot>
  /** 各时段的错误信息 */
  errorSlots: Record<TimeFlowSlot, string | null>
  /** 是否已初始化 */
  initialized: boolean
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 类型守卫：验证字符串是否为有效的时段编码
 */
export function isValidTimeFlowSlot(value: string): value is TimeFlowSlot {
  return TIME_FLOW_SLOT_CODES.includes(value as TimeFlowSlot)
}

/**
 * 根据当前小时数确定时段
 * @param hour 当前小时 (0-23)
 * @returns 对应的时段编码
 */
export function getSlotByHour(hour: number): TimeFlowSlot {
  if (hour >= 6 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 14) return 'noon'
  if (hour >= 14 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  // 21:00-05:59 (包括午夜跨越)
  return 'night'
}

/**
 * 获取当前时段
 */
export function getCurrentSlot(): TimeFlowSlot {
  return getSlotByHour(new Date().getHours())
}

/**
 * 创建空的时段商品记录
 */
export function createEmptyProductsBySlot(): Record<TimeFlowSlot, Product[]> {
  return {
    morning: [],
    noon: [],
    afternoon: [],
    evening: [],
    night: []
  }
}

/**
 * 创建空的时段错误记录
 */
export function createEmptyErrorSlots(): Record<TimeFlowSlot, string | null> {
  return {
    morning: null,
    noon: null,
    afternoon: null,
    evening: null,
    night: null
  }
}
