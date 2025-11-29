import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore, CART_QUANTITY_MIN, CART_QUANTITY_MAX } from './cart'
import * as cartApi from '@/api/cart'

vi.mock('@/api/cart')

describe('CartStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('数量校验', () => {
    it('应该拒绝小于最小值的数量', () => {
      const store = useCartStore()

      const result = store.validateQuantity(0)

      expect(result).toBe(false)
    })

    it('应该拒绝大于最大值的数量', () => {
      const store = useCartStore()

      const result = store.validateQuantity(100)

      expect(result).toBe(false)
    })

    it('应该接受有效范围内的数量', () => {
      const store = useCartStore()

      expect(store.validateQuantity(1)).toBe(true)
      expect(store.validateQuantity(50)).toBe(true)
      expect(store.validateQuantity(99)).toBe(true)
    })

    it('更新数量时应该调用 API', async () => {
      const store = useCartStore()
      vi.mocked(cartApi.updateCartItem).mockResolvedValue({
        items: [{ productId: 1, name: '测试商品', image: '', unitPrice: 10, quantity: 5, subtotal: 50 }],
        summary: { totalQty: 5, totalAmount: 50 }
      })

      await store.updateQuantity(1, 5)

      expect(cartApi.updateCartItem).toHaveBeenCalledWith(1, { quantity: 5 })
    })
  })

  describe('总计刷新', () => {
    it('应该正确计算购物车总计', () => {
      const store = useCartStore()
      store.items = [
        { productId: 1, name: '商品1', image: '', unitPrice: 10, quantity: 2, subtotal: 20 },
        { productId: 2, name: '商品2', image: '', unitPrice: 15, quantity: 3, subtotal: 45 }
      ]

      expect(store.summary.totalQty).toBe(5)
      expect(store.summary.totalAmount).toBe(65)
    })

    it('空购物车应该返回零总计', () => {
      const store = useCartStore()
      store.items = []

      expect(store.summary.totalQty).toBe(0)
      expect(store.summary.totalAmount).toBe(0)
      expect(store.isEmpty).toBe(true)
    })
  })

  describe('本地持久化', () => {
    it('应该在初始化时从 localStorage 恢复', () => {
      const mockItems = [
        { productId: 1, name: '商品1', image: '', unitPrice: 10, quantity: 1, subtotal: 10 }
      ]
      localStorage.setItem('dawn_dusk_cart_items', JSON.stringify(mockItems))

      const store = useCartStore()

      expect(store.items).toEqual(mockItems)
    })
  })
})
