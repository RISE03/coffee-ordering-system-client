import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { addToCart, clearCart as clearCartApi, getCart, removeCartItem, updateCartItem } from '@/api/cart'
import type { AddToCartRequest, CartItem, CartResponse, CartSummary } from '@/types/cart'
import { getDisplayErrorMessage } from '@/utils/error'

const LEGACY_CART_STORAGE_KEY = 'dawn_dusk_cart_items'
const CART_STORAGE_KEY_PREFIX = 'dawn_dusk_cart_items_v2'
export const CART_QUANTITY_MIN = 1
export const CART_QUANTITY_MAX = 99

function getCartStorageKey(userId: number): string {
  return `${CART_STORAGE_KEY_PREFIX}:${userId}`
}

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])
  const activeUserId = ref<number | null>(null)
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastSyncedAt = ref<string | null>(null)

  // 清理遗留旧键，避免历史脏数据在未登录态显示
  localStorage.removeItem(LEGACY_CART_STORAGE_KEY)

  function readUserCart(userId: number): CartItem[] {
    const key = getCartStorageKey(userId)
    const storedItems = localStorage.getItem(key)
    if (!storedItems) return []

    try {
      return JSON.parse(storedItems) as CartItem[]
    } catch (e) {
      console.error('解析本地购物车失败:', e)
      localStorage.removeItem(key)
      return []
    }
  }

  // Getters
  const summary = computed<CartSummary>(() => {
    const totalQty = items.value.reduce((sum, item) => sum + item.quantity, 0)
    const totalAmount = items.value.reduce((sum, item) => sum + item.subtotal, 0)
    return { totalQty, totalAmount }
  })

  const isEmpty = computed(() => items.value.length === 0)

  // 持久化
  watch(
    items,
    (newItems) => {
      if (!activeUserId.value) return
      localStorage.setItem(getCartStorageKey(activeUserId.value), JSON.stringify(newItems))
    },
    { deep: true }
  )

  // 内部方法：应用服务端返回，成功返回 true
  function applyCart(data: unknown): data is CartResponse {
    // 确保 data 有效且包含 items 数组
    if (data && typeof data === 'object' && Array.isArray((data as CartResponse).items)) {
      items.value = (data as CartResponse).items
      error.value = null
      lastSyncedAt.value = new Date().toISOString()
      return true
    }

    console.warn('applyCart: 无效的购物车数据', data)
    return false
  }

  /**
   * 强制从服务端同步购物车
   * 用于接口返回结构不完整时兜底，避免 UI 停留在旧状态。
   */
  async function refreshCartStrict() {
    const latest = await getCart()
    const ok = applyCart(latest)
    if (!ok) {
      throw new Error('购物车数据格式异常，请稍后重试')
    }
  }

  function setItems(newItems: CartItem[]) {
    items.value = newItems
  }

  function validateQuantity(quantity: number): boolean {
    return Number.isInteger(quantity) && quantity >= CART_QUANTITY_MIN && quantity <= CART_QUANTITY_MAX
  }

  function bindUser(userId: number | null) {
    if (!userId) {
      activeUserId.value = null
      items.value = []
      initialized.value = false
      loading.value = false
      error.value = null
      lastSyncedAt.value = null
      return
    }

    if (activeUserId.value === userId) return

    activeUserId.value = userId
    items.value = readUserCart(userId)
    initialized.value = false
    loading.value = false
    error.value = null
    lastSyncedAt.value = null
  }

  function clearUserCache(userId?: number) {
    const targetUserId = userId ?? activeUserId.value
    if (!targetUserId) return
    localStorage.removeItem(getCartStorageKey(targetUserId))
  }

  // Actions
  async function fetchCart() {
    loading.value = true
    error.value = null
    try {
      await refreshCartStrict()
    } catch (err) {
      error.value = getDisplayErrorMessage(err)
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function addItem(item: CartItem | AddToCartRequest) {
    const payload: AddToCartRequest = {
      productId: item.productId,
      quantity: 'quantity' in item ? item.quantity : 1
    }
    try {
      const res = await addToCart(payload)
      if (!applyCart(res)) {
        await refreshCartStrict()
      }
      return true
    } catch (err) {
      error.value = getDisplayErrorMessage(err)
      throw err
    }
  }

  async function updateQuantity(productId: number, quantity: number) {
    if (!validateQuantity(quantity)) {
      const message = `数量需在 ${CART_QUANTITY_MIN}-${CART_QUANTITY_MAX} 之间`
      error.value = message
      throw new Error(message)
    }

    try {
      const res = await updateCartItem(productId, { quantity })
      if (!applyCart(res)) {
        await refreshCartStrict()
      }
    } catch (err) {
      error.value = getDisplayErrorMessage(err)
      throw err
    }
  }

  async function removeItem(productId: number) {
    try {
      const res = await removeCartItem(productId)
      if (!applyCart(res)) {
        await refreshCartStrict()
      }
    } catch (err) {
      error.value = getDisplayErrorMessage(err)
      throw err
    }
  }

  async function clearCart() {
    try {
      await clearCartApi()
    } catch (err) {
      // 即使后端失败也尝试清空本地，减少脏数据
      console.warn('清空购物车接口失败，改为本地清理', err)
    } finally {
      items.value = []
      clearUserCache()
      lastSyncedAt.value = new Date().toISOString()
    }
  }

  return {
    // state
    items,
    activeUserId,
    loading,
    error,
    initialized,
    lastSyncedAt,
    // getters
    summary,
    isEmpty,
    // actions
    setItems,
    validateQuantity,
    bindUser,
    clearUserCache,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart
  }
})
