/**
 * Order API
 * API wrapper for order operations
 *
 * 后端返回的 status 为 Integer、字段为平铺结构，
 * 本层负责映射为前端语义化类型（OrderStatus 字符串、嵌套对象）。
 */

import apiClient from './client'
import type {
  OrderListResponse,
  OrderListItem,
  OrderDetailResponse,
  CancelOrderResponse,
  OrderStatus,
  OrderTimelineEvent,
  RefundApplyRequest,
  RefundApplyResponse,
} from '@/types/order'

// ============================================================================
// 后端 → 前端 状态映射
// ============================================================================

const STATUS_INT_TO_STR: Record<number, OrderStatus> = {
  0: 'PENDING_PAYMENT',
  1: 'PAID_WAITING',
  2: 'IN_PREPARATION',
  3: 'READY_FOR_PICKUP',
  4: 'COMPLETED',
  5: 'CANCELLED',
  6: 'REFUNDING',
  7: 'REFUNDED',
}

const STATUS_STR_TO_INT: Record<string, number> = Object.fromEntries(
  Object.entries(STATUS_INT_TO_STR).map(([k, v]) => [v, Number(k)])
)

const PICKUP_TYPE_INT_TO_STR: Record<number, 'SELF_PICKUP' | 'DELIVERY'> = {
  0: 'SELF_PICKUP',
  1: 'DELIVERY',
}

function mapStatus(raw: number | string): OrderStatus {
  if (typeof raw === 'string' && isNaN(Number(raw))) return raw as OrderStatus
  return STATUS_INT_TO_STR[Number(raw)] ?? 'PENDING_PAYMENT'
}

// ============================================================================
// 后端原始响应类型（仅 API 层内部使用）
// ============================================================================
/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// 映射函数
// ============================================================================

function mapListItem(raw: any): OrderListItem {
  return {
    orderNo: raw.orderNo,
    status: mapStatus(raw.status),
    createdAt: raw.createdAt,
    completeTime: raw.completeTime ?? raw.completedAt ?? undefined,
    itemsPreview: raw.itemsPreview,
    itemsAmount: raw.itemsAmount ?? 0,
    discountAmount: raw.discountAmount ?? 0,
    payAmount: raw.payAmount ?? 0,
  }
}

function mapTimeline(raw: any): OrderTimelineEvent[] {
  // 优先使用 statusHistory（新接口，每步状态变更都有记录）
  const history: any[] = raw.statusHistory ?? []
  if (Array.isArray(history) && history.length > 0) {
    return history.map((e) => ({
      status: mapStatus(e.status),
      time: e.time,
    }))
  }

  // 旧订单 fallback：用 timeline 字段
  const timeline: any[] = raw.timeline ?? []
  if (Array.isArray(timeline) && timeline.length > 0) {
    return timeline.map((e) => ({
      status: mapStatus(e.status),
      time: e.time,
      description: e.description,
    }))
  }

  // 兜底：用各时间字段构建
  const events: OrderTimelineEvent[] = []
  if (raw.createTime) {
    events.push({ status: 'PENDING_PAYMENT', time: raw.createTime })
  }
  if (raw.payTime) {
    events.push({ status: 'PAID_WAITING', time: raw.payTime })
  }
  if (raw.completeTime) {
    events.push({ status: 'COMPLETED', time: raw.completeTime })
  }
  if (raw.cancelTime) {
    events.push({ status: 'CANCELLED', time: raw.cancelTime })
  }
  return events
}

function mapDetail(raw: any): OrderDetailResponse {
  return {
    orderNo: raw.orderNo,
    status: mapStatus(raw.status),
    timeline: mapTimeline(raw),
    pickupInfo: {
      type: PICKUP_TYPE_INT_TO_STR[raw.pickupType] ?? 'SELF_PICKUP',
      name: raw.pickupName ?? '',
      phone: raw.pickupPhone ?? '',
      pickupCode: raw.pickupCode ?? undefined,
      address: raw.pickupAddress ?? undefined,
    },
    coupon: raw.couponUsed
      ? { name: raw.couponUsed.name, discountAmount: raw.couponUsed.discountAmount }
      : undefined,
    items: raw.items ?? [],
    priceBreakdown: {
      itemsAmount: raw.totalAmount ?? raw.itemsAmount ?? 0,
      discountAmount: raw.discountAmount ?? 0,
      payAmount: raw.payAmount ?? 0,
    },
    pointsEarned: raw.pointsEarned ?? undefined,
    pointsEstimate: raw.pointsEstimate ?? undefined,
    remark: raw.remark ?? undefined,
    createdAt: raw.createdAt,
    refundRejectReason: raw.refundRejectReason ?? undefined,
  }
}

// ============================================================================
// API 函数
// ============================================================================

/**
 * 获取订单列表（分页 + 状态筛选）
 */
export async function getOrders(params: {
  page?: number
  size?: number
  status?: OrderStatus | OrderStatus[]
}): Promise<OrderListResponse> {
  const { page = 1, size = 10, status } = params
  const statusParam = Array.isArray(status)
    ? status.map(s => STATUS_STR_TO_INT[s] ?? s).join(',')
    : status ? (STATUS_STR_TO_INT[status] ?? status) : undefined

  const res = await apiClient.get<any>('/member/orders', {
    params: {
      page,
      size,
      ...(statusParam != null && { status: statusParam }),
    },
  })

  const raw = res.data as any
  return {
    list: (raw.list ?? []).map(mapListItem),
    page: {
      total: raw.page?.total ?? 0,
      page: raw.page?.current ?? raw.page?.page ?? 1,
      size: raw.page?.size ?? size,
    },
  }
}

/**
 * 获取订单详情
 */
export async function getOrderDetail(orderNo: string): Promise<OrderDetailResponse> {
  const res = await apiClient.get<any>(`/member/orders/${orderNo}`)
  return mapDetail(res.data)
}

/**
 * 取消待支付订单
 */
export async function cancelOrder(orderNo: string): Promise<CancelOrderResponse> {
  const res = await apiClient.post<any>(`/member/orders/${orderNo}/cancel`)
  const raw = res.data as any
  return {
    status: mapStatus(raw.status ?? raw),
  }
}

/**
 * 申请退款
 */
export async function refundOrder(
  orderNo: string,
  data: RefundApplyRequest
): Promise<RefundApplyResponse> {
  const res = await apiClient.post<any>(`/member/orders/${orderNo}/refund/apply`, data)
  const raw = res.data as any
  return {
    status: mapStatus(raw.status ?? raw),
    message: raw.message,
  }
}

/**
 * 撤销退款申请
 */
export async function cancelRefund(orderNo: string): Promise<void> {
  await apiClient.post(`/member/orders/${orderNo}/refund/cancel`)
}

/**
 * 上传退款图片
 */
export async function uploadRefundImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await apiClient.post<any>('/upload/refund-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return res.data.url || res.data.imageUrl || res.data
}
