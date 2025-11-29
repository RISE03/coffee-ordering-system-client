import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCheckoutStore } from './checkout'
import * as checkoutApi from '@/api/checkout'
import type { CheckoutPreviewResponse } from '@/types/cart'

vi.mock('@/api/checkout')

describe('CheckoutStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('优惠券自动移除', () => {
    it('当金额低于门槛时应该自动移除优惠券', async () => {
      const store = useCheckoutStore()

      // 设置初始快照
      store.setCartSnapshot([
        { productId: 1, name: '商品', image: '', unitPrice: 100, quantity: 1, subtotal: 100 }
      ])

      // 模拟初始预览：金额足够，优惠券可用
      const initialPreview: CheckoutPreviewResponse = {
        items: [{ productId: 1, name: '商品', image: '', unitPrice: 100, quantity: 1, subtotal: 100, available: true }],
        coupons: {
          usable: [{ id: 1, name: '满50减10', discountAmount: 10, threshold: 50, validFrom: '', validTo: '', usable: true }],
          unusable: []
        },
        price: { itemsAmount: 100, discountAmount: 10, payAmount: 90 },
        pointsEstimate: 90,
        generatedAt: new Date().toISOString()
      }

      vi.mocked(checkoutApi.previewCheckout).mockResolvedValueOnce(initialPreview)

      store.setSelectedCouponId(1)
      await store.fetchPreview()

      expect(store.selectedCouponId).toBe(1)
      expect(store.preview?.price.discountAmount).toBe(10)

      // 模拟金额下降后的预览：优惠券不可用
      const updatedPreview: CheckoutPreviewResponse = {
        items: [{ productId: 1, name: '商品', image: '', unitPrice: 30, quantity: 1, subtotal: 30, available: true }],
        coupons: {
          usable: [],
          unusable: [{
            id: 1,
            name: '满50减10',
            discountAmount: 10,
            threshold: 50,
            validFrom: '',
            validTo: '',
            usable: false,
            reason: '订单金额未达到使用门槛'
          }]
        },
        price: { itemsAmount: 30, discountAmount: 0, payAmount: 30 },
        pointsEstimate: 30,
        generatedAt: new Date().toISOString()
      }

      vi.mocked(checkoutApi.previewCheckout).mockResolvedValueOnce(updatedPreview)

      // 更新快照并重新预览
      store.setCartSnapshot([
        { productId: 1, name: '商品', image: '', unitPrice: 30, quantity: 1, subtotal: 30 }
      ])
      await store.fetchPreview()

      // 优惠券应该被自动移除
      expect(store.selectedCouponId).toBeNull()
      expect(store.preview?.price.discountAmount).toBe(0)
    })

    it('当优惠券变为不可用时应该显示原因', async () => {
      const store = useCheckoutStore()

      store.setCartSnapshot([
        { productId: 1, name: '商品', image: '', unitPrice: 30, quantity: 1, subtotal: 30 }
      ])

      const preview: CheckoutPreviewResponse = {
        items: [{ productId: 1, name: '商品', image: '', unitPrice: 30, quantity: 1, subtotal: 30, available: true }],
        coupons: {
          usable: [],
          unusable: [{
            id: 1,
            name: '满50减10',
            discountAmount: 10,
            threshold: 50,
            validFrom: '',
            validTo: '',
            usable: false,
            reason: '订单金额未达到使用门槛'
          }]
        },
        price: { itemsAmount: 30, discountAmount: 0, payAmount: 30 },
        pointsEstimate: 30,
        generatedAt: new Date().toISOString()
      }

      vi.mocked(checkoutApi.previewCheckout).mockResolvedValueOnce(preview)

      store.setSelectedCouponId(1)
      await store.fetchPreview()

      const unusableCoupon = store.preview?.coupons.unusable.find(c => c.id === 1)
      expect(unusableCoupon?.reason).toBe('订单金额未达到使用门槛')
    })
  })

  describe('预览金额更新', () => {
    it('选择优惠券后应该更新预览金额', async () => {
      const store = useCheckoutStore()

      store.setCartSnapshot([
        { productId: 1, name: '商品', image: '', unitPrice: 100, quantity: 1, subtotal: 100 }
      ])

      const previewWithoutCoupon: CheckoutPreviewResponse = {
        items: [{ productId: 1, name: '商品', image: '', unitPrice: 100, quantity: 1, subtotal: 100, available: true }],
        coupons: {
          usable: [{ id: 1, name: '满50减10', discountAmount: 10, threshold: 50, validFrom: '', validTo: '', usable: true }],
          unusable: []
        },
        price: { itemsAmount: 100, discountAmount: 0, payAmount: 100 },
        pointsEstimate: 100,
        generatedAt: new Date().toISOString()
      }

      vi.mocked(checkoutApi.previewCheckout).mockResolvedValueOnce(previewWithoutCoupon)
      await store.fetchPreview()

      expect(store.preview?.price.payAmount).toBe(100)

      const previewWithCoupon: CheckoutPreviewResponse = {
        ...previewWithoutCoupon,
        price: { itemsAmount: 100, discountAmount: 10, payAmount: 90 },
        pointsEstimate: 90
      }

      vi.mocked(checkoutApi.previewCheckout).mockResolvedValueOnce(previewWithCoupon)

      store.setSelectedCouponId(1)
      await store.fetchPreview()

      expect(store.preview?.price.discountAmount).toBe(10)
      expect(store.preview?.price.payAmount).toBe(90)
      expect(store.preview?.pointsEstimate).toBe(90)
    })
  })

  describe('基本状态', () => {
    it('应该正确初始化状态', () => {
      const store = useCheckoutStore()

      expect(store.source).toBe('cart')
      expect(store.selectedCouponId).toBeNull()
      expect(store.preview).toBeNull()
      expect(store.itemsSnapshot).toEqual([])
    })

    it('应该能够设置购物车快照', () => {
      const store = useCheckoutStore()
      const items = [
        { productId: 1, name: '商品1', image: '', unitPrice: 100, quantity: 2, subtotal: 200 }
      ]

      store.setCartSnapshot(items)

      expect(store.source).toBe('cart')
      expect(store.itemsSnapshot).toEqual(items)
      expect(store.hasSnapshot).toBe(true)
    })
  })
})
