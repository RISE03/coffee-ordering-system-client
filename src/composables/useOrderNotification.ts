/**
 * 订单通知 Composable
 * 监听 SSE 推送的订单相关事件，弹出通知并同步本地状态
 */
import { onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { createDiscreteApi } from 'naive-ui'
import { onSseEvent } from '@/utils/sse'
import { useOrderStore } from '@/stores/order'
import type { OrderStatus } from '@/types/order'

/** 后端状态码 → 客户端状态字符串映射 */
const STATUS_CODE_MAP: Record<number, OrderStatus> = {
  0: 'PENDING_PAYMENT',
  1: 'PAID_WAITING',
  2: 'IN_PREPARATION',
  3: 'READY_FOR_PICKUP',
  4: 'COMPLETED',
  5: 'CANCELLED',
  6: 'REFUNDING',
  7: 'REFUNDED'
}

/** 订单状态中文映射 */
const STATUS_TEXT_MAP: Record<string, string> = {
  PENDING_PAYMENT: '待支付',
  PAID_WAITING: '已支付',
  IN_PREPARATION: '制作中',
  READY_FOR_PICKUP: '待取餐',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDING: '退款中',
  REFUNDED: '已退款'
}

// 使用 Discrete API 在 composable 中使用 Naive UI notification
const { notification } = createDiscreteApi(['notification'])

export function useOrderNotification() {
  const orderStore = useOrderStore()
  const router = useRouter()
  const cleanups: (() => void)[] = []

  // 判断订单是否为外卖
  function isDelivery(orderNo: string): boolean {
    const detail = orderStore.detailMap[orderNo]
    if (detail) return detail.pickupInfo.type === 'DELIVERY'
    for (const list of Object.values(orderStore.listByStatus)) {
      const item = list.find(o => o.orderNo === orderNo)
      if (item) return item.pickupType === 1
    }
    return false
  }

  // 监听取餐/配送通知
  const unsubPickup = onSseEvent('pickup-notify', (data: {
    orderNo: string
    pickupCode: string
    message: string
  }) => {
    const delivery = isDelivery(data.orderNo)
    const defaultMsg = delivery ? '您的订单正在配送中，请留意接收' : '您的餐品已备好，请尽快取餐享用'
    notification.success({
      title: delivery ? '配送提醒' : '取餐提醒',
      content: delivery ? defaultMsg : (data.message || defaultMsg),
      meta: data.pickupCode ? `取餐码: ${data.pickupCode}` : undefined,
      duration: 10000,
      keepAliveOnHover: true,
      onClose: () => {
        // 点击关闭后跳转到订单详情
        router.push(`/member/orders/${data.orderNo}`)
      }
    })

    // 如果当前在订单详情页且是同一订单，自动刷新
    const currentRoute = router.currentRoute.value
    if (currentRoute.params.orderNo === data.orderNo) {
      orderStore.fetchDetail(data.orderNo, true)
    }
  })
  cleanups.push(unsubPickup)

  // 监听订单状态变更
  const unsubStatus = onSseEvent('order-status-change', (data: {
    orderNo: string
    newStatus: number
    newStatusText: string
  }) => {
    const statusKey = STATUS_CODE_MAP[data.newStatus]
    if (!statusKey) return

    // 更新 store 中的缓存状态
    orderStore.updateOrderStatus(data.orderNo, statusKey)

    // 弹出状态变更通知
    let statusText = STATUS_TEXT_MAP[statusKey] || data.newStatusText
    if (statusKey === 'READY_FOR_PICKUP' && isDelivery(data.orderNo)) {
      statusText = '待配送'
    }
    notification.info({
      title: '订单状态更新',
      content: `您的订单 ${data.orderNo} 已变为「${statusText}」`,
      duration: 5000,
      keepAliveOnHover: true
    })

    // 如果当前在订单详情页且是同一订单，自动刷新详情
    const currentRoute = router.currentRoute.value
    if (currentRoute.params.orderNo === data.orderNo) {
      orderStore.fetchDetail(data.orderNo, true)
    }
  })
  cleanups.push(unsubStatus)

  // 监听退款被拒绝
  const unsubRefundRejected = onSseEvent('refund-rejected', (data: {
    orderNo: string
    status: number
    statusText: string
    rejectReason: string
  }) => {
    const statusKey = STATUS_CODE_MAP[data.status]
    if (statusKey) {
      orderStore.updateOrderStatus(data.orderNo, statusKey)
    }

    // 缓存拒绝原因
    if (data.rejectReason) {
      orderStore.setRefundRejectReason(data.orderNo, data.rejectReason)
    }

    // 弹出通知
    notification.warning({
      title: '退款申请被拒绝',
      content: data.rejectReason || '您的退款申请未通过审核',
      meta: `订单 ${data.orderNo}`,
      duration: 10000,
      keepAliveOnHover: true,
      onClose: () => {
        router.push(`/member/orders/${data.orderNo}`)
      }
    })

    // 如果当前在订单详情页且是同一订单，自动刷新详情
    const currentRoute = router.currentRoute.value
    if (currentRoute.params.orderNo === data.orderNo) {
      orderStore.fetchDetail(data.orderNo, true)
    }
  })
  cleanups.push(unsubRefundRejected)

  // 组件卸载时清理监听器
  onUnmounted(() => {
    cleanups.forEach(fn => fn())
  })
}
