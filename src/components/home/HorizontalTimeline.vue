<script setup lang="ts">
import { computed } from 'vue'
import type { TimeFlowConfig, TimeFlowSlot } from '@/types/timeflow'

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
        <!-- 圆点指示器 -->
        <div
          class="node-dot"
          :style="{
            backgroundColor: isActive(slot.code)
              ? slot.colors.primary
              : 'rgba(255, 255, 255, 0.4)',
            boxShadow: isActive(slot.code)
              ? `0 0 16px ${slot.colors.primary}`
              : 'none'
          }"
        >
          <!-- 当前真实时段的脉冲动画 -->
          <div
            v-if="isCurrent(slot.code)"
            class="pulse-ring"
            :style="{ borderColor: slot.colors.primary }"
          />
        </div>

        <!-- 时段名称 -->
        <span
          class="node-label"
          :style="{
            color: isActive(slot.code)
              ? activeSlotConfig?.colors.text
              : activeSlotConfig?.colors.textSecondary,
            fontWeight: isActive(slot.code) ? '600' : '400'
          }"
        >
          {{ slot.name }}
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
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1px;
  margin-top: -0.75rem;
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
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.timeline-node:hover {
  transform: translateY(-2px);
}

/* 圆点 */
.node-dot {
  position: relative;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.timeline-node.is-active .node-dot {
  width: 20px;
  height: 20px;
}

/* 脉冲动画环 */
.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid;
  animation: pulse-animation 2s ease-in-out infinite;
}

@keyframes pulse-animation {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0.5;
  }
}

/* 标签 */
.node-label {
  font-size: 0.875rem;
  white-space: nowrap;
  transition: all 0.3s ease;
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

  .node-dot {
    width: 12px;
    height: 12px;
  }

  .timeline-node.is-active .node-dot {
    width: 16px;
    height: 16px;
  }

  .pulse-ring {
    width: 24px;
    height: 24px;
  }
}
</style>
