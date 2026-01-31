# Implementation Plan: 时间流动主题首页（Time Flow Homepage）

**Branch**: `005-time-flow-homepage` | **Date**: 2026-01-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-time-flow-homepage/spec.md`

## Summary

将「朝暮」咖啡厅首页从传统商品列表布局改造为沉浸式「时间流动」体验。用户进入首页后看到从清晨到深夜的时间线，包含 5 个时段（晨曦时光、午间活力、午后漫时、暮色降临、夜幕低垂），每个时段有独特的视觉氛围、推荐饮品和文案。系统根据本地时间自动定位到当前时段，用户可通过滚动或导航浏览完整时间线。

技术方案：基于现有 Vue 3 组件架构，利用已有的主题系统（CSS 变量 + data-theme）、ProductStore 推荐逻辑、以及 Naive UI 组件库，新增时间线布局组件和滚动监听机制。

## Technical Context

**Language/Version**: TypeScript ~5.9.3, Vue 3.5.24 (Composition API + `<script setup>`)
**Primary Dependencies**: Vite 7.2.4, Naive UI 2.43.2, Pinia 3.0.4, Vue Router 4.6.3, Axios 1.13.2, Tailwind CSS 4.1.17
**Storage**: N/A（前端仅调用后端 API）
**Testing**: Vitest 4.0.14 + @vue/test-utils 2.4.6
**Target Platform**: 现代浏览器（PC 端优先）
**Project Type**: Web (SPA)
**Performance Goals**: 首屏时间线框架 < 3s, 时段切换动画 60fps, 滚动流畅无卡顿
**Constraints**: < 200ms 时段切换响应, 懒加载图片, 节流滚动事件
**Scale/Scope**: 5 个时段, 每时段 3-6 个推荐商品, 单页应用首页改造

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

> Constitution 文件尚未配置（仍为模板状态），无显式约束门禁。
>
> **Status**: ✅ PASSED (无约束定义)

## Project Structure

### Documentation (this feature)

```text
specs/005-time-flow-homepage/
├── plan.md              # 本文件 (/speckit.plan command output)
├── research.md          # Phase 0 output - 技术研究
├── data-model.md        # Phase 1 output - 数据模型
├── quickstart.md        # Phase 1 output - 快速入门
├── contracts/           # Phase 1 output - API 合约
│   └── time-slots.yaml  # 时段推荐 API 合约
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── api/
│   └── products.ts              # [扩展] 时段推荐 API 调用
│
├── components/
│   ├── home/
│   │   ├── TimeFlowSection.vue  # [新增] 单个时段区块组件
│   │   ├── TimelineNav.vue      # [新增] 时间线导航组件
│   │   ├── TimeSlotCard.vue     # [新增] 时段推荐商品卡片
│   │   └── HeroBanner.vue       # [保留] 可选复用
│   └── common/
│       └── ScrollProgress.vue   # [新增] 滚动进度指示器
│
├── views/
│   └── HomeView.vue             # [重构] 时间流首页主视图
│
├── stores/
│   └── timeflow.ts              # [新增] 时间流状态管理
│
├── types/
│   └── timeflow.ts              # [新增] 时间流类型定义
│
├── composables/
│   ├── useScrollSpy.ts          # [新增] 滚动监听 Composable
│   └── useTimeSlot.ts           # [新增] 时段判断 Composable
│
└── style.css                    # [扩展] 时段专属配色变量

tests/
├── unit/
│   ├── stores/timeflow.spec.ts  # 时间流 Store 单元测试
│   └── composables/             # Composable 单元测试
└── components/
    └── home/                    # 时间流组件测试
```

**Structure Decision**: 采用 Web 单项目结构，在现有 `src/` 目录下扩展。新增组件集中在 `components/home/` 目录，新增 Store 和类型分别放入对应目录。遵循现有的模块化设计模式。

## Complexity Tracking

> 无 Constitution 违规，此部分留空。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| - | - | - |
