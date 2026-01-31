<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTimeSlot } from '@/composables/useTimeSlot'
import { TIME_FLOW_SLOTS } from '@/constants/timeflow'

// 使用时段判断 Composable
const { currentSlot } = useTimeSlot()

// 当前时间
const currentTime = ref(new Date())

// 定时器 ID
let intervalId: number | null = null

// 更新当前时间
function updateTime() {
  currentTime.value = new Date()
}

// 格式化时间为 HH:MM
const formattedTime = computed(() => {
  const hours = currentTime.value.getHours().toString().padStart(2, '0')
  const minutes = currentTime.value.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
})

// 获取当前时段配置
const currentSlotConfig = computed(() => {
  return TIME_FLOW_SLOTS.find(slot => slot.code === currentSlot.value)
})

// 根据时段获取图标
const timeIcon = computed(() => {
  switch (currentSlot.value) {
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

onMounted(() => {
  // 每分钟更新一次时间
  intervalId = window.setInterval(updateTime, 60000)
})

onUnmounted(() => {
  // 清理定时器
  if (intervalId !== null) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div
    v-if="currentSlotConfig"
    class="dynamic-time-header"
    :style="{
      background: currentSlotConfig.colors.gradient,
      color: currentSlotConfig.colors.text
    }"
  >
    <div class="time-display">
      <span class="time-icon">{{ timeIcon }}</span>
      <span class="time-text">{{ formattedTime }}</span>
    </div>
    <h1 class="slot-name">{{ currentSlotConfig.name }}</h1>
    <p class="slot-slogan" :style="{ color: currentSlotConfig.colors.textSecondary }">
      {{ currentSlotConfig.slogan }}
    </p>
  </div>
</template>

<style scoped>
.dynamic-time-header {
  text-align: center;
  padding: 3rem 2rem;
  border-radius: 1.5rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: fadeInDown 0.6s ease-out;
}

.time-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.time-icon {
  font-size: 2rem;
  animation: pulse 2s ease-in-out infinite;
}

.time-text {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.1em;
}

.slot-name {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0.5rem 0;
  font-family: serif;
  letter-spacing: 0.05em;
}

.slot-slogan {
  font-size: 1.125rem;
  font-weight: 300;
  margin: 0;
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
    padding: 2rem 1.5rem;
  }

  .time-display {
    font-size: 1.25rem;
  }

  .time-icon {
    font-size: 1.5rem;
  }

  .slot-name {
    font-size: 2rem;
  }

  .slot-slogan {
    font-size: 1rem;
  }
}
</style>
