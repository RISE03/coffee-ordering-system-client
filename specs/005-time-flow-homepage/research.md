# Research: 时间流动主题首页（Time Flow Homepage）

**Feature Branch**: `005-time-flow-homepage`
**Created**: 2026-01-29
**Status**: Complete

## 研究任务总览

| 研究领域 | 状态 | 结论 |
|----------|------|------|
| 时段划分与时间判断 | ✅ | 扩展现有 5 时段 + 复用 theme store 时间逻辑 |
| 滚动监听与导航同步 | ✅ | 使用 Intersection Observer + 节流 |
| 视觉主题与 CSS 变量 | ✅ | 扩展现有 CSS 变量系统，每时段独立配色 |
| API 接口适配 | ✅ | 复用 `/products/recommend`，扩展 TimeSlotCode |
| 组件架构设计 | ✅ | 新增 TimeFlowSection + TimelineNav 组件 |
| 性能优化策略 | ✅ | 懒加载 + 节流 + will-change 优化 |

---

## 1. 时段划分与时间判断

### 研究问题

规格要求 5 个时段，现有系统只有 2 个时段（dawn/dusk），如何扩展？

### 现有实现分析

**`src/stores/theme.ts`**:
- 当前只支持 `dawn`（06:00-17:59）和 `dusk`（18:00-05:59）
- `calculateThemeByTime()` 函数基于小时判断
- 主题切换使用 `data-theme` 属性 + CSS 变量

**`src/types/product.ts`**:
- `TimeSlotCode` 类型当前定义为 `'dawn' | 'midday' | 'dusk'`
- 已预留 `midday` 但未实际使用

### 决策

**Decision**: 新建 5 时段系统，与主题系统（朝暮 2 时段）并存，互不干扰

**Rationale**:
- 时间流（5 时段）是内容维度，用于推荐和展示
- 主题系统（2 时段）是视觉维度，用于配色和氛围
- 两者独立演化，降低耦合

**实现方案**:

```typescript
// src/types/timeflow.ts
export type TimeFlowSlot =
  | 'morning'    // 晨曦时光 06:00-10:59
  | 'noon'       // 午间活力 11:00-13:59
  | 'afternoon'  // 午后漫时 14:00-16:59
  | 'evening'    // 暮色降临 17:00-20:59
  | 'night'      // 夜幕低垂 21:00-05:59

export interface TimeFlowConfig {
  code: TimeFlowSlot
  name: string           // 时段名称
  hours: [number, number] // [startHour, endHour)
  description: string    // 氛围描述
  colors: {
    primary: string
    background: string
    gradient: string
  }
}
```

**Alternatives Considered**:
1. 扩展现有 ThemeStore → 拒绝：职责混淆，主题切换逻辑变复杂
2. 修改 TimeSlotCode 为 5 值 → 拒绝：影响现有后端 API 约定

---

## 2. 滚动监听与导航同步

### 研究问题

如何实现滚动时自动更新导航状态，同时保持 60fps 流畅？

### 技术方案对比

| 方案 | 优点 | 缺点 | 性能 |
|------|------|------|------|
| scroll 事件监听 | 简单直接 | 频繁触发，需节流 | ⭐⭐ |
| Intersection Observer | 原生支持，性能好 | 阈值配置复杂 | ⭐⭐⭐⭐ |
| 第三方库 (vue-scrollspy) | 开箱即用 | 额外依赖 | ⭐⭐⭐ |

### 决策

**Decision**: 使用 Intersection Observer API

**Rationale**:
- 浏览器原生支持，无需额外依赖
- 异步回调不阻塞主线程
- 可精确控制触发阈值

**实现方案**:

```typescript
// src/composables/useScrollSpy.ts
export function useScrollSpy(
  sectionIds: Ref<string[]>,
  options: { threshold?: number; rootMargin?: string } = {}
) {
  const activeSection = ref<string | null>(null)

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          activeSection.value = entry.target.id
        }
      })
    },
    {
      threshold: options.threshold ?? 0.5,
      rootMargin: options.rootMargin ?? '-20% 0px -60% 0px'
    }
  )

  // ... observe/unobserve 逻辑

  return { activeSection }
}
```

**Alternatives Considered**:
1. scroll + requestAnimationFrame → 拒绝：仍需手动计算元素位置
2. 第三方库 → 拒绝：增加打包体积，功能过剩

---

## 3. 视觉主题与 CSS 变量

### 研究问题

如何为 5 个时段设计独特的视觉主题，同时复用现有 Glassmorphism 系统？

### 现有系统分析

**`src/style.css`** 已定义:
- `--color-primary`, `--color-bg`, `--color-text` 等基础变量
- `--glass-bg`, `--glass-shadow` 等玻璃态变量
- `.glass-card`, `.glass-nav` 等工具类
- `data-theme="dawn"` 和 `data-theme="dusk"` 两套配色

### 决策

**Decision**: 扩展 CSS 变量系统，添加时段专属变量前缀 `--timeflow-*`

**Rationale**:
- 不破坏现有主题系统
- 时段配色可独立配置
- 支持运行时动态切换

**实现方案**:

```css
/* src/style.css 扩展 */

/* 晨曦时光 - 柔和暖黄 */
.timeflow-morning {
  --timeflow-gradient: linear-gradient(135deg, #FFF8E7 0%, #FFE4B5 100%);
  --timeflow-primary: #FFB347;
  --timeflow-accent: #FF8C00;
  --timeflow-text: #5D4037;
}

/* 午间活力 - 明亮金色 */
.timeflow-noon {
  --timeflow-gradient: linear-gradient(135deg, #FFF9E6 0%, #FFD700 100%);
  --timeflow-primary: #FFC107;
  --timeflow-accent: #FF9800;
  --timeflow-text: #4E342E;
}

/* 午后漫时 - 温暖琥珀 */
.timeflow-afternoon {
  --timeflow-gradient: linear-gradient(135deg, #FFF3E0 0%, #FFCC80 100%);
  --timeflow-primary: #F5B041;
  --timeflow-accent: #E59400;
  --timeflow-text: #5D4037;
}

/* 暮色降临 - 绯红渐变 */
.timeflow-evening {
  --timeflow-gradient: linear-gradient(135deg, #2D3436 0%, #636E72 50%, #B83B5E 100%);
  --timeflow-primary: #FAD7A0;
  --timeflow-accent: #E8C78B;
  --timeflow-text: #ECF0F1;
}

/* 夜幕低垂 - 深邃靛蓝 */
.timeflow-night {
  --timeflow-gradient: linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%);
  --timeflow-primary: #B8D4E3;
  --timeflow-accent: #6A9BB5;
  --timeflow-text: #E0E7EE;
}
```

**Alternatives Considered**:
1. 每时段单独 CSS 文件 → 拒绝：增加 HTTP 请求
2. Tailwind 动态类名 → 拒绝：需要 safelist 配置，运行时无法动态生成

---

## 4. API 接口适配

### 研究问题

现有 `/products/recommend` 接口是否支持 5 时段？需要如何适配？

### 现有接口分析

**`src/api/products.ts`**:
```typescript
export async function getRecommendedProducts(
  params?: RecommendationQueryParams
): Promise<RecommendationResponse>

// RecommendationQueryParams
interface RecommendationQueryParams {
  scene?: string
  timeSlotCode?: TimeSlotCode  // 'dawn' | 'midday' | 'dusk'
}
```

### 决策

**Decision**: 前端负责时段映射，后端 API 保持不变（假设后端已支持或将支持）

**Rationale**:
- 规格说明假设后端已有或将提供时段推荐接口
- 前端 5 时段映射到后端 3 时段（或扩展的 5 时段）
- 保持向后兼容

**映射策略**:

```typescript
// 前端 5 时段 → 后端 TimeSlotCode 映射
const SLOT_MAPPING: Record<TimeFlowSlot, TimeSlotCode> = {
  morning: 'dawn',
  noon: 'midday',
  afternoon: 'midday',  // 或后端新增 'afternoon'
  evening: 'dusk',
  night: 'dusk'
}

// 如果后端扩展为 5 时段，可直接使用：
type TimeSlotCode = 'morning' | 'noon' | 'afternoon' | 'evening' | 'night'
```

**Alternatives Considered**:
1. 新建专用 API → 拒绝：增加后端工作量，现有接口已满足
2. 客户端硬编码推荐 → 拒绝：无法动态更新

---

## 5. 组件架构设计

### 研究问题

如何设计组件层级，实现时间流页面的可维护性和复用性？

### 组件设计

```
HomeView.vue (重构)
├── TimelineNav.vue          # 固定在侧边的时间线导航
│   └── <slot-indicator v-for="slot in slots" />
│
└── <main class="timeflow-container">
      └── TimeFlowSection.vue (v-for="slot in slots")
          ├── <header>
          │   └── 时段名称 + 氛围描述
          ├── <product-grid>
          │   └── TimeSlotCard.vue (v-for="product in products")
          │       └── 商品图片 + 名称 + 价格 + 加购按钮
          └── <footer>
              └── 时段专属优惠位（预留）
```

### 决策

**Decision**: 采用 Section-based 布局，每个时段为独立 section

**Rationale**:
- 每个 section 有独立的视觉上下文
- Intersection Observer 天然适配 section 模式
- 支持未来按需加载

**组件职责**:

| 组件 | 职责 | Props | Events |
|------|------|-------|--------|
| `TimelineNav` | 显示时段导航，响应滚动 | `slots`, `activeSlot` | `navigate` |
| `TimeFlowSection` | 渲染单个时段内容 | `slot`, `products`, `loading` | `add-to-cart` |
| `TimeSlotCard` | 渲染推荐商品卡片 | `product`, `slotTheme` | `click`, `add-to-cart` |

**Alternatives Considered**:
1. 单一长页面 + 锚点 → 拒绝：视觉过渡不够明确
2. Tab/Carousel 切换 → 拒绝：不符合"时间流动"的沉浸体验

---

## 6. 性能优化策略

### 研究问题

如何确保 5 个时段的内容（15-30 个商品卡片）流畅渲染和滚动？

### 优化策略

| 优化点 | 策略 | 实现 |
|--------|------|------|
| 图片加载 | 懒加载 | `loading="lazy"` + Intersection Observer |
| 滚动事件 | 节流 | Intersection Observer 替代 scroll 监听 |
| DOM 数量 | 虚拟滚动（可选） | 当商品数量 > 50 时启用 |
| 动画性能 | GPU 加速 | `will-change: transform` + `transform: translateZ(0)` |
| 重排重绘 | 批量更新 | 使用 `requestAnimationFrame` 或 Vue 批量更新 |

### 决策

**Decision**: 首版采用懒加载 + Intersection Observer，不引入虚拟滚动

**Rationale**:
- 5 时段 × 6 商品 = 30 个卡片，现代浏览器可轻松处理
- 虚拟滚动增加复杂度，当前规模不需要
- 后续可按需升级

**实现要点**:

```vue
<!-- TimeFlowSection.vue -->
<template>
  <section
    :id="`timeflow-${slot.code}`"
    :class="['timeflow-section', `timeflow-${slot.code}`]"
    :style="{ background: slot.colors.gradient }"
  >
    <div class="products-grid">
      <TimeSlotCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        loading="lazy"
      />
    </div>
  </section>
</template>

<style scoped>
.timeflow-section {
  min-height: 100vh;
  scroll-snap-align: start;
  will-change: opacity, transform;
}
</style>
```

**Alternatives Considered**:
1. 虚拟列表 (vue-virtual-scroller) → 延后：当前规模不需要
2. 分页加载 → 拒绝：破坏时间流连续体验

---

## 7. 状态管理设计

### 研究问题

时间流首页需要管理哪些状态？如何组织？

### 状态分析

| 状态 | 来源 | 生命周期 | 共享范围 |
|------|------|----------|----------|
| 当前时段 | 本地时间计算 | 页面级 | 单页面 |
| 活跃时段（滚动） | 滚动监听 | 页面级 | 单页面 |
| 各时段商品 | API | 页面级 | 可缓存 |
| 加载状态 | API 调用 | 页面级 | 单页面 |

### 决策

**Decision**: 新建 `useTimeFlowStore` Pinia Store

**Rationale**:
- 与现有 ProductStore 分离，避免职责混淆
- 支持后续页面共享（如直接链接到特定时段）
- 统一管理加载、错误状态

**Store 设计**:

```typescript
// src/stores/timeflow.ts
export const useTimeFlowStore = defineStore('timeflow', () => {
  // 配置
  const slots = ref<TimeFlowConfig[]>(TIME_FLOW_SLOTS)

  // 状态
  const currentSlot = ref<TimeFlowSlot>(getCurrentSlotByTime())
  const activeSlot = ref<TimeFlowSlot>(currentSlot.value)
  const productsBySlot = ref<Record<TimeFlowSlot, Product[]>>({})

  // 加载状态
  const loadingSlots = ref<Set<TimeFlowSlot>>(new Set())
  const errorSlots = ref<Record<TimeFlowSlot, string>>({})

  // Actions
  async function loadSlotProducts(slot: TimeFlowSlot) { ... }
  function setActiveSlot(slot: TimeFlowSlot) { ... }

  // Getters
  const currentProducts = computed(() => productsBySlot.value[activeSlot.value] ?? [])

  return { ... }
})
```

---

## 8. 自动定位实现

### 研究问题

用户进入首页时如何平滑滚动到当前时段？

### 实现方案

```typescript
// HomeView.vue
onMounted(async () => {
  const timeflowStore = useTimeFlowStore()

  // 1. 计算当前时段
  const currentSlot = timeflowStore.currentSlot

  // 2. 等待 DOM 渲染完成
  await nextTick()

  // 3. 滚动到对应 section
  const sectionEl = document.getElementById(`timeflow-${currentSlot}`)
  if (sectionEl) {
    sectionEl.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  // 4. 加载当前时段商品（优先）
  await timeflowStore.loadSlotProducts(currentSlot)

  // 5. 预加载相邻时段（延迟）
  setTimeout(() => {
    timeflowStore.preloadAdjacentSlots(currentSlot)
  }, 1000)
})
```

### 决策

**Decision**: 使用 `scrollIntoView` + `behavior: 'smooth'`

**Rationale**:
- 浏览器原生支持，无需第三方库
- 自动处理动画帧率
- 可通过 CSS `scroll-behavior: smooth` 全局配置

---

## 总结

本次研究确定了时间流动主题首页的技术实现方案：

1. **时段系统**: 新建 5 时段体系，与主题系统（2 时段）并存
2. **滚动监听**: 使用 Intersection Observer API
3. **视觉主题**: 扩展 CSS 变量系统，添加 `--timeflow-*` 前缀
4. **API 适配**: 复用现有推荐接口，前端负责时段映射
5. **组件架构**: Section-based 布局 + 独立导航组件
6. **性能优化**: 懒加载 + Intersection Observer + GPU 加速
7. **状态管理**: 新建 TimeFlowStore
8. **自动定位**: `scrollIntoView` 原生方案

所有技术选型均优先复用现有系统，保持代码一致性和可维护性。
