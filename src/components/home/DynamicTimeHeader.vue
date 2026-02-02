<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTimeFlowStore } from '@/stores/timeflow'
import { TIME_FLOW_SLOTS } from '@/constants/timeflow'

// 使用统一的时间流 Store
const timeflowStore = useTimeFlowStore()

// 时间各部分（用于翻牌动画）
const hours = computed(() => {
  return timeflowStore.currentTime.getHours().toString().padStart(2, '0')
})

const minutes = computed(() => {
  return timeflowStore.currentTime.getMinutes().toString().padStart(2, '0')
})

// 翻牌动画状态
const isFlipping = ref(false)

// 监听分钟变化触发翻牌动画
watch(minutes, () => {
  isFlipping.value = true
  setTimeout(() => {
    isFlipping.value = false
  }, 600)
})

// 获取当前时段配置
const currentSlotConfig = computed(() => {
  return TIME_FLOW_SLOTS.find(slot => slot.code === timeflowStore.currentSlot)
})

// 根据时段获取图标
const timeIcon = computed(() => {
  switch (timeflowStore.currentSlot) {
    case 'morning':
      return '☀️'
    case 'noon':
      return '🌤️'
    case 'afternoon':
      return '☕'
    case 'evening':
      return '🌆'
    case 'night':
      return '🌙'
    default:
      return '☀️'
  }
})

// 问候语（根据当前小时）
const greeting = computed(() => {
  const hour = timeflowStore.currentTime.getHours()
  if (hour >= 5 && hour < 12) return '早上好'
  if (hour >= 12 && hour < 14) return '中午好'
  if (hour >= 14 && hour < 18) return '下午好'
  return '晚上好'
})

// 格式化日期为"X月X日 周X"
const formattedDate = computed(() => {
  const time = timeflowStore.currentTime
  const month = time.getMonth() + 1
  const day = time.getDate()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = weekDays[time.getDay()]
  return `${month}月${day}日 周${weekDay}`
})
</script>

<template>
  <div
    v-if="currentSlotConfig"
    class="dynamic-time-header"
    :style="{
      background: currentSlotConfig.colors.gradient
    }"
  >
    <div class="header-content">
      <!-- 第一行：问候语 + 日期 | 营业状态 -->
      <div class="header-top-row">
        <span
          class="greeting-date"
          :style="{ color: currentSlotConfig.colors.textSecondary }"
        >
          {{ greeting }} · {{ formattedDate }}
        </span>
        <span
          class="business-status"
          :class="{ 'is-open': timeflowStore.isOpen }"
        >
          {{ timeflowStore.isOpen ? '营业中' : '已打烊' }}
        </span>
      </div>

      <!-- 第二行：时间图标 + 时间（脉冲效果） -->
      <div
        class="time-display"
        :style="{ color: currentSlotConfig.colors.text }"
      >
        <span class="time-icon">{{ timeIcon }}</span>
        <div class="time-clock">
          <span class="time-digits" :class="{ pulse: isFlipping }">{{ hours }}</span>
          <span class="time-colon">:</span>
          <span class="time-digits" :class="{ pulse: isFlipping }">{{ minutes }}</span>
        </div>
      </div>

      <!-- 第三行：氛围短句 -->
      <p
        class="slot-slogan"
        :style="{ color: currentSlotConfig.colors.textSecondary }"
      >
        "{{ currentSlotConfig.slogan }}"
      </p>
    </div>
  </div>
</template>

<style scoped>
.dynamic-time-header {
  position: relative;
  text-align: center;
  padding: 2rem 1.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: fadeInDown 0.6s ease-out;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* 第一行：问候语 + 营业状态 */
.header-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 0.875rem;
}

.greeting-date {
  font-weight: 500;
}

.business-status {
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: transparent;
  color: rgba(150, 150, 150, 0.9);
  border: 1.5px solid rgba(150, 150, 150, 0.5);
}

.business-status.is-open {
  color: #4CAF50;
  border-color: #4CAF50;
}

/* 第二行：时间显示 */
.time-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 2.5rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0.5rem 0;
}

.time-icon {
  font-size: 2.5rem;
  animation: pulse 2s ease-in-out infinite;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* 时间时钟 */
.time-clock {
  display: flex;
  align-items: center;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.05em;
}

.time-digits {
  font-size: 2.5rem;
  font-weight: 700;
  transition: transform 0.3s ease;
}

.time-digits.pulse {
  animation: pulseScale 0.5s ease-out;
}

.time-colon {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0.1rem;
  animation: blink 1s ease-in-out infinite;
}

@keyframes pulseScale {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* 第三行：氛围短句 */
.slot-slogan {
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  font-style: italic;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}

/* 第四行：倒计时 */
.countdown-text {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0.25rem 0 0;
  opacity: 0.9;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .dynamic-time-header {
    padding: 1.5rem 1rem;
  }

  .header-top-row {
    font-size: 0.8rem;
  }

  .time-display {
    font-size: 2rem;
  }

  .time-icon {
    font-size: 2rem;
  }

  .slot-slogan {
    font-size: 0.9rem;
  }

  .countdown-text {
    font-size: 0.8rem;
  }
}
</style>
