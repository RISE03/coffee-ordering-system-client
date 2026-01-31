/**
 * 时间流动主题首页 - 状态管理
 *
 * 管理首页 5 时段的商品数据、加载状态和活跃时段
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getRecommendedProducts } from '@/api/products'
import { TIME_FLOW_SLOTS, getAdjacentSlots, SLOT_TO_API_MAPPING } from '@/constants/timeflow'
import {
  getCurrentSlot,
  createEmptyProductsBySlot,
  createEmptyErrorSlots,
  type TimeFlowSlot
} from '@/types/timeflow'
import type { Product } from '@/types/product'
import { getDisplayErrorMessage } from '@/utils/error'

export const useTimeFlowStore = defineStore('timeflow', () => {
  // ============================================================================
  // 状态
  // ============================================================================

  /** 当前真实时段（根据本地时间计算） */
  const currentSlot = ref<TimeFlowSlot>(getCurrentSlot())

  /** 当前活跃时段（用户滚动或点击导航后的位置） */
  const activeSlot = ref<TimeFlowSlot>(currentSlot.value)

  /** 各时段的推荐商品 */
  const productsBySlot = ref<Record<TimeFlowSlot, Product[]>>(createEmptyProductsBySlot())

  /** 正在加载的时段集合 */
  const loadingSlots = ref<Set<TimeFlowSlot>>(new Set())

  /** 各时段的错误信息 */
  const errorSlots = ref<Record<TimeFlowSlot, string | null>>(createEmptyErrorSlots())

  /** 是否已初始化 */
  const initialized = ref(false)

  // ============================================================================
  // 计算属性
  // ============================================================================

  /** 所有时段配置 */
  const slots = computed(() => TIME_FLOW_SLOTS)

  /** 当前活跃时段的商品列表 */
  const activeProducts = computed(() => productsBySlot.value[activeSlot.value] ?? [])

  /** 是否有任何时段正在加载 */
  const isLoading = computed(() => loadingSlots.value.size > 0)

  /** 是否有任何时段加载失败 */
  const hasError = computed(() =>
    Object.values(errorSlots.value).some(err => err !== null)
  )

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * 加载单个时段的推荐商品
   */
  async function loadSlotProducts(slot: TimeFlowSlot) {
    // 如果已在加载中，跳过
    if (loadingSlots.value.has(slot)) return

    // 如果已有数据，跳过（避免重复请求）
    if (productsBySlot.value[slot].length > 0) return

    loadingSlots.value.add(slot)
    errorSlots.value[slot] = null

    try {
      // 使用映射后的时段编码调用 API
      const apiSlotCode = SLOT_TO_API_MAPPING[slot]
      const response = await getRecommendedProducts({
        timeSlotCode: apiSlotCode as any,
        scene: 'home'
      })
      productsBySlot.value[slot] = response.products ?? []
    } catch (err) {
      errorSlots.value[slot] = getDisplayErrorMessage(err)
      productsBySlot.value[slot] = []
    } finally {
      loadingSlots.value.delete(slot)
    }
  }

  /**
   * 重试加载指定时段的商品
   */
  async function retrySlotProducts(slot: TimeFlowSlot) {
    // 清除已有数据以触发重新加载
    productsBySlot.value[slot] = []
    errorSlots.value[slot] = null
    await loadSlotProducts(slot)
  }

  /**
   * 设置当前活跃时段（由滚动监听或导航点击触发）
   */
  function setActiveSlot(slot: TimeFlowSlot) {
    if (activeSlot.value !== slot) {
      activeSlot.value = slot
    }
  }

  /**
   * 预加载相邻时段的商品
   */
  function preloadAdjacentSlots(slot: TimeFlowSlot) {
    const adjacent = getAdjacentSlots(slot)
    adjacent.forEach(adjSlot => {
      loadSlotProducts(adjSlot)
    })
  }

  /**
   * 初始化时间流数据
   * 加载当前时段和相邻时段的商品
   */
  async function initialize() {
    if (initialized.value) return

    // 更新当前时段
    currentSlot.value = getCurrentSlot()
    activeSlot.value = currentSlot.value

    // 优先加载当前时段
    await loadSlotProducts(currentSlot.value)

    // 标记已初始化
    initialized.value = true

    // 延迟预加载相邻时段
    setTimeout(() => {
      preloadAdjacentSlots(currentSlot.value)
    }, 500)
  }

  /**
   * 加载所有时段的商品
   */
  async function loadAllSlots() {
    const loadPromises = TIME_FLOW_SLOTS.map(slot => loadSlotProducts(slot.code))
    await Promise.allSettled(loadPromises)
  }

  /**
   * 检查指定时段是否正在加载
   */
  function isSlotLoading(slot: TimeFlowSlot): boolean {
    return loadingSlots.value.has(slot)
  }

  /**
   * 获取指定时段的错误信息
   */
  function getSlotError(slot: TimeFlowSlot): string | null {
    return errorSlots.value[slot]
  }

  /**
   * 重置所有状态
   */
  function $reset() {
    currentSlot.value = getCurrentSlot()
    activeSlot.value = currentSlot.value
    productsBySlot.value = createEmptyProductsBySlot()
    loadingSlots.value = new Set()
    errorSlots.value = createEmptyErrorSlots()
    initialized.value = false
  }

  return {
    // 状态
    currentSlot,
    activeSlot,
    productsBySlot,
    loadingSlots,
    errorSlots,
    initialized,

    // 计算属性
    slots,
    activeProducts,
    isLoading,
    hasError,

    // Actions
    loadSlotProducts,
    retrySlotProducts,
    setActiveSlot,
    preloadAdjacentSlots,
    initialize,
    loadAllSlots,
    isSlotLoading,
    getSlotError,
    $reset
  }
})
