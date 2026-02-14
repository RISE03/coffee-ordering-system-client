<template>
  <div class="order-progress" :class="{ 'order-progress--terminal': isTerminal }">
    <!-- 正常流程：点状步骤条 -->
    <template v-if="!isTerminal">
      <div class="progress-track">
        <!-- 背景轨道 -->
        <div class="track-bg" />
        <!-- 已完成轨道（动态宽度） -->
        <div class="track-fill" :style="{ width: fillPercent + '%' }" />
      </div>
      <div class="progress-steps">
        <div
          v-for="(step, i) in steps"
          :key="step.key"
          class="step"
          :class="{
            'step--done': i < currentIndex,
            'step--active': i === currentIndex,
            'step--pending': i > currentIndex,
          }"
        >
          <div class="step-dot">
            <svg v-if="i < currentIndex" class="step-check" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div v-else-if="i === currentIndex" class="step-pulse" />
          </div>
          <span class="step-label">{{ step.label }}</span>
        </div>
      </div>
    </template>

    <!-- 终态：已取消 / 退款 -->
    <div v-else class="terminal-indicator">
      <span class="terminal-icon">{{ terminalIcon }}</span>
      <span class="terminal-text">{{ terminalText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OrderStatus } from '@/types/order'

const props = defineProps<{ status: OrderStatus }>()

// 正常流程步骤
const steps = [
  { key: 'pay', label: '下单' },
  { key: 'confirm', label: '支付' },
  { key: 'make', label: '制作' },
  { key: 'pickup', label: '取餐' },
  { key: 'done', label: '完成' },
]

// 状态 → 步骤索引
const STATUS_INDEX: Record<string, number> = {
  PENDING_PAYMENT: 0,
  PAID_WAITING: 1,
  IN_PREPARATION: 2,
  READY_FOR_PICKUP: 3,
  COMPLETED: 4,
}

const isTerminal = computed(() =>
  ['CANCELLED', 'REFUNDING', 'REFUNDED'].includes(props.status)
)

const currentIndex = computed(() => STATUS_INDEX[props.status] ?? 0)

// 进度条填充百分比（基于步骤间隔）
const fillPercent = computed(() => {
  const idx = currentIndex.value
  if (idx <= 0) return 0
  if (idx >= steps.length - 1) return 100
  return (idx / (steps.length - 1)) * 100
})

const terminalIcon = computed(() => {
  if (props.status === 'CANCELLED') return '✕'
  if (props.status === 'REFUNDING') return '↻'
  return '↩'
})

const terminalText = computed(() => {
  if (props.status === 'CANCELLED') return '订单已取消'
  if (props.status === 'REFUNDING') return '退款处理中'
  return '已退款'
})
</script>

<style scoped>
.order-progress {
  position: relative;
  padding: 10px 0 2px;
}

/* ---- 轨道 ---- */
.progress-track {
  position: absolute;
  top: 18px;
  left: 10%;
  right: 10%;
  height: 2px;
}

.track-bg {
  position: absolute;
  inset: 0;
  border-radius: 1px;
  background: var(--glass-border);
}

.track-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  border-radius: 1px;
  background: var(--color-primary);
  transition: width 0.4s ease;
}

/* ---- 步骤容器 ---- */
.progress-steps {
  position: relative;
  display: flex;
  justify-content: space-between;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

/* ---- 圆点 ---- */
.step-dot {
  position: relative;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: var(--color-bg);
  border: 2px solid var(--glass-border);
  z-index: 1;
}

.step--done .step-dot {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.step--active .step-dot {
  width: 18px;
  height: 18px;
  background: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);
}

.step--pending .step-dot {
  background: var(--color-bg-secondary);
  border-color: var(--glass-border);
}

/* 对勾图标 */
.step-check {
  width: 10px;
  height: 10px;
  color: var(--color-bg);
}

/* 当前步骤脉冲动画 */
.step-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-bg);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.8); }
}

/* ---- 标签 ---- */
.step-label {
  font-size: 0.625rem;
  line-height: 1;
  color: var(--color-text-secondary);
  opacity: 0.5;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.step--done .step-label {
  opacity: 0.7;
}

.step--active .step-label {
  color: var(--color-primary);
  opacity: 1;
  font-weight: 600;
}

/* ---- 终态指示器 ---- */
.terminal-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 0;
}

.terminal-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 0.625rem;
  font-weight: 700;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--color-text-secondary);
}

.terminal-text {
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  opacity: 0.7;
}
</style>
