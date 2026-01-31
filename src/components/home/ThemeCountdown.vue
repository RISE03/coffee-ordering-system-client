<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 当前时间
const currentTime = ref(new Date())

// 定时器 ID
let intervalId: number | null = null

// 更新当前时间
function updateTime() {
  currentTime.value = new Date()
}

// 计算距离下一个主题切换的时间
const countdown = computed(() => {
  const now = currentTime.value
  const hour = now.getHours()

  // 判断当前是朝模式还是暮模式
  const isDawnMode = hour >= 6 && hour < 18

  // 计算目标时间
  let targetHour: number
  let targetDate: Date
  let themeName: string

  if (isDawnMode) {
    // 朝模式 → 暮模式（18:00）
    themeName = '暮色模式'
    targetHour = 18
    targetDate = new Date(now)
    targetDate.setHours(targetHour, 0, 0, 0)
  } else {
    // 暮模式 → 朝模式（次日 06:00）
    themeName = '朝阳模式'
    targetHour = 6
    targetDate = new Date(now)

    // 如果当前时间在 00:00-05:59，目标是今天 06:00
    // 如果当前时间在 18:00-23:59，目标是明天 06:00
    if (hour >= 18) {
      targetDate.setDate(targetDate.getDate() + 1)
    }
    targetDate.setHours(targetHour, 0, 0, 0)
  }

  // 计算时间差（毫秒）
  const diff = targetDate.getTime() - now.getTime()

  // 转换为小时和分钟
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return {
    themeName,
    hours,
    minutes,
    isDawnMode
  }
})

// 倒计时文案
const countdownText = computed(() => {
  const { themeName, hours, minutes } = countdown.value

  if (hours > 0) {
    return `距离${themeName}还有 ${hours}小时${minutes}分`
  } else {
    return `距离${themeName}还有 ${minutes}分钟`
  }
})

// 主题图标
const themeIcon = computed(() => {
  return countdown.value.isDawnMode ? '🌆' : '🌅'
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
  <div class="theme-countdown">
    <div class="countdown-content">
      <span class="countdown-icon">{{ themeIcon }}</span>
      <span class="countdown-text">{{ countdownText }}</span>
    </div>
  </div>
</template>

<style scoped>
.theme-countdown {
  display: flex;
  justify-content: center;
  padding: 1rem;
  margin-top: auto;
}

.countdown-content {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.6s ease-out;
}

.countdown-icon {
  font-size: 1.25rem;
  animation: float 3s ease-in-out infinite;
}

.countdown-text {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.9;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .countdown-content {
    padding: 0.625rem 1.25rem;
  }

  .countdown-icon {
    font-size: 1rem;
  }

  .countdown-text {
    font-size: 0.75rem;
  }
}
</style>
