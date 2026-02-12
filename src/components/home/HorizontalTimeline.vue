<script setup lang="ts">
import { computed } from 'vue'
import type { TimeFlowConfig, TimeFlowSlot } from '@/types/timeflow'
import { TIME_FLOW_SLOT_CODES } from '@/types/timeflow'
import { useThemeStore } from '@/stores/theme'
import { useTimeFlowStore } from '@/stores/timeflow'

interface Props {
  /** 所有时段配置 */
  slots: TimeFlowConfig[]
  /** 当前活跃时段（用户选中的） */
  activeSlot: TimeFlowSlot
  /** 当前真实时段（根据时间计算的） */
  currentSlot: TimeFlowSlot
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'navigate', slotCode: TimeFlowSlot): void
}>()

const themeStore = useThemeStore()
const timeflowStore = useTimeFlowStore()

function handleClick(slotCode: TimeFlowSlot) {
  emit('navigate', slotCode)
}

function isActive(code: TimeFlowSlot): boolean {
  return code === props.activeSlot
}

function isCurrent(code: TimeFlowSlot): boolean {
  return code === props.currentSlot
}

/** 获取时段在列表中的索引 */
function getSlotIndex(code: TimeFlowSlot): number {
  return TIME_FLOW_SLOT_CODES.indexOf(code)
}

/** 判断时段是否已经过去（在当前时段之前） */
function isPast(code: TimeFlowSlot): boolean {
  return getSlotIndex(code) < getSlotIndex(props.currentSlot)
}

function getActiveTextColor(slot: TimeFlowConfig): string {
  if (themeStore.isDawn) {
    // evening 的 accent (#E8C78B) 在浅色背景上对比度不足，用更深的棕色
    return slot.code === 'evening' ? '#B8860B' : slot.colors.accent
  }
  return slot.colors.primary
}

/** 当前时段的进度和剩余时间 */
const currentSlotProgress = computed(() => {
  const slot = props.slots.find(s => s.code === props.currentSlot)
  if (!slot) return { progress: 0, remainingMinutes: 0 }

  const now = timeflowStore.currentTime
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const startHour = slot.hours[0]
  const endHour = slot.hours[1]

  let startMinutes = startHour * 60
  let endMinutes = endHour * 60

  if (endHour <= startHour) {
    if (currentMinutes >= startMinutes) {
      endMinutes += 24 * 60
    } else {
      startMinutes -= 24 * 60
    }
  }

  const totalDuration = endMinutes - startMinutes
  const elapsed = currentMinutes - startMinutes
  const remaining = endMinutes - currentMinutes

  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))

  return {
    progress,
    remainingMinutes: Math.max(0, remaining)
  }
})

const remainingTimeText = computed(() => {
  const mins = currentSlotProgress.value.remainingMinutes
  if (mins >= 60) {
    const hours = Math.floor(mins / 60)
    const minutes = mins % 60
    return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`
  }
  return `${mins}分钟`
})

/**
 * 高亮进度线的宽度百分比
 * 5 个节点均匀分布在 0%, 25%, 50%, 75%, 100%
 * 填充到：当前时段节点位置 + 时段内进度 * 到下一节点的距离
 */
const trackFillPercent = computed(() => {
  const currentIndex = getSlotIndex(props.currentSlot)
  const totalSegments = TIME_FLOW_SLOT_CODES.length - 1 // 4 段
  const segmentPercent = 100 / totalSegments // 每段 25%

  // 已完成的整段 + 当前段内的进度
  const basePercent = currentIndex * segmentPercent
  const withinSegment = (currentSlotProgress.value.progress / 100) * segmentPercent

  return Math.min(100, basePercent + withinSegment)
})

/** 当前时段的主题色（用于高亮线） */
const currentSlotColor = computed(() => {
  const slot = props.slots.find(s => s.code === props.currentSlot)
  return slot?.colors.primary ?? 'var(--color-text-secondary)'
})
</script>

<template>
  <nav class="horizontal-timeline" aria-label="时间线导航">
    <!-- 连接线：底层轨道 -->
    <div class="timeline-track">
      <!-- 上层高亮填充线 -->
      <div
        class="timeline-track-fill"
        :style="{
          width: trackFillPercent + '%',
          background: currentSlotColor
        }"
      />
    </div>

    <!-- 时段节点 -->
    <div class="timeline-nodes">
      <div
        v-for="slot in slots"
        :key="slot.code"
        class="timeline-node"
        :class="{
          'is-active': isActive(slot.code),
          'is-current': isCurrent(slot.code),
          'is-past': isPast(slot.code)
        }"
        @click="handleClick(slot.code)"
      >
        <!-- 时段名称 -->
        <span
          class="node-label"
          :class="{ 'is-active': isActive(slot.code) }"
          :style="{
            fontWeight: isActive(slot.code) ? '600' : '400',
            color: isActive(slot.code) || isPast(slot.code) || isCurrent(slot.code)
              ? getActiveTextColor(slot)
              : 'var(--color-text-secondary)'
          }"
        >
          {{ slot.name }}
        </span>

        <!-- 圆点指示器 -->
        <div class="node-indicator">
          <div
            class="node-dot"
            :style="{
              backgroundColor: isCurrent(slot.code) || isPast(slot.code)
                ? slot.colors.primary
                : isActive(slot.code)
                  ? slot.colors.primary
                  : 'var(--color-text-secondary)',
              boxShadow: isCurrent(slot.code)
                ? `0 0 14px ${slot.colors.primary}, 0 0 6px ${slot.colors.primary}`
                : isActive(slot.code)
                  ? `0 0 10px ${slot.colors.primary}`
                  : 'none'
            }"
            :class="{
              'dot-current': isCurrent(slot.code),
              'dot-active': isActive(slot.code) && !isCurrent(slot.code),
              'dot-past': isPast(slot.code) && !isActive(slot.code)
            }"
          />
        </div>

        <!-- 当前时段：剩余时间 -->
        <span
          v-if="isCurrent(slot.code)"
          class="remaining-time"
          :style="{ color: getActiveTextColor(slot) }"
        >
          还有 {{ remainingTimeText }}
        </span>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.horizontal-timeline {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 1.5rem 1rem;
  margin: 1rem 0;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 1rem;
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.horizontal-timeline:hover {
  background: var(--glass-bg-hover);
  box-shadow: var(--glass-shadow-hover);
}

/* 连接线轨道（底层暗淡线） */
.timeline-track {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 600px;
  height: 3px;
  background: var(--glass-border-subtle);
  border-radius: 2px;
  overflow: hidden;
}

/* 高亮填充线（上层） */
.timeline-track-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 1s ease;
  box-shadow: 0 0 8px currentColor;
  opacity: 0.85;
}

/* 节点容器 */
.timeline-nodes {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 80%;
  max-width: 600px;
  position: relative;
  z-index: 1;
}

/* 单个节点 */
.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.timeline-node:hover {
  transform: translateY(-2px);
}
/* 指示器容器 */
.node-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

/* 圆点基础样式 */
.node-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

/* 已过时段圆点 */
.dot-past {
  width: 12px;
  height: 12px;
  opacity: 0.8;
}

/* 选中态（非当前时段） */
.dot-active {
  width: 16px;
  height: 16px;
}

/* 当前时段圆点：放大 + 呼吸光晕 */
.dot-current {
  width: 18px;
  height: 18px;
  animation: current-glow 2.5s ease-in-out infinite;
}

@keyframes current-glow {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.85;
  }
}

/* 标签 */
.node-label {
  font-size: 0.875rem;
  white-space: nowrap;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.node-label.is-active {
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-size: 0.9375rem;
}

/* 剩余时间 */
.remaining-time {
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0.9;
}

/* 响应式 */
@media (max-width: 768px) {
  .horizontal-timeline {
    padding: 1rem 0.5rem;
    overflow-x: auto;
    justify-content: flex-start;
  }

  .timeline-track {
    width: 90%;
  }

  .timeline-nodes {
    width: 100%;
    min-width: 500px;
    padding: 0 1rem;
  }

  .node-label {
    font-size: 0.75rem;
  }

  .node-indicator {
    width: 28px;
    height: 28px;
  }

  .node-dot {
    width: 10px;
    height: 10px;
  }

  .dot-current {
    width: 14px;
    height: 14px;
  }

  .dot-active {
    width: 12px;
    height: 12px;
  }

  .remaining-time {
    font-size: 0.625rem;
  }
}
</style>