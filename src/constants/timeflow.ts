/**
 * 时间流动主题首页 - 时段静态配置
 *
 * 定义 5 个时段的完整配置数据，包括名称、时间范围、文案和配色
 */

import type { TimeFlowConfig, TimeFlowSlot } from '@/types/timeflow'

/**
 * 5 时段完整配置
 * 顺序为一天的时间线流向：晨曦 → 午间 → 午后 → 暮色 → 夜幕
 */
export const TIME_FLOW_SLOTS: TimeFlowConfig[] = [
  {
    code: 'morning',
    name: '晨曦时光',
    nameEn: 'Morning Glow',
    hours: [7, 11],
    description: '阳光穿透玻璃窗，一杯咖啡开启美好的一天',
    slogan: '用醇香唤醒沉睡的灵魂',
    colors: {
      primary: '#FFB347',
      accent: '#FF8C00',
      gradient: 'linear-gradient(135deg, #FFF8E7 0%, #FFE4B5 50%, #FFDAB9 100%)',
      text: '#5D4037',
      textSecondary: '#8D6E63',
      glassBg: 'rgba(255, 248, 231, 0.75)'
    },
    icon: 'sunny-outline',
    promotion: {
      title: '早起鸟儿有优惠',
      description: '早 8 点前下单享 9 折',
      tag: '限时'
    }
  },
  {
    code: 'noon',
    name: '午间活力',
    nameEn: 'Noon Energy',
    hours: [11, 14],
    description: '忙碌中的片刻停歇，让活力再次充盈',
    slogan: '把午间变成充电站',
    colors: {
      primary: '#FFC107',
      accent: '#FF9800',
      gradient: 'linear-gradient(135deg, #FFFDE7 0%, #FFF9C4 50%, #FFE082 100%)',
      text: '#4E342E',
      textSecondary: '#795548',
      glassBg: 'rgba(255, 253, 231, 0.75)'
    },
    icon: 'flash-outline'
    // 午间时段无优惠
  },
  {
    code: 'afternoon',
    name: '午后漫时',
    nameEn: 'Afternoon Ease',
    hours: [14, 17],
    description: '时光慢下来，品一口悠闲与惬意',
    slogan: '让慵懒成为一种享受',
    colors: {
      primary: '#F5B041',
      accent: '#E59400',
      gradient: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 50%, #FFCC80 100%)',
      text: '#5D4037',
      textSecondary: '#8D6E63',
      glassBg: 'rgba(255, 243, 224, 0.75)'
    },
    icon: 'cafe-outline',
    promotion: {
      title: '下午茶第二杯半价',
      description: '指定饮品第二杯半价',
      tag: '专属'
    }
  },
  {
    code: 'evening',
    name: '暮色降临',
    nameEn: 'Evening Twilight',
    hours: [17, 21],
    description: '华灯初上，让温暖陪伴归途的疲惫',
    slogan: '在暮色中找到归属',
    colors: {
      primary: '#FAD7A0',
      accent: '#E8C78B',
      gradient: 'linear-gradient(135deg, #2D3436 0%, #636E72 40%, #B83B5E 100%)',
      text: '#ECF0F1',
      textSecondary: '#B8C5CC',
      glassBg: 'rgba(45, 52, 54, 0.75)',
      tagBg: '#FAD7A0',
      tagText: '#2D3436'
    },
    icon: 'moon-outline'
    // 暮色时段无优惠
  },
  {
    code: 'night',
    name: '夜幕低垂',
    nameEn: 'Night Serenity',
    hours: [21, 7],
    description: '夜深人静，给自己一份宁静与放松',
    slogan: '在星光下卸下一天的重量',
    colors: {
      primary: '#B8D4E3',
      accent: '#6A9BB5',
      gradient: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
      text: '#E0E7EE',
      textSecondary: '#A8B5BF',
      glassBg: 'rgba(15, 32, 39, 0.75)',
      tagBg: '#6A9BB5',
      tagText: '#E0E7EE'
    },
    icon: 'star-outline',
    promotion: {
      title: '深夜食堂套餐',
      description: '咖啡+甜点组合立减 10 元',
      tag: '夜宵'
    }
  }
]

/**
 * 根据时段编码获取配置
 */
export function getSlotConfig(code: TimeFlowSlot): TimeFlowConfig | undefined {
  return TIME_FLOW_SLOTS.find(slot => slot.code === code)
}

/**
 * 获取相邻时段编码（用于预加载）
 */
export function getAdjacentSlots(code: TimeFlowSlot): TimeFlowSlot[] {
  const index = TIME_FLOW_SLOTS.findIndex(slot => slot.code === code)
  const adjacent: TimeFlowSlot[] = []
  if (index > 0) {
    const prevSlot = TIME_FLOW_SLOTS[index - 1]
    if (prevSlot) adjacent.push(prevSlot.code)
  }
  if (index < TIME_FLOW_SLOTS.length - 1) {
    const nextSlot = TIME_FLOW_SLOTS[index + 1]
    if (nextSlot) adjacent.push(nextSlot.code)
  }
  return adjacent
}

/**
 * 前端 5 时段 → 后端 TimeSlotCode 映射
 * 当后端尚未支持 5 时段时使用此映射
 */
export const SLOT_TO_API_MAPPING: Record<TimeFlowSlot, string> = {
  morning: 'dawn',
  noon: 'midday',
  afternoon: 'midday',
  evening: 'dusk',
  night: 'dusk'
}
