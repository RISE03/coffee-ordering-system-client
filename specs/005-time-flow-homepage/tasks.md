# Tasks: 时间流动主题首页（Time Flow Homepage）

**Input**: Design documents from `/specs/005-time-flow-homepage/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: 不包含测试任务（规格说明未明确要求 TDD）

**Organization**: 任务按用户故事组织，支持独立实现和测试

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 所属用户故事（US1, US2, US3, US4）
- 描述中包含确切的文件路径

## Path Conventions

- **项目结构**: `src/` 为源码目录，遵循 Vue 3 + TypeScript 标准结构
- 详细路径参见 plan.md 的 Project Structure 部分

---

## Phase 1: Setup（项目初始化）

**Purpose**: 创建时间流功能所需的基础类型和常量

- [x] T001 [P] 创建时间流类型定义文件 `src/types/timeflow.ts`，包含 TimeFlowSlot、TimeFlowColors、TimeFlowConfig 类型
- [x] T002 [P] 创建时间流常量配置文件 `src/constants/timeflow.ts`，包含 TIME_FLOW_SLOTS 5 时段完整配置数据
- [x] T003 [P] 扩展 `src/style.css`，添加 5 个时段的 CSS 变量类 `.timeflow-morning`、`.timeflow-noon`、`.timeflow-afternoon`、`.timeflow-evening`、`.timeflow-night`

---

## Phase 2: Foundational（基础设施）

**Purpose**: 核心状态管理和工具函数，所有用户故事的前置依赖

**⚠️ CRITICAL**: 必须完成此阶段后才能开始用户故事实现

- [x] T004 创建时段判断 Composable `src/composables/useTimeSlot.ts`，实现 getSlotByHour()、getCurrentSlot() 函数
- [x] T005 创建滚动监听 Composable `src/composables/useScrollSpy.ts`，使用 Intersection Observer 实现 activeSection 状态追踪
- [x] T006 创建时间流 Pinia Store `src/stores/timeflow.ts`，包含 currentSlot、activeSlot、productsBySlot、loadingSlots、errorSlots 状态及 loadSlotProducts()、setActiveSlot()、preloadAdjacentSlots() Actions

**Checkpoint**: 基础设施就绪，可开始用户故事实现

---

## Phase 3: User Story 1 - 浏览时间线发现当前时段推荐 (Priority: P1) 🎯 MVP

**Goal**: 用户打开首页时自动看到当前时段的饮品推荐和氛围

**Independent Test**: 在不同时间访问首页，验证系统正确显示对应时段的推荐内容和视觉效果

### Implementation for User Story 1

- [x] T007 [P] [US1] 创建时段区块组件 `src/components/home/TimeFlowSection.vue`，接收 slot config 和 products 渲染单个时段内容区域
- [x] T008 [P] [US1] 创建时段商品卡片组件 `src/components/home/TimeSlotCard.vue`，显示商品图片、名称、价格，支持时段主题配色
- [x] T009 [US1] 重构首页视图 `src/views/HomeView.vue`，替换原有布局为 TimeFlowSection 循环渲染 5 个时段
- [x] T010 [US1] 在 HomeView 中实现自动定位逻辑，页面加载后使用 scrollIntoView 滚动到当前时段
- [x] T011 [US1] 在 HomeView 中调用 timeflowStore.loadSlotProducts() 加载当前时段商品数据
- [x] T012 [US1] 在 TimeFlowSection 中添加加载状态骨架屏和错误状态（显示重试按钮）

**Checkpoint**: 用户可访问首页看到当前时段内容，此时 MVP 已可用

---

## Phase 4: User Story 2 - 探索完整时间线 (Priority: P2)

**Goal**: 用户能浏览完整的一日时间线，了解不同时段的饮品文化和氛围特色

**Independent Test**: 通过滚动或点击导航，验证用户能顺畅浏览所有时段内容

### Implementation for User Story 2

- [x] T013 [P] [US2] 创建时间线导航组件 `src/components/home/TimelineNav.vue`，显示 5 个时段指示器，支持 activeSlot 高亮
- [x] T014 [US2] 在 TimelineNav 中实现点击导航功能，点击时段指示器触发 scrollIntoView 平滑滚动到对应区域
- [x] T015 [US2] 在 HomeView 中集成 useScrollSpy，滚动时自动更新 timeflowStore.activeSlot
- [x] T016 [US2] 在 HomeView 中集成 TimelineNav 组件，传递 slots 和 activeSlot，监听 navigate 事件
- [x] T017 [US2] 为 TimeFlowSection 添加时段切换过渡动画效果（CSS transition 或 Vue transition）
- [x] T018 [US2] 实现相邻时段预加载逻辑，当用户滚动到某时段时自动加载上下相邻时段商品

**Checkpoint**: 用户可流畅浏览完整时间线，导航与内容同步

---

## Phase 5: User Story 3 - 从时段推荐进入商品详情或下单 (Priority: P1)

**Goal**: 用户能从时段推荐的饮品直接进入商品详情或加入购物车

**Independent Test**: 点击推荐饮品卡片，验证能正确跳转到商品详情页或成功加入购物车

### Implementation for User Story 3

- [x] T019 [US3] 在 TimeSlotCard 中添加点击卡片跳转商品详情功能，使用 router.push(`/product/${id}`)
- [x] T020 [US3] 在 TimeSlotCard 中添加「加入购物车」按钮，点击时调用 cartStore.addItem()
- [x] T021 [US3] 在 TimeSlotCard 中处理未登录状态，点击加购按钮时提示登录或跳转登录页
- [x] T022 [US3] 在 TimeSlotCard 中添加加购成功/失败的消息提示（使用 NMessage）

**Checkpoint**: 用户可从首页完成「浏览推荐 → 加入购物车」完整流程

---

## Phase 6: User Story 4 - 查看时段专属优惠 (Priority: P3)

**Goal**: 用户能看到当前时段的专属优惠活动

**Independent Test**: 在有活动配置的时段访问首页，验证正确显示时段专属优惠信息

### Implementation for User Story 4

- [x] T023 [P] [US4] 在 TimeFlowConfig 类型中添加可选的 promotion 字段 `src/types/timeflow.ts`
- [x] T024 [P] [US4] 在 TIME_FLOW_SLOTS 常量中为部分时段添加示例优惠配置 `src/constants/timeflow.ts`
- [x] T025 [US4] 在 TimeFlowSection 中添加优惠横幅区域，当 slot.promotion 存在时显示优惠标签
- [x] T026 [US4] 为优惠横幅添加样式，与时段主题配色协调

**Checkpoint**: 优惠信息正确显示，无优惠时布局正常

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 跨用户故事的优化和收尾

- [x] T027 [P] 性能优化：为商品图片添加 loading="lazy" 属性
- [x] T028 [P] 性能优化：为 TimeFlowSection 添加 will-change: transform CSS 优化滚动性能
- [x] T029 清理：移除旧版首页相关的未使用代码和组件（如确认不再需要）
- [x] T030 验证：运行 quickstart.md 中的验证步骤，确保所有功能正常

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，可立即开始
- **Foundational (Phase 2)**: 依赖 Phase 1 完成 → **阻塞所有用户故事**
- **User Stories (Phase 3-6)**: 依赖 Phase 2 完成
  - US1 (Phase 3) 和 US3 (Phase 5) 均为 P1 优先级
  - US2 (Phase 4) 为 P2 优先级
  - US4 (Phase 6) 为 P3 优先级
- **Polish (Phase 7)**: 依赖所有用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Phase 2 完成后可开始 - 无其他故事依赖
- **User Story 2 (P2)**: Phase 2 完成后可开始 - 需要 US1 的 TimeFlowSection 组件
- **User Story 3 (P1)**: Phase 2 完成后可开始 - 需要 US1 的 TimeSlotCard 组件
- **User Story 4 (P3)**: Phase 2 完成后可开始 - 需要 US1 的 TimeFlowSection 组件

**推荐执行顺序**: US1 → US3 → US2 → US4（先完成 P1 核心功能）

### Within Each User Story

- 组件创建（标记 [P]）可并行
- 集成任务依赖组件创建完成
- 状态连接任务在组件集成后进行

### Parallel Opportunities

- Phase 1: T001, T002, T003 可并行执行
- Phase 3 (US1): T007, T008 可并行执行
- Phase 5 (US3): 依赖 T008 (TimeSlotCard)，需顺序执行
- Phase 6 (US4): T023, T024 可并行执行
- Phase 7: T027, T028 可并行执行

---

## Parallel Example: Phase 1 Setup

```bash
# 启动所有 Setup 任务（可并行）:
Task: "创建时间流类型定义文件 src/types/timeflow.ts"
Task: "创建时间流常量配置文件 src/constants/timeflow.ts"
Task: "扩展 src/style.css 添加时段 CSS 变量"
```

## Parallel Example: User Story 1

```bash
# 启动组件创建任务（可并行）:
Task: "创建时段区块组件 src/components/home/TimeFlowSection.vue"
Task: "创建时段商品卡片组件 src/components/home/TimeSlotCard.vue"

# 组件完成后，顺序执行集成任务:
Task: "重构首页视图 src/views/HomeView.vue"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational（关键 - 阻塞所有故事）
3. 完成 Phase 3: User Story 1
4. **STOP and VALIDATE**: 独立测试 US1
5. 可部署/演示 MVP

### Incremental Delivery

1. Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示 (MVP!)
3. 添加 User Story 3 → 独立测试 → 部署/演示（完成购物转化路径）
4. 添加 User Story 2 → 独立测试 → 部署/演示（完成浏览体验）
5. 添加 User Story 4 → 独立测试 → 部署/演示（增强功能）
6. 每个故事独立增加价值，不破坏已有功能

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 (US1)**

用户能够：
- 访问首页看到当前时段
- 看到该时段的推荐饮品
- 体验时段专属的视觉氛围

---

## Notes

- [P] 任务 = 不同文件，无依赖
- [Story] 标签映射任务到特定用户故事以便追踪
- 每个用户故事应可独立完成和测试
- 每完成一个任务或逻辑组后提交 git commit
- 可在任意 Checkpoint 停止验证故事独立性
- 避免：模糊任务、同文件冲突、破坏独立性的跨故事依赖
