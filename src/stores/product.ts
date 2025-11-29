/**
 * 产品 Store
 *
 * 管理商品分类、商品列表、时间段推荐等状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getCategories,
  getProducts,
  getRecommendedProducts,
} from '@/api/products'
import type {
  Category,
  Product,
  RecommendationResponse,
  TimeSlotCode,
} from '@/types/product'
import { getDisplayErrorMessage } from '@/utils/error'

export const useProductStore = defineStore('product', () => {
  // ============================================================================
  // State
  // ============================================================================

  // 分类相关
  const categories = ref<Category[]>([])
  const selectedCategoryId = ref<number | null>(null)
  const isLoadingCategories = ref(false)
  const errorCategories = ref<string | null>(null)

  // 商品列表相关
  const products = ref<Product[]>([])
  const isLoadingProducts = ref(false)
  const errorProducts = ref<string | null>(null)

  // 推荐商品相关
  const recommendedProducts = ref<Product[]>([])
  const timeSlotCode = ref<TimeSlotCode | null>(null)
  const timeSlotName = ref<string>('')
  const isLoadingRecommended = ref(false)
  const errorRecommended = ref<string | null>(null)

  // ============================================================================
  // Getters
  // ============================================================================

  /**
   * 当前选中的分类信息
   */
  const currentCategory = computed(() => {
    if (!selectedCategoryId.value) return null
    return categories.value.find((cat) => cat.id === selectedCategoryId.value)
  })

  /**
   * 当前分类的商品列表（别名）
   */
  const productsForCurrentCategory = computed(() => products.value)

  /**
   * 是否有推荐商品
   */
  const hasRecommendedProducts = computed(
    () => recommendedProducts.value.length > 0
  )

  /**
   * 是否正在加载任何数据
   */
  const isLoading = computed(
    () =>
      isLoadingCategories.value ||
      isLoadingProducts.value ||
      isLoadingRecommended.value
  )

  /**
   * 是否有任何错误
   */
  const hasError = computed(
    () =>
      !!errorCategories.value ||
      !!errorProducts.value ||
      !!errorRecommended.value
  )

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * 获取商品分类列表
   */
  async function fetchCategories() {
    isLoadingCategories.value = true
    errorCategories.value = null

    try {
      const data = await getCategories()
      categories.value = data

      // 如果还没有选中分类且有分类数据，默认选中第一个
      if (!selectedCategoryId.value && data.length > 0) {
        selectedCategoryId.value = data[0]?.id ?? null
      }
    } catch (err) {
      errorCategories.value = getDisplayErrorMessage(err)
      console.error('获取分类列表失败:', err)
    } finally {
      isLoadingCategories.value = false
    }
  }

  /**
   * 获取时间段推荐商品
   */
  async function fetchRecommendedProducts(slotCode?: TimeSlotCode) {
    isLoadingRecommended.value = true
    errorRecommended.value = null

    try {
      const data: RecommendationResponse = await getRecommendedProducts({
        timeSlotCode: slotCode,
      })

      recommendedProducts.value = data.products
      timeSlotCode.value = data.timeSlotCode
      timeSlotName.value = data.timeSlotName
    } catch (err) {
      errorRecommended.value = getDisplayErrorMessage(err)
      console.error('获取推荐商品失败:', err)
    } finally {
      isLoadingRecommended.value = false
    }
  }

  /**
   * 根据分类 ID 获取商品列表
   */
  async function fetchProductsByCategory(categoryId: number) {
    isLoadingProducts.value = true
    errorProducts.value = null

    try {
      const data = await getProducts({ categoryId })
      products.value = data.list
      selectedCategoryId.value = categoryId
    } catch (err) {
      errorProducts.value = getDisplayErrorMessage(err)
      console.error('获取商品列表失败:', err)
    } finally {
      isLoadingProducts.value = false
    }
  }

  /**
   * 初始化首页数据
   * 加载分类、推荐商品，并加载第一个分类的商品
   */
  async function initializeHomeData(slotCode?: TimeSlotCode) {
    // 并行加载分类和推荐商品
    await Promise.all([fetchCategories(), fetchRecommendedProducts(slotCode)])

    // 如果有选中的分类，加载该分类的商品
    if (selectedCategoryId.value) {
      await fetchProductsByCategory(selectedCategoryId.value)
    }
  }

  /**
   * 清空错误状态
   */
  function clearErrors() {
    errorCategories.value = null
    errorProducts.value = null
    errorRecommended.value = null
  }

  /**
   * 重置 store 状态
   */
  function reset() {
    categories.value = []
    selectedCategoryId.value = null
    products.value = []
    recommendedProducts.value = []
    timeSlotCode.value = null
    timeSlotName.value = ''
    clearErrors()
  }

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State
    categories,
    selectedCategoryId,
    isLoadingCategories,
    errorCategories,
    products,
    isLoadingProducts,
    errorProducts,
    recommendedProducts,
    timeSlotCode,
    timeSlotName,
    isLoadingRecommended,
    errorRecommended,

    // Getters
    currentCategory,
    productsForCurrentCategory,
    hasRecommendedProducts,
    isLoading,
    hasError,

    // Actions
    fetchCategories,
    fetchRecommendedProducts,
    fetchProductsByCategory,
    initializeHomeData,
    clearErrors,
    reset,
  }
})
