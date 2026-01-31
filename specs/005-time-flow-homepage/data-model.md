# Data Model: 时间流动主题首页（Time Flow Homepage）

**Feature Branch**: `005-time-flow-homepage`
**Created**: 2026-01-29
**Status**: Complete

## 实体关系图

```
┌─────────────────────────────────────────────────────────────────┐
│                        TimeFlowConfig                           │
│  (静态配置，定义 5 个时段的元数据)                                │
├─────────────────────────────────────────────────────────────────┤
│  code: TimeFlowSlot (PK)                                        │
│  name: string                                                   │
│  hours: [startHour, endHour)                                    │
│  description: string                                            │
│  slogan: string                                                 │
│  colors: TimeFlowColors                                         │
│  icon: string (可选)                                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │ 1:N (运行时关联)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Product                                │
│  (复用现有商品类型，来自 API)                                     │
├─────────────────────────────────────────────────────────────────┤
│  id: number (PK)                                                │
│  name: string                                                   │
│  englishName?: string                                           │
│  price: number                                                  │
│  imageUrl?: string                                              │
│  categoryId: number                                             │
│  description?: string                                           │
│  tag?: string                                                   │
│  tags?: string[]                                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      TimeFlowState                              │
│  (运行时状态，存储在 Pinia Store)                                │
├─────────────────────────────────────────────────────────────────┤
│  currentSlot: TimeFlowSlot                                      │
│  activeSlot: TimeFlowSlot                                       │
│  productsBySlot: Record<TimeFlowSlot, Product[]>                │
│  loadingSlots: Set<TimeFlowSlot>                                │
│  errorSlots: Record<TimeFlowSlot, string | null>                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 核心类型定义

### 1. TimeFlowSlot（时段枚举）

```typescript
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
```

### 2. TimeFlowColors（时段配色）

```typescript
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
```

### 3. TimeFlowConfig（时段配置）

```typescript
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
}
```

### 4. TimeFlowState（Store 状态）

```typescript
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
```

---

## 静态配置数据

### TIME_FLOW_SLOTS（时段配置常量）

```typescript
// src/constants/timeflow.ts

export const TIME_FLOW_SLOTS: TimeFlowConfig[] = [
  {
    code: 'morning',
    name: '晨曦时光',
    nameEn: 'Morning Glow',
    hours: [6, 11],
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
    icon: 'sunny-outline'
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
    icon: 'cafe-outline'
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
      glassBg: 'rgba(45, 52, 54, 0.75)'
    },
    icon: 'moon-outline'
  },
  {
    code: 'night',
    name: '夜幕低垂',
    nameEn: 'Night Serenity',
    hours: [21, 6], // 跨越午夜：21:00 - 05:59
    description: '夜深人静，给自己一份宁静与放松',
    slogan: '在星光下卸下一天的重量',
    colors: {
      primary: '#B8D4E3',
      accent: '#6A9BB5',
      gradient: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
      text: '#E0E7EE',
      textSecondary: '#A8B5BF',
      glassBg: 'rgba(15, 32, 39, 0.75)'
    },
    icon: 'star-outline'
  }
]
```

---

## 状态转换

### 时段判断逻辑

```typescript
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
```

### 时段导航状态机

```
┌─────────────────────────────────────────────────────────────┐
│                      状态转换触发条件                        │
├─────────────────────────────────────────────────────────────┤
│  [页面加载] → 计算 currentSlot → 设置 activeSlot            │
│  [滚动到新区域] → Intersection Observer → 更新 activeSlot   │
│  [点击导航] → scrollIntoView → 等待滚动完成 → 更新 activeSlot│
│  [时间变化] → 每分钟检查 → 更新 currentSlot (不影响 active)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 验证规则

### TimeFlowConfig 验证

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `code` | 必填，枚举值之一 | 无效的时段编码 |
| `name` | 必填，2-10 字符 | 时段名称长度不符合要求 |
| `hours` | 必填，[0-23, 0-24] | 时间范围无效 |
| `description` | 必填，10-50 字符 | 描述长度不符合要求 |
| `colors` | 必填，所有颜色字段有效 | 配色方案不完整 |

### Product 验证（复用现有）

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| `id` | 必填，正整数 | 商品 ID 无效 |
| `name` | 必填，1-50 字符 | 商品名称不能为空 |
| `price` | 必填，>= 0 | 价格不能为负数 |

---

## 与现有类型的关系

```typescript
// src/types/timeflow.ts

// 复用现有类型
import type { Product } from './product'

// 导出新类型
export type { TimeFlowSlot, TimeFlowColors, TimeFlowConfig, TimeFlowState }

// 类型守卫
export function isValidTimeFlowSlot(value: string): value is TimeFlowSlot {
  return ['morning', 'noon', 'afternoon', 'evening', 'night'].includes(value)
}

// 时段配置查找
export function getSlotConfig(code: TimeFlowSlot): TimeFlowConfig | undefined {
  return TIME_FLOW_SLOTS.find(slot => slot.code === code)
}

// 获取相邻时段（用于预加载）
export function getAdjacentSlots(code: TimeFlowSlot): TimeFlowSlot[] {
  const index = TIME_FLOW_SLOTS.findIndex(slot => slot.code === code)
  const adjacent: TimeFlowSlot[] = []
  if (index > 0) adjacent.push(TIME_FLOW_SLOTS[index - 1].code)
  if (index < TIME_FLOW_SLOTS.length - 1) adjacent.push(TIME_FLOW_SLOTS[index + 1].code)
  return adjacent
}
```

---

## 文件位置规划

| 类型定义 | 文件路径 |
|----------|----------|
| `TimeFlowSlot`, `TimeFlowColors`, `TimeFlowConfig` | `src/types/timeflow.ts` |
| `TIME_FLOW_SLOTS` 常量 | `src/constants/timeflow.ts` |
| `TimeFlowState` (Store) | `src/stores/timeflow.ts` |
| 工具函数 (`getSlotByHour` 等) | `src/utils/timeflow.ts` 或 `src/composables/useTimeSlot.ts` |
