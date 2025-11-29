import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { addToCart, clearCart as clearCartApi, getCart, removeCartItem, updateCartItem } from '@/api/cart'
import type { AddToCartRequest, CartItem, CartResponse, CartSummary } from '@/types/cart'
import { getDisplayErrorMessage } from '@/utils/error'

const CART_STORAGE_KEY = 'dawn_dusk_cart_items'
export const CART_QUANTITY_MIN = 1
export const CART_QUANTITY_MAX = 99

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastSyncedAt = ref<string | null>(null)

  // 从本地恢复
  const storedItems = localStorage.getItem(CART_STORAGE_KEY)
  if (storedItems) {
    try {
      items.value = JSON.parse(storedItems) as CartItem[]
    } catch (e) {
      console.error('解析本地购物车失败:', e)
      localStorage.removeItem(CART_STORAGE_KEY)
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
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems))
    },
    { deep: true }
  )

  // 内部方法：应用服务端返回
  function applyCart(data: CartResponse) {
    items.value = data.items || []
    error.value = null
    lastSyncedAt.value = new Date().toISOString()
  }

  function setItems(newItems: CartItem[]) {
    items.value = newItems
  }

  function validateQuantity(quantity: number): boolean {
    return Number.isInteger(quantity) && quantity >= CART_QUANTITY_MIN && quantity <= CART_QUANTITY_MAX
  }

  // Actions
  async function fetchCart() {
    loading.value = true
    error.value = null
    try {
      const res = await getCart()
      applyCart(res)
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
      applyCart(res)
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
      applyCart(res)
    } catch (err) {
      error.value = getDisplayErrorMessage(err)
      throw err
    }
  }

  async function removeItem(productId: number) {
    try {
      const res = await removeCartItem(productId)
      applyCart(res)
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
      localStorage.removeItem(CART_STORAGE_KEY)
      lastSyncedAt.value = new Date().toISOString()
    }
  }

  return {
    // state
    items,
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
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart
  }
})
