# 实施计划：按照方案 C 原始设计重构首页

## 背景

当前首页实现采用了**垂直滚动式**的时间线布局（5 个时段全部渲染，用户滚动浏览），但这与原始设计方案 C 的核心理念存在重大差异。

### 方案 C 原始设计要点

根据 `specs/refactoring-plan/Frontend Refactoring Ideas for the Homepage.md`：

```
┌─────────────────────────────────────────────────────┐
│  动态时间展示区                                       │
│  ☀️ 14:32  下午茶时光                                │
│  "慵懒的午后，来一杯拿铁如何？"                        │
├─────────────────────────────────────────────────────┤
│  时间轴导航                                          │
│  ◯────●────◯────◯────◯                             │
│  晨光   午后   暮色   深夜   全日                      │
│ (06-10)(10-14)(14-18)(18-22)(全部)                   │
├─────────────────────────────────────────────────────┤
│  当前时段精选（大图瀑布流）                            │
│  ┌────────────┐  ┌────────┐  ┌────────┐            │
│  │            │  │        │  │        │            │
│  │  主推商品   │  │ 商品2  │  │ 商品3  │            │
│  │  (大卡片)  │  │        │  │        │            │
│  └────────────┘  └────────┘  └────────┘            │
├─────────────────────────────────────────────────────┤
│  "日落倒计时：距离暮色模式还有 3小时42分"              │
└─────────────────────────────────────────────────────┘
```

**核心特征**：
1. **单屏切换式**：只显示当前选中时段的内容（类似 Tab 切换）
2. **动态时间展示区**：顶部显示实时时间 + 时段名称 + 情感化文案
3. **横向时间轴导航**：主要交互方式，点击切换时段
4. **非对称 Bento Grid 布局**：主推商品大卡片 + 辅助推荐小卡片
5. **日落/日出倒计时**：底部显示距离下一个主题切换的倒计时

### 当前实现 vs 方案 C

| 维度 | 方案 C 设计 | 当前实现 | 差异 |
|------|------------|---------|------|
| 交互模式 | 单屏切换（Tab） | 垂直滚动（Scroll） | ❌ 完全不同 |
| 时段显示 | 只显示当前时段 | 5 个时段全部渲染 | ❌ 完全不同 |
| 导航位置 | 横向时间轴（顶部/中部） | 竖向导航（右侧固定） | ❌ 位置和方向都不同 |
| 商品布局 | 非对称 Bento Grid | 对称 3 列网格 | ❌ 布局方式不同 |
| 动态时间展示 | 有（☀️ 14:32 + 文案） | 无 | ❌ 缺失 |
| 倒计时功能 | 有 | 无 | ❌ 缺失 |

## 改造目标

将当前的**垂直滚动式**首页改造为**单屏切换式**，完全符合方案 C 的原始设计。

## 技术方案

### 1. 核心架构调整

#### 1.1 移除滚动监听机制

**当前依赖**：
- `useScrollSpy` Composable（Intersection Observer）
- `watch(activeSection)` 监听滚动变化
- CSS Scroll Snap 样式

**改造后**：
- 移除 `useScrollSpy` 的使用
- 改为点击驱动的 `setActiveSlot()` 调用
- 移除滚动相关的 CSS

#### 1.2 单时段渲染

**当前实现**：
```vue
<TimeFlowSection
  v-for="slot in timeflowStore.slots"
  :key="slot.code"
  ...
/>
```

**改造后**：
```vue
<TimeFlowSection
  :slot="currentDisplaySlot"
  :products="timeflowStore.productsBySlot[currentDisplaySlot.code]"
  ...
/>
```

只渲染当前选中的时段，通过 `v-if` 或计算属性控制。

### 2. 新增组件

#### 2.1 动态时间展示区（DynamicTimeHeader.vue）

**位置**：`src/components/home/DynamicTimeHeader.vue`

**功能**：
- 显示实时时间（如 `☀️ 14:32`）
- 显示当前时段名称（如 "下午茶时光"）
- 显示情感化文案（如 "慵懒的午后，来一杯拿铁如何？"）
- 根据时段动态更新图标和配色

**数据来源**：
- 使用 `useTimeSlot` 获取当前时段
- 从 `TIME_FLOW_SLOTS` 配置中获取文案

#### 2.2 横向时间轴导航（HorizontalTimeline.vue）

**位置**：`src/components/home/HorizontalTimeline.vue`

**功能**：
- 横向展示 5 个时段节点（晨曦、午间、午后、暮色、夜幕）
- 节点之间有连接线
- 当前选中时段高亮（实心圆点，带发光效果）
- 其他时段为空心圆点或半透明圆点
- 当前真实时段有特殊标记（如脉冲动画）
- 点击切换时段

**布局**：
- 位置：顶部，放在动态时间展示区下方
- 水平居中
- 响应式：移动端可能需要横向滚动或简化显示

**Props**：
- `slots: TimeFlowConfig[]` - 所有时段配置
- `activeSlot: TimeFlowSlot` - 当前选中时段
- `currentSlot: TimeFlowSlot` - 当前真实时段

**Emits**：
- `navigate(slotCode: TimeFlowSlot)` - 切换时段

#### 2.3 日落倒计时组件（ThemeCountdown.vue）

**位置**：`src/components/home/ThemeCountdown.vue`

**功能**：
- 计算距离下一个主题切换（朝/暮）的时间
- 显示倒计时（如 "距离暮色模式还有 3小时42分"）
- 每分钟更新一次

**逻辑**：
- 朝模式（06:00-17:59）→ 暮模式（18:00）
- 暮模式（18:00-05:59）→ 朝模式（06:00）

#### 2.4 Bento Grid 商品布局（BentoProductGrid.vue）

**位置**：`src/components/home/BentoProductGrid.vue`

**功能**：
- 非对称布局：1 个主推商品大卡片 + 2 个辅助推荐小卡片（共 3 个商品）
- 主推商品占据更大面积（2x2 网格单元）
- 辅助推荐商品占据较小面积（各 1x1 网格单元）

**布局示例**（CSS Grid）：
```
┌────────────┬────────┐
│            │ 商品2  │
│  主推商品   ├────────┤
│  (大卡片)  │ 商品3  │
└────────────┴────────┘
```

**Props**：
- `products: Product[]` - 商品列表（取前 3 个）
- `slotColors: TimeFlowColors` - 时段配色
- `loading: boolean` - 加载状态
- `error: string | null` - 错误信息

**Emits**：
- `add-to-cart(productId)` - 加入购物车
- `view-detail(productId)` - 查看详情
- `retry()` - 重试加载

### 3. 重构现有组件

#### 3.1 HomeView.vue

**主要改动**：

1. **移除滚动监听**：
```typescript
// 删除
const { activeSection, scrollToSection } = useScrollSpy(...)
watch(activeSection, ...)
```

2. **改为单时段渲染**：
```vue
<template>
  <div class="timeflow-home">
    <!-- 动态时间展示区 -->
    <DynamicTimeHeader />

    <!-- 横向时间轴导航 -->
    <HorizontalTimeline
      :slots="timeflowStore.slots"
      :active-slot="timeflowStore.activeSlot"
      :current-slot="timeflowStore.currentSlot"
      @navigate="handleNavigate"
    />

    <!-- 当前时段内容（单个） -->
    <Transition name="slide-fade" mode="out-in">
      <div :key="timeflowStore.activeSlot" class="timeflow-content">
        <!-- 时段头部 -->
        <div class="timeflow-section-header">
          <h2>{{ currentSlotConfig.name }}</h2>
          <p>{{ currentSlotConfig.slogan }}</p>
          <p>{{ currentSlotConfig.description }}</p>
        </div>

        <!-- Bento Grid 商品布局 -->
        <BentoProductGrid
          :products="timeflowStore.productsBySlot[timeflowStore.activeSlot]"
          :slot-colors="currentSlotConfig.colors"
          :loading="timeflowStore.isSlotLoading(timeflowStore.activeSlot)"
          :error="timeflowStore.getSlotError(timeflowStore.activeSlot)"
          @add-to-cart="handleAddToCart"
          @view-detail="handleViewDetail"
          @retry="handleRetry"
        />
      </div>
    </Transition>

    <!-- 日落倒计时 -->
    <ThemeCountdown />
  </div>
</template>
```

3. **导航点击处理**：
```typescript
function handleNavigate(slotCode: TimeFlowSlot) {
  // 不再需要滚动，直接切换
  timeflowStore.setActiveSlot(slotCode)
  timeflowStore.loadSlotProducts(slotCode)
  timeflowStore.preloadAdjacentSlots(slotCode)
}
```

4. **初始化流程**：
```typescript
onMounted(async () => {
  await timeflowStore.initialize()
  // 不再需要滚动到当前时段
})
```

#### 3.2 TimelineNav.vue

**选项 1：重构为横向导航**
- 改为横向布局
- 移动到页面中部或顶部
- 调整样式和交互

**选项 2：废弃并使用新组件**
- 创建新的 `HorizontalTimeline.vue`
- 删除或保留 `TimelineNav.vue` 作为备用

**推荐**：选项 2，创建新组件更清晰

#### 3.3 TimeFlowSection.vue

**改动**：
- 移除 `min-height: 100vh` 样式（不再需要全屏高度）
- 移除 `scroll-snap-align` 样式
- 保留时段头部和商品展示逻辑
- 可能需要调整布局以适配单屏显示

**或者**：
- 将 `TimeFlowSection.vue` 的内容拆分到 `HomeView.vue` 中
- 只保留商品网格部分作为独立组件

#### 3.4 TimeSlotCard.vue

**改动**：
- 基本保持不变
- 可能需要调整尺寸以适配 Bento Grid 布局
- 添加 `size` prop（如 `large` / `small`）

### 4. 样式调整

#### 4.1 移除滚动相关样式

**删除**（`src/style.css` 第 578-583 行）：
```css
.timeflow-container {
  scroll-snap-type: y mandatory;
  overflow-y: auto;
  height: 100vh;
  scroll-behavior: smooth;
}
```

**删除**（第 525-532 行）：
```css
.timeflow-section {
  min-height: 100vh;
  scroll-snap-align: start;
  ...
}
```

#### 4.2 新增单屏布局样式

```css
.timeflow-home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.timeflow-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
```

#### 4.3 Bento Grid 布局样式

```css
.bento-grid {
  display: grid;
  grid-template-columns: 2fr 1fr; /* 左侧2份，右侧1份 */
  grid-template-rows: 1fr 1fr;    /* 上下各1份 */
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.bento-item-large {
  grid-column: 1;
  grid-row: 1 / 3; /* 占据两行 */
  min-height: 400px;
}

.bento-item-small {
  grid-column: 2;
  min-height: 190px;
}

/* 响应式：移动端改为单列 */
@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  .bento-item-large,
  .bento-item-small {
    grid-column: 1;
    grid-row: auto;
  }
}
```

### 5. 状态管理调整

#### 5.1 Store 保持不变

`useTimeFlowStore` 的状态和 Actions 基本不需要改动：
- `currentSlot`：当前真实时段
- `activeSlot`：当前选中时段
- `productsBySlot`：各时段商品
- `loadSlotProducts()`：加载商品
- `setActiveSlot()`：切换时段

#### 5.2 新增 Getter（可选）

```typescript
// 获取当前显示时段的配置
const currentDisplaySlotConfig = computed(() => {
  return TIME_FLOW_SLOTS.find(s => s.code === activeSlot.value)
})
```

### 6. 过渡动画

#### 6.1 时段切换动画

使用 Vue 的 `<Transition>` 组件：

```vue
<Transition name="slide-fade" mode="out-in">
  <div :key="activeSlot">
    <!-- 时段内容 -->
  </div>
</Transition>
```

```css
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
```

## 实施步骤

### Phase 1: 创建新组件（可并行）

1. **T1**: 创建 `DynamicTimeHeader.vue`
   - 文件路径：`src/components/home/DynamicTimeHeader.vue`
   - 显示实时时间（格式：`☀️ 14:32`）
   - 显示当前时段名称（如 "下午茶时光"）
   - 显示情感化文案（从时段配置的 `slogan` 字段获取）
   - 使用 `useTimeSlot` 获取当前时段
   - 每分钟更新一次时间（使用 `setInterval`）
   - 根据时段动态更新图标（晨曦用太阳、夜幕用月亮等）
   - 应用时段配色（背景渐变、文字颜色）

2. **T2**: 创建 `HorizontalTimeline.vue`
   - 文件路径：`src/components/home/HorizontalTimeline.vue`
   - 横向时间轴导航，5 个时段节点
   - 节点之间有连接线（使用伪元素或 SVG）
   - 当前选中时段：实心圆点 + 发光效果（box-shadow）
   - 其他时段：半透明圆点
   - 当前真实时段：额外的脉冲动画边框
   - 悬停显示时段名称（Tooltip）
   - 点击触发 `navigate` 事件
   - 响应式：移动端简化显示或横向滚动

3. **T3**: 创建 `ThemeCountdown.vue`
   - 文件路径：`src/components/home/ThemeCountdown.vue`
   - 计算距离下一个主题切换的时间
     - 朝模式（06:00-17:59）→ 暮模式（18:00）
     - 暮模式（18:00-05:59）→ 朝模式（06:00）
   - 显示倒计时文案（如 "距离暮色模式还有 3小时42分"）
   - 每分钟更新一次（使用 `setInterval`）
   - 样式：玻璃拟态卡片，居中显示
   - 可选：添加进度条或圆环进度指示器

4. **T4**: 创建 `BentoProductGrid.vue`
   - 文件路径：`src/components/home/BentoProductGrid.vue`
   - Bento Grid 布局：1 大 + 2 小（共 3 个商品）
   - 使用 CSS Grid：`grid-template-columns: 2fr 1fr`
   - 主推商品（第 1 个）：占据左侧 2 行（`grid-row: 1 / 3`）
   - 辅助推荐（第 2、3 个）：占据右侧上下各 1 行
   - 复用 `TimeSlotCard.vue`，添加 `size` prop（`large` / `small`）
   - 处理加载状态：显示 3 个骨架屏（大小对应布局）
   - 处理错误状态：显示错误信息和重试按钮
   - 处理空状态：显示"暂无推荐"
   - 响应式：移动端改为单列布局

### Phase 2: 重构 HomeView.vue

5. **T5**: 重构 `HomeView.vue`
   - 文件路径：`src/views/HomeView.vue`

   **移除部分**：
   - 删除 `useScrollSpy` 的导入和使用
   - 删除 `watch(activeSection, ...)` 监听
   - 删除 `scrollToSection()` 函数
   - 删除 `scrollToCurrentSlot()` 函数
   - 删除 `v-for` 循环渲染 5 个 `TimeFlowSection`

   **新增部分**：
   - 导入新组件：`DynamicTimeHeader`、`HorizontalTimeline`、`ThemeCountdown`、`BentoProductGrid`
   - 计算属性：`currentDisplaySlotConfig`（获取当前选中时段的配置）
   - 单时段渲染：只渲染 `timeflowStore.activeSlot` 对应的内容
   - 使用 `<Transition>` 包裹时段内容，实现切换动画

   **布局结构**：
   ```vue
   <div class="timeflow-home">
     <!-- 动态时间展示区 -->
     <DynamicTimeHeader />

     <!-- 横向时间轴导航 -->
     <HorizontalTimeline
       :slots="timeflowStore.slots"
       :active-slot="timeflowStore.activeSlot"
       :current-slot="timeflowStore.currentSlot"
       @navigate="handleNavigate"
     />

     <!-- 当前时段内容（带过渡动画） -->
     <Transition name="slide-fade" mode="out-in">
       <div :key="timeflowStore.activeSlot" class="timeflow-content">
         <!-- 时段头部 -->
         <div class="timeflow-section-header">
           <h2>{{ currentDisplaySlotConfig.name }}</h2>
           <p>{{ currentDisplaySlotConfig.description }}</p>
           <!-- 时段专属优惠横幅（如果有） -->
           <div v-if="currentDisplaySlotConfig.promotion">...</div>
         </div>

         <!-- Bento Grid 商品布局 -->
         <BentoProductGrid
           :products="timeflowStore.productsBySlot[timeflowStore.activeSlot]"
           :slot-colors="currentDisplaySlotConfig.colors"
           :loading="timeflowStore.isSlotLoading(timeflowStore.activeSlot)"
           :error="timeflowStore.getSlotError(timeflowStore.activeSlot)"
           @add-to-cart="handleAddToCart"
           @view-detail="handleViewDetail"
           @retry="handleRetry"
         />
       </div>
     </Transition>

     <!-- 日落倒计时 -->
     <ThemeCountdown />
   </div>
   ```

   **逻辑调整**：
   - `handleNavigate(slotCode)`：直接调用 `timeflowStore.setActiveSlot(slotCode)`，不再滚动
   - `onMounted()`：只调用 `timeflowStore.initialize()`，不再滚动到当前时段

### Phase 3: 样式调整

6. **T6**: 调整 `src/style.css`
   - 文件路径：`src/style.css`

   **移除部分**（第 578-583 行）：
   ```css
   .timeflow-container {
     scroll-snap-type: y mandatory;
     overflow-y: auto;
     height: 100vh;
     scroll-behavior: smooth;
   }
   ```

   **移除部分**（第 525-532 行）：
   ```css
   .timeflow-section {
     min-height: 100vh;
     scroll-snap-align: start;
     ...
   }
   ```

   **新增部分**：
   ```css
   /* 单屏布局容器 */
   .timeflow-home {
     min-height: 100vh;
     display: flex;
     flex-direction: column;
     padding: 2rem;
     gap: 2rem;
   }

   /* 时段内容区域 */
   .timeflow-content {
     flex: 1;
     display: flex;
     flex-direction: column;
     justify-content: center;
     max-width: 1200px;
     margin: 0 auto;
     width: 100%;
   }

   /* 时段切换过渡动画 */
   .slide-fade-enter-active {
     transition: all 0.3s ease-out;
   }

   .slide-fade-leave-active {
     transition: all 0.2s ease-in;
   }

   .slide-fade-enter-from {
     opacity: 0;
     transform: translateX(30px);
   }

   .slide-fade-leave-to {
     opacity: 0;
     transform: translateX(-30px);
   }

   /* Bento Grid 布局 */
   .bento-grid {
     display: grid;
     grid-template-columns: 2fr 1fr;
     grid-template-rows: 1fr 1fr;
     gap: 1.5rem;
     max-width: 900px;
     margin: 0 auto;
   }

   .bento-item-large {
     grid-column: 1;
     grid-row: 1 / 3;
     min-height: 400px;
   }

   .bento-item-small {
     grid-column: 2;
     min-height: 190px;
   }

   /* 响应式 */
   @media (max-width: 768px) {
     .timeflow-home {
       padding: 1rem;
     }

     .bento-grid {
       grid-template-columns: 1fr;
       grid-template-rows: auto;
     }

     .bento-item-large,
     .bento-item-small {
       grid-column: 1;
       grid-row: auto;
       min-height: 300px;
     }
   }
   ```

### Phase 4: 组件清理与调整

7. **T7**: 清理和调整现有组件

   **7.1 TimeSlotCard.vue 调整**：
   - 文件路径：`src/components/home/TimeSlotCard.vue`
   - 添加 `size` prop：`'large' | 'small'`（默认 `'small'`）
   - 根据 `size` 调整卡片内部布局：
     - `large`：图片更大，信息更详细，可能显示完整描述
     - `small`：紧凑布局，只显示核心信息
   - 调整图片宽高比：大卡片可能用 3:4，小卡片用 4:3

   **7.2 废弃组件处理**：
   - `src/components/home/TimelineNav.vue`：
     - 选项 A：完全删除（推荐，因为已被 HorizontalTimeline 替代）
     - 选项 B：重命名为 `TimelineNav.vue.backup` 保留备份

   - `src/components/home/TimeFlowSection.vue`：
     - 选项 A：完全删除（推荐，功能已拆分到 HomeView 和 BentoProductGrid）
     - 选项 B：保留但不使用，以防需要回滚

   - `src/composables/useScrollSpy.ts`：
     - 选项 A：完全删除（推荐，不再需要滚动监听）
     - 选项 B：保留但注释说明已废弃

   **推荐方案**：先将这些文件重命名为 `.backup` 后缀，测试通过后再删除

### Phase 5: 测试与验证

8. **T8**: 功能测试
   - **时段切换测试**：
     - 点击横向时间轴的每个时段，验证内容正确切换
     - 验证切换动画流畅（slide-fade 效果）
     - 验证当前真实时段的标记正确显示

   - **动态时间展示测试**：
     - 验证顶部显示正确的时间（格式：☀️ 14:32）
     - 验证时段名称与当前真实时段匹配
     - 验证情感化文案正确显示
     - 等待 1 分钟，验证时间自动更新

   - **商品展示测试**：
     - 验证 Bento Grid 布局正确（1 大 + 2 小）
     - 验证主推商品（大卡片）显示在左侧
     - 验证辅助推荐（小卡片）显示在右侧上下
     - 点击商品卡片，验证跳转到详情页
     - 点击加购按钮，验证加入购物车功能
     - 未登录状态点击加购，验证提示登录

   - **倒计时功能测试**：
     - 验证底部显示倒计时文案
     - 验证倒计时时间计算正确
     - 等待 1 分钟，验证倒计时自动更新

   - **加载状态测试**：
     - 清空缓存，刷新页面，验证骨架屏显示
     - 验证加载完成后正确显示商品

   - **错误状态测试**：
     - 模拟 API 错误，验证错误提示显示
     - 点击重试按钮，验证重新加载

   - **响应式测试**：
     - 测试桌面端（1920x1080）：验证布局正常
     - 测试平板端（768x1024）：验证布局适配
     - 测试移动端（375x667）：验证单列布局，横向时间轴可滚动

9. **T9**: 性能优化与验证
   - **动画性能测试**：
     - 打开 Chrome DevTools Performance 面板
     - 录制时段切换操作
     - 验证帧率达到 60fps
     - 检查是否有布局抖动（Layout Shift）

   - **加载性能测试**：
     - 使用 Lighthouse 测试首屏加载时间
     - 验证首屏时间 < 3s
     - 验证时段切换响应时间 < 200ms

   - **内存泄漏检查**：
     - 多次切换时段，观察内存使用
     - 验证 `setInterval` 正确清理（DynamicTimeHeader、ThemeCountdown）

   - **优化措施**：
     - 确保商品图片使用 `loading="lazy"`
     - 确保过渡动画使用 `transform` 和 `opacity`（GPU 加速）
     - 确保未使用的组件正确卸载

## 关键文件清单

### 新增文件

- `src/components/home/DynamicTimeHeader.vue`
- `src/components/home/HorizontalTimeline.vue`
- `src/components/home/ThemeCountdown.vue`
- `src/components/home/BentoProductGrid.vue`

### 重构文件

- `src/views/HomeView.vue`（重大改动）
- `src/style.css`（移除滚动样式，添加新样式）

### 可能废弃的文件

- `src/components/home/TimelineNav.vue`（可能被 HorizontalTimeline.vue 替代）
- `src/components/home/TimeFlowSection.vue`（可能被拆分到 HomeView.vue）
- `src/composables/useScrollSpy.ts`（不再需要）

### 保持不变的文件

- `src/stores/timeflow.ts`
- `src/types/timeflow.ts`
- `src/constants/timeflow.ts`
- `src/composables/useTimeSlot.ts`
- `src/components/home/TimeSlotCard.vue`（可能需要添加 size prop）

## 验证方案

### 功能验证

1. **时段切换**：
   - 点击时间轴导航的不同时段，验证内容正确切换
   - 验证切换动画流畅

2. **动态时间展示**：
   - 验证顶部显示正确的时间和时段名称
   - 验证情感化文案与时段匹配

3. **商品展示**：
   - 验证 Bento Grid 布局正确（1 大 + 2-3 小）
   - 验证商品点击跳转详情页
   - 验证加入购物车功能

4. **倒计时功能**：
   - 验证倒计时文案正确
   - 验证倒计时每分钟更新

5. **响应式**：
   - 测试移动端、平板、桌面端的布局
   - 验证横向时间轴在小屏幕上的显示

### 性能验证

1. **动画性能**：
   - 使用 Chrome DevTools Performance 面板
   - 验证时段切换动画达到 60fps

2. **加载性能**：
   - 验证首屏加载时间 < 3s
   - 验证时段切换响应时间 < 200ms

### 视觉验证

1. **对比原始设计**：
   - 对照 `specs/refactoring-plan/Frontend Refactoring Ideas for the Homepage.md` 中的方案 C 布局示意图
   - 确保实现符合原始设计意图

2. **品牌一致性**：
   - 验证时段配色与品牌主题协调
   - 验证玻璃拟态效果正确应用

## 风险与注意事项

### 风险

1. **Bento Grid 布局复杂度**：
   - 非对称布局在响应式设计中可能较复杂
   - 需要仔细处理不同屏幕尺寸的适配

2. **动画性能**：
   - 时段切换时需要卸载和挂载大量 DOM
   - 需要优化以确保流畅

3. **用户体验变化**：
   - 从滚动式改为切换式，用户习惯可能需要适应
   - 需要确保导航清晰易用

### 注意事项

1. **保留旧代码**：
   - 在删除旧组件前，先确保新实现完全可用
   - 可以先注释掉旧代码，测试通过后再删除

2. **渐进式实施**：
   - 可以先在新分支上实现，测试通过后再合并
   - 避免一次性改动过大导致难以调试

3. **文档更新**：
   - 更新 `specs/005-time-flow-homepage/` 中的文档
   - 更新 `quickstart.md` 中的使用说明

## 用户确认的设计决策

1. **「全日」选项**：不需要，只保留 5 个时段切换
2. **Bento Grid 布局**：1 大 + 2 小（1 个主推商品大卡片 + 2 个辅助推荐小卡片，共 3 个商品）
3. **横向时间轴导航位置**：顶部（放在动态时间展示区下方）

## 最终布局结构

```
┌─────────────────────────────────────────────────────┐
│  动态时间展示区                                       │
│  ☀️ 14:32  下午茶时光                                │
│  "慵懒的午后，来一杯拿铁如何？"                        │
├─────────────────────────────────────────────────────┤
│  横向时间轴导航（顶部）                                │
│  ◯────●────◯────◯────◯                             │
│  晨曦   午间   午后   暮色   夜幕                      │
├─────────────────────────────────────────────────────┤
│  当前时段精选（Bento Grid: 1大+2小）                  │
│  ┌────────────┬────────┐                            │
│  │            │ 商品2  │                            │
│  │  主推商品   ├────────┤                            │
│  │  (大卡片)  │ 商品3  │                            │
│  └────────────┴────────┘                            │
├─────────────────────────────────────────────────────┤
│  "日落倒计时：距离暮色模式还有 3小时42分"              │
└─────────────────────────────────────────────────────┘
```

## 成功标准

1. ✅ 首页只显示当前选中的时段内容（单屏）
2. ✅ 顶部有动态时间展示区（实时时间 + 时段名称 + 文案）
3. ✅ 横向时间轴导航（顶部）可正常切换 5 个时段
4. ✅ 商品采用 Bento Grid 布局（1 大 + 2 小，共 3 个商品）
5. ✅ 底部有日落/日出倒计时功能
6. ✅ 时段切换动画流畅（60fps）
7. ✅ 响应式布局在各设备上正常显示
8. ✅ 所有原有功能（加购、跳转详情）正常工作
