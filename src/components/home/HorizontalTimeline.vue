<script setup lang="ts">
import { computed } from 'vue'
import type { TimeFlowConfig, TimeFlowSlot } from '@/types/timeflow'
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

// 主题状态
const themeStore = useThemeStore()

// 时间流 Store（使用统一的时间）
const timeflowStore = useTimeFlowStore()

function handleClick(slotCode: TimeFlowSlot) {
  emit('navigate', slotCode)
}

/**
 * 判断时段是否为活跃状态（用户选中的）
 */
function isActive(code: TimeFlowSlot): boolean {
  return code === props.activeSlot
}

/**
 * 判断时段是否为当前真实时段
 */
function isCurrent(code: TimeFlowSlot): boolean {
  return code === props.currentSlot
}

/**
 * 获取当前活跃时段的配置（用于动态配色）
 */
const activeSlotConfig = computed(() => {
  return props.slots.find(s => s.code === props.activeSlot)
})

/**
 * 获取选中态文字颜色
 * 浅色模式用 accent（更深），深色模式用 primary
 */
function getActiveTextColor(slot: TimeFlowConfig): string {
  return themeStore.isDawn ? slot.colors.accent : slot.colors.primary
}

/**
 * 计算当前时段的进度百分比和剩余时间
 */
const currentSlotProgress = computed(() => {
  const slot = props.slots.find(s => s.code === props.currentSlot)
  if (!slot) return { progress: 0, remainingMinutes: 0 }

  const now = timeflowStore.currentTime
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const startHour = slot.hours[0]
  const endHour = slot.hours[1]

  let startMinutes = startHour * 60
  let endMinutes = endHour * 60

  // 处理跨午夜的时段（如 night: 21-7）
  if (endHour <= startHour) {
    if (currentMinutes >= startMinutes) {
      // 当前在午夜前（如 21:00-23:59），结束时间是明天
      endMinutes += 24 * 60
    } else {
      // 当前在午夜后（如 00:00-06:59），开始时间是昨天
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

/**
 * 格式化剩余时间
 */
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
 * 计算 SVG 进度环的 stroke-dashoffset
 * 圆周长 = 2 * π * r，r = 14
 */
const progressCircumference = 2 * Math.PI * 14
const progressOffset = computed(() => {
  const progress = currentSlotProgress.value.progress / 100
  return progressCircumference * (1 - progress)
})
</script>

<template>
  <nav class="horizontal-timeline" aria-label="时间线导航">
    <!-- 连接线背景 -->
    <div class="timeline-track" />

    <!-- 时段节点 -->
    <div class="timeline-nodes">
      <div
        v-for="slot in slots"
        :key="slot.code"
        class="timeline-node"
        :class="{
          'is-active': isActive(slot.code),
          'is-current': isCurrent(slot.code)
        }"
        @click="handleClick(slot.code)"
      >
        <!-- 时段名称（移到上方） -->
        <span
          class="node-label"
          :class="{ 'is-active': isActive(slot.code) }"
          :style="{
            fontWeight: isActive(slot.code) ? '600' : '400',
            color: isActive(slot.code) ? getActiveTextColor(slot) : 'var(--color-text-secondary)'
          }"
        >
          {{ slot.name }}
        </span>

        <!-- 圆点指示器 / 进度环 -->
        <div class="node-indicator">
          <!-- 非当前时段：普通圆点 -->
          <div
            v-if="!isCurrent(slot.code)"
            class="node-dot"
            :style="{
              backgroundColor: isActive(slot.code)
                ? slot.colors.primary
                : 'var(--color-text-secondary)',
              boxShadow: isActive(slot.code)
                ? `0 0 12px ${slot.colors.primary}`
                : 'none'
            }"
          />

          <!-- 当前时段：进度环 -->
          <div v-else class="progress-ring-wrapper">
            <svg
              class="progress-ring"
              width="36"
              height="36"
              viewBox="0 0 36 36"
            >
              <!-- 背景圆环 -->
              <circle
                class="progress-ring-bg"
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke-width="3"
                :stroke="slot.colors.textSecondary + '40'"
              />
              <!-- 进度圆环 -->
              <circle
                class="progress-ring-fill"
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke-width="3"
                :stroke="slot.colors.primary"
                stroke-linecap="round"
                :stroke-dasharray="progressCircumference"
                :stroke-dashoffset="progressOffset"
              />
              <!-- 中心圆点（带呼吸动画） -->
              <circle
                class="center-dot"
                cx="18"
                cy="18"
                r="5"
                :fill="slot.colors.primary"
              />
            </svg>
          </div>
        </div>

        <!-- 当前时段：剩余时间 -->
        <span
          v-if="isCurrent(slot.code)"
          class="remaining-time"
          :style="{ color: slot.colors.primary }"
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
}

/* 连接线 */
.timeline-track {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 600px;
  height: 2px;
  background: var(--glass-border);
  border-radius: 1px;
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

/* 圆点（非当前时段） */
.node-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.timeline-node.is-active .node-dot {
  width: 18px;
  height: 18px;
  animation: dot-glow 2s ease-in-out infinite;
}

@keyframes dot-glow {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 进度环容器 */
.progress-ring-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 进度环 */
.progress-ring {
  transform: rotate(-90deg);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.progress-ring-fill {
  transition: stroke-dashoffset 0.5s ease;
  animation: ring-glow 2s ease-in-out infinite;
}

@keyframes ring-glow {
  0%, 100% {
    opacity: 1;
    filter: drop-shadow(0 0 2px currentColor);
  }
  50% {
    opacity: 0.7;
    filter: drop-shadow(0 0 6px currentColor);
  }
}

/* 中心圆点呼吸动画 */
.center-dot {
  animation: breathe 2s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% {
    r: 5;
    opacity: 1;
  }
  50% {
    r: 6;
    opacity: 0.8;
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

  .timeline-node.is-active .node-dot {
    width: 14px;
    height: 14px;
  }

  .progress-ring {
    width: 28px;
    height: 28px;
  }

  .remaining-time {
    font-size: 0.625rem;
  }
}
</style>
