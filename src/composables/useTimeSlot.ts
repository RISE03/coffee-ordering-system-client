/**
 * 时段判断 Composable
 *
 * 提供基于本地时间的时段计算功能
 */

import { computed, ref, onMounted, onUnmounted } from 'vue'
import { TIME_FLOW_SLOTS, getSlotConfig } from '@/constants/timeflow'
import { getSlotByHour, getCurrentSlot, type TimeFlowSlot } from '@/types/timeflow'

/**
 * 时段判断 Composable
 *
 * @returns 当前时段及相关计算属性
 */
export function useTimeSlot() {
  // 当前时段（响应式）
  const currentSlot = ref<TimeFlowSlot>(getCurrentSlot())

  // 当前时段配置
  const currentConfig = computed(() => getSlotConfig(currentSlot.value))

  // 所有时段配置列表
  const allSlots = computed(() => TIME_FLOW_SLOTS)

  // 定时器 ID
  let intervalId: number | undefined

  /**
   * 更新当前时段
   */
  function updateCurrentSlot() {
    const newSlot = getCurrentSlot()
    if (newSlot !== currentSlot.value) {
      currentSlot.value = newSlot
    }
  }

  /**
   * 根据指定小时获取时段
   */
  function getSlotForHour(hour: number): TimeFlowSlot {
    return getSlotByHour(hour)
  }

  /**
   * 检查指定时段是否为当前时段
   */
  function isCurrentSlot(slot: TimeFlowSlot): boolean {
    return slot === currentSlot.value
  }

  /**
   * 获取指定时段的配置
   */
  function getConfigForSlot(slot: TimeFlowSlot) {
    return getSlotConfig(slot)
  }

  // 生命周期：挂载时启动定时器，每分钟检查一次
  onMounted(() => {
    updateCurrentSlot()
    // 每分钟检查一次时段变化
    intervalId = window.setInterval(updateCurrentSlot, 60000)
  })

  // 生命周期：卸载时清除定时器
  onUnmounted(() => {
    if (intervalId !== undefined) {
      window.clearInterval(intervalId)
    }
  })

  return {
    // 状态
    currentSlot,
    currentConfig,
    allSlots,

    // 方法
    updateCurrentSlot,
    getSlotForHour,
    isCurrentSlot,
    getConfigForSlot
  }
}

// 导出工具函数供非组件使用
export { getSlotByHour, getCurrentSlot }
