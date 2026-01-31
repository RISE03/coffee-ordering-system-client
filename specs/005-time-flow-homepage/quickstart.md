# Quickstart: 时间流动主题首页（Time Flow Homepage）

**Feature Branch**: `005-time-flow-homepage`
**Created**: 2026-01-29

## 概述

本指南帮助开发者快速上手时间流动主题首页的开发。

## 前置条件

- Node.js 18+
- 已克隆 `frontend-client` 仓库
- 后端服务运行在 `localhost:8080`

## 快速开始

### 1. 切换到功能分支

```bash
git checkout 005-time-flow-homepage
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5174 查看首页。

## 核心文件结构

```
src/
├── types/timeflow.ts          # 时间流类型定义
├── constants/timeflow.ts      # 5 时段静态配置
├── stores/timeflow.ts         # 时间流状态管理
├── composables/
│   ├── useTimeSlot.ts         # 时段判断逻辑
│   └── useScrollSpy.ts        # 滚动监听
├── components/home/
│   ├── TimeFlowSection.vue    # 单时段区块
│   ├── TimelineNav.vue        # 时间线导航
│   └── TimeSlotCard.vue       # 时段商品卡片
└── views/HomeView.vue         # 首页主视图（重构）
```

## 关键代码示例

### 时段判断

```typescript
// src/composables/useTimeSlot.ts
import { computed } from 'vue'
import { TIME_FLOW_SLOTS, type TimeFlowSlot } from '@/constants/timeflow'

export function useTimeSlot() {
  const currentSlot = computed<TimeFlowSlot>(() => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 11) return 'morning'
    if (hour >= 11 && hour < 14) return 'noon'
    if (hour >= 14 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 21) return 'evening'
    return 'night'
  })

  const currentConfig = computed(() =>
    TIME_FLOW_SLOTS.find(s => s.code === currentSlot.value)
  )

  return { currentSlot, currentConfig }
}
```

### 滚动监听

```typescript
// src/composables/useScrollSpy.ts
import { ref, onMounted, onUnmounted } from 'vue'
import type { TimeFlowSlot } from '@/types/timeflow'

export function useScrollSpy(sectionIds: string[]) {
  const activeSection = ref<TimeFlowSlot | null>(null)

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            activeSection.value = entry.target.id.replace('timeflow-', '') as TimeFlowSlot
          }
        })
      },
      { threshold: 0.5, rootMargin: '-20% 0px -60% 0px' }
    )

    sectionIds.forEach(id => {
      const el = document.getElementById(`timeflow-${id}`)
      if (el) observer?.observe(el)
    })
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { activeSection }
}
```

### 时间流 Store

```typescript
// src/stores/timeflow.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getRecommendedProducts } from '@/api/products'
import { TIME_FLOW_SLOTS, type TimeFlowSlot } from '@/constants/timeflow'
import type { Product } from '@/types/product'

export const useTimeFlowStore = defineStore('timeflow', () => {
  // 状态
  const productsBySlot = ref<Record<TimeFlowSlot, Product[]>>({
    morning: [], noon: [], afternoon: [], evening: [], night: []
  })
  const loadingSlots = ref<Set<TimeFlowSlot>>(new Set())
  const activeSlot = ref<TimeFlowSlot>('morning')

  // 加载单时段商品
  async function loadSlotProducts(slot: TimeFlowSlot) {
    if (loadingSlots.value.has(slot)) return
    loadingSlots.value.add(slot)

    try {
      const res = await getRecommendedProducts({ timeSlotCode: slot })
      productsBySlot.value[slot] = res.products
    } finally {
      loadingSlots.value.delete(slot)
    }
  }

  // 预加载相邻时段
  function preloadAdjacentSlots(current: TimeFlowSlot) {
    const index = TIME_FLOW_SLOTS.findIndex(s => s.code === current)
    const adjacent = []
    if (index > 0) adjacent.push(TIME_FLOW_SLOTS[index - 1].code)
    if (index < TIME_FLOW_SLOTS.length - 1) adjacent.push(TIME_FLOW_SLOTS[index + 1].code)
    adjacent.forEach(slot => loadSlotProducts(slot))
  }

  return { productsBySlot, loadingSlots, activeSlot, loadSlotProducts, preloadAdjacentSlots }
})
```

## 测试

### 运行单元测试

```bash
npm run test:run
```

### 关键测试场景

1. **时段判断正确性**
   - 测试 `useTimeSlot` 在不同小时返回正确的时段
   - 边界条件：05:59 → night, 06:00 → morning

2. **滚动同步**
   - 模拟滚动到不同 section，验证 `activeSection` 更新

3. **商品加载**
   - Mock API 响应，验证 Store 正确存储数据
   - 测试加载状态和错误处理

## 开发提示

### CSS 变量使用

每个时段有独立的 CSS 变量，通过 class 控制：

```vue
<section :class="`timeflow-${slot.code}`">
  <!-- 内部元素自动继承时段配色 -->
  <h2 style="color: var(--timeflow-text)">{{ slot.name }}</h2>
</section>
```

### 主题系统协调

时间流（5 时段）与主题系统（朝暮 2 时段）独立：

- **视觉主题**（`data-theme="dawn/dusk"`）：控制全局配色
- **时间流时段**（`.timeflow-*`）：控制各 section 局部配色

两者可叠加使用，互不冲突。

### 性能优化

- 商品图片使用 `loading="lazy"`
- 滚动监听使用 Intersection Observer
- 避免在滚动回调中进行 DOM 操作

## 常见问题

### Q: 如何测试不同时段的效果？

修改系统时间，或在 `useTimeSlot` 中临时硬编码返回值：

```typescript
// 开发调试用，提交前删除
const currentSlot = computed(() => 'evening' as TimeFlowSlot)
```

### Q: 后端不支持 5 时段怎么办？

前端做映射：

```typescript
const SLOT_MAPPING = {
  morning: 'dawn',
  noon: 'midday',
  afternoon: 'midday',
  evening: 'dusk',
  night: 'dusk'
}
```

### Q: 滚动定位不准确？

检查 Intersection Observer 的 `rootMargin` 配置，根据导航栏高度调整。

## 下一步

1. 运行 `/speckit.tasks` 生成任务清单
2. 按任务顺序实现功能
3. 每完成一个任务运行测试验证
