import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useOrderStore } from './order'
import * as orderApi from '@/api/order'
import type { OrderListResponse, OrderDetailResponse } from '@/types/order'

vi.mock('@/api/order')

describe('OrderStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('订单列表状态筛选', () => {
    it('应该能够按状态筛选订单', async () => {
      const store = useOrderStore()

      const mockResponse: OrderListResponse = {
        list: [
          {
            orderNo: 'ORD001',
            status: 'PENDING_PAYMENT',
            createdAt: '2025-01-01T10:00:00Z',
            itemsPreview: '商品1 x2',
            itemsAmount: 100,
            discountAmount: 10,
            payAmount: 90
          }
        ],
        page: { total: 1, page: 1, size: 10 }
      }

      vi.mocked(orderApi.getOrders).mockResolvedValue(mockResponse)

      const result = await store.fetchList({ status: 'PENDING_PAYMENT' })

      expect(orderApi.getOrders).toHaveBeenCalledWith({
        status: 'PENDING_PAYMENT',
        page: undefined,
        size: undefined
      })
      expect(result.list).toHaveLength(1)
      expect(result.list[0].status).toBe('PENDING_PAYMENT')
    })

    it('应该缓存不同状态的订单列表', async () => {
      const store = useOrderStore()

      const pendingResponse: OrderListResponse = {
        list: [{ orderNo: 'ORD001', status: 'PENDING_PAYMENT', createdAt: '', itemsPreview: '', itemsAmount: 100, discountAmount: 0, payAmount: 100 }],
        page: { total: 1, page: 1, size: 10 }
      }

      const completedResponse: OrderListResponse = {
        list: [{ orderNo: 'ORD002', status: 'COMPLETED', createdAt: '', itemsPreview: '', itemsAmount: 200, discountAmount: 0, payAmount: 200 }],
        page: { total: 1, page: 1, size: 10 }
      }

      vi.mocked(orderApi.getOrders).mockResolvedValueOnce(pendingResponse)
      await store.fetchList({ status: 'PENDING_PAYMENT' })
      store.setActiveStatusTab('PENDING_PAYMENT')

      expect(store.currentOrders[0].orderNo).toBe('ORD001')

      vi.mocked(orderApi.getOrders).mockResolvedValueOnce(completedResponse)
      await store.fetchList({ status: 'COMPLETED' })
      store.setActiveStatusTab('COMPLETED')

      expect(store.currentOrders[0].orderNo).toBe('ORD002')

      // 切换回待支付，应该从缓存恢复
      store.setActiveStatusTab('PENDING_PAYMENT')
      expect(store.currentOrders[0].orderNo).toBe('ORD001')
    })
  })

  describe('分页加载', () => {
    it('应该支持加载更多', async () => {
      const store = useOrderStore()

      const firstPage: OrderListResponse = {
        list: [{ orderNo: 'ORD001', status: 'COMPLETED', createdAt: '', itemsPreview: '', itemsAmount: 100, discountAmount: 0, payAmount: 100 }],
        page: { total: 2, page: 1, size: 1 }
      }

      const secondPage: OrderListResponse = {
        list: [{ orderNo: 'ORD002', status: 'COMPLETED', createdAt: '', itemsPreview: '', itemsAmount: 200, discountAmount: 0, payAmount: 200 }],
        page: { total: 2, page: 2, size: 1 }
      }

      vi.mocked(orderApi.getOrders).mockResolvedValueOnce(firstPage)
      await store.fetchList({ status: 'all', page: 1, size: 1 })

      expect(store.currentOrders).toHaveLength(1)
      expect(store.hasMoreOrders).toBe(true)

      vi.mocked(orderApi.getOrders).mockResolvedValueOnce(secondPage)
      await store.fetchList({ status: 'all', page: 2, size: 1, append: true })

      expect(store.currentOrders).toHaveLength(2)
      expect(store.currentOrders[0].orderNo).toBe('ORD001')
      expect(store.currentOrders[1].orderNo).toBe('ORD002')
    })
  })

  describe('订单详情', () => {
    it('应该能够获取订单详情', async () => {
      const store = useOrderStore()

      const mockDetail: OrderDetailResponse = {
        orderNo: 'ORD001',
        status: 'COMPLETED',
        timeline: [
          { status: 'PENDING_PAYMENT', time: '2025-01-01T10:00:00Z' },
          { status: 'PAID_WAITING', time: '2025-01-01T10:05:00Z' },
          { status: 'COMPLETED', time: '2025-01-01T11:00:00Z' }
        ],
        pickupInfo: {
          type: 'SELF_PICKUP',
          name: '张三',
          phone: '13800138000'
        },
        items: [
          { productId: 1, name: '商品1', image: '', unitPrice: 100, quantity: 1, subtotal: 100 }
        ],
        priceBreakdown: {
          itemsAmount: 100,
          discountAmount: 0,
          payAmount: 100
        },
        createdAt: '2025-01-01T10:00:00Z'
      }

      vi.mocked(orderApi.getOrderDetail).mockResolvedValue(mockDetail)

      const detail = await store.fetchDetail('ORD001')

      expect(orderApi.getOrderDetail).toHaveBeenCalledWith('ORD001')
      expect(detail.orderNo).toBe('ORD001')
      expect(detail.timeline).toHaveLength(3)
    })

    it('应该缓存订单详情', async () => {
      const store = useOrderStore()

      const mockDetail: OrderDetailResponse = {
        orderNo: 'ORD001',
        status: 'COMPLETED',
        timeline: [],
        pickupInfo: { type: 'SELF_PICKUP', name: '张三', phone: '13800138000' },
        items: [],
        priceBreakdown: { itemsAmount: 100, discountAmount: 0, payAmount: 100 },
        createdAt: '2025-01-01T10:00:00Z'
      }

      vi.mocked(orderApi.getOrderDetail).mockResolvedValue(mockDetail)

      await store.fetchDetail('ORD001')
      await store.fetchDetail('ORD001')

      // 应该只调用一次 API，第二次从缓存读取
      expect(orderApi.getOrderDetail).toHaveBeenCalledTimes(1)
    })
  })

  describe('取消订单', () => {
    it('应该能够取消待支付订单', async () => {
      const store = useOrderStore()

      vi.mocked(orderApi.cancelOrder).mockResolvedValue(undefined)

      const result = await store.doCancelOrder('ORD001')

      expect(orderApi.cancelOrder).toHaveBeenCalledWith('ORD001')
      expect(result).toBe(true)
    })

    it('取消订单应该调用 API', async () => {
      const store = useOrderStore()

      vi.mocked(orderApi.cancelOrder).mockResolvedValue(undefined)

      const result = await store.doCancelOrder('ORD001')

      expect(result).toBe(true)
      expect(orderApi.cancelOrder).toHaveBeenCalledWith('ORD001')
    })
  })
})
