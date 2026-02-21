import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getOrderDetail, getOrders, cancelOrder, refundOrder } from '@/api/order'
import type { OrderDetailResponse, OrderListItem, OrderStatus, RefundApplyRequest } from '@/types/order'
import { getDisplayErrorMessage } from '@/utils/error'

/**
 * 订单状态 Store
 *
 * 特性：
 * - 按状态标签缓存列表数据，切换 tab 时恢复已加载的列表与分页
 * - 详情缓存：避免重复拉取同一订单
 * - 支持"加载更多"追加模式
 * - 取消订单后自动同步列表与详情状态
 */
export const useOrderStore = defineStore('order', () => {
  // 按状态分组的订单列表缓存
  const listByStatus = ref<Record<string, OrderListItem[]>>({})
  const pageByStatus = ref<Record<string, { total: number; page: number; size: number }>>({})
  // 订单详情缓存
  const detailMap = ref<Record<string, OrderDetailResponse>>({})

  // 加载状态
  const loadingList = ref(false)
  const loadingDetail = ref(false)
  const errorList = ref<string | null>(null)
  const errorDetail = ref<string | null>(null)

  // 当前激活的状态标签，用于切换 tab 时恢复
  const activeStatusTab = ref<string>('all')

  // 取消订单加载状态
  const cancellingOrderNo = ref<string | null>(null)

  // 计算属性：当前 tab 的订单列表
  const currentOrders = computed(() => listByStatus.value[activeStatusTab.value] || [])
  const currentPage = computed(() => pageByStatus.value[activeStatusTab.value])

  /**
   * 获取订单列表
   */
  async function fetchList(params: {
    status?: OrderStatus | 'all'
    page?: number
    size?: number
  } = {}) {
    const statusKey = params.status ?? 'all'
    loadingList.value = true
    errorList.value = null

    try {
      const data = await getOrders({
        page: params.page,
        size: params.size,
        status: params.status && params.status !== 'all' ? params.status : undefined
      })

      listByStatus.value[statusKey] = data.list
      pageByStatus.value[statusKey] = data.page

      return data
    } catch (err) {
      errorList.value = getDisplayErrorMessage(err)
      throw err
    } finally {
      loadingList.value = false
    }
  }

  /**
   * 获取订单详情
   */
  async function fetchDetail(orderNo: string, force = false) {
    if (!force && detailMap.value[orderNo]) {
      return detailMap.value[orderNo]
    }

    loadingDetail.value = true
    errorDetail.value = null

    try {
      const data = await getOrderDetail(orderNo)
      detailMap.value[orderNo] = data
      return data
    } catch (err) {
      errorDetail.value = getDisplayErrorMessage(err)
      throw err
    } finally {
      loadingDetail.value = false
    }
  }

  /**
   * 缓存订单详情
   */
  function cacheDetail(detail: OrderDetailResponse) {
    detailMap.value[detail.orderNo] = detail
  }

  /**
   * 设置当前激活的状态标签
   */
  function setActiveStatusTab(status: string) {
    activeStatusTab.value = status
  }

  /**
   * 更新订单状态（用于取消或支付后同步）
   */
  function updateOrderStatus(orderNo: string, newStatus: OrderStatus) {
    // 更新所有列表缓存中的订单状态
    for (const statusKey of Object.keys(listByStatus.value)) {
      const list = listByStatus.value[statusKey]
      if (!list) continue
      const order = list.find((o) => o.orderNo === orderNo)
      if (order) {
        order.status = newStatus
      }
    }

    // 更新详情缓存中的订单状态
    if (detailMap.value[orderNo]) {
      detailMap.value[orderNo].status = newStatus
    }
  }

  /**
   * 从列表中移除订单（用于状态筛选后取消订单）
   */
  function removeFromStatusList(orderNo: string, statusKey: string) {
    const list = listByStatus.value[statusKey]
    if (list) {
      const index = list.findIndex((o) => o.orderNo === orderNo)
      if (index !== -1) {
        list.splice(index, 1)
        // 更新分页总数
        if (pageByStatus.value[statusKey]) {
          pageByStatus.value[statusKey].total = Math.max(0, pageByStatus.value[statusKey].total - 1)
        }
      }
    }
  }

  /**
   * 取消订单
   */
  async function doCancelOrder(orderNo: string): Promise<boolean> {
    cancellingOrderNo.value = orderNo
    try {
      await cancelOrder(orderNo)

      // 同步更新本地状态
      updateOrderStatus(orderNo, 'CANCELLED')

      // 如果当前在非"全部"标签页，从该标签页列表移除
      if (activeStatusTab.value !== 'all' && activeStatusTab.value !== 'CANCELLED') {
        removeFromStatusList(orderNo, activeStatusTab.value)
      }

      return true
    } catch (err) {
      throw err
    } finally {
      cancellingOrderNo.value = null
    }
  }

  /**
   * 申请退款
   */
  async function doRefundOrder(
    orderNo: string,
    data: RefundApplyRequest
  ): Promise<boolean> {
    try {
      await refundOrder(orderNo, data)

      // 同步更新本地状态为 REFUNDING
      updateOrderStatus(orderNo, 'REFUNDING')

      // 如果当前在非"全部"和"退款中"标签页，从该标签页列表移除
      if (activeStatusTab.value !== 'all' && activeStatusTab.value !== 'REFUNDING') {
        removeFromStatusList(orderNo, activeStatusTab.value)
      }

      return true
    } catch (err) {
      throw err
    }
  }

  /**
   * 清除指定状态的列表缓存
   */
  function clearStatusCache(status: string) {
    delete listByStatus.value[status]
    delete pageByStatus.value[status]
  }

  /**
   * 刷新当前标签页的列表（强制重新加载）
   */
  async function refreshCurrentList() {
    const status = activeStatusTab.value === 'all' ? undefined : activeStatusTab.value as OrderStatus
    return fetchList({ status: status as OrderStatus | 'all', page: 1 })
  }

  /**
   * 重置所有状态
   */
  function reset() {
    listByStatus.value = {}
    pageByStatus.value = {}
    detailMap.value = {}
    errorList.value = null
    errorDetail.value = null
    activeStatusTab.value = 'all'
    cancellingOrderNo.value = null
  }

  return {
    // state
    listByStatus,
    pageByStatus,
    detailMap,
    loadingList,
    loadingDetail,
    errorList,
    errorDetail,
    activeStatusTab,
    cancellingOrderNo,
    // getters
    currentOrders,
    currentPage,
    // actions
    fetchList,
    fetchDetail,
    cacheDetail,
    setActiveStatusTab,
    updateOrderStatus,
    removeFromStatusList,
    doCancelOrder,
    doRefundOrder,
    clearStatusCache,
    refreshCurrentList,
    reset
  }
})