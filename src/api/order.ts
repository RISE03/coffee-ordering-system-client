/**
 * Order API
 * API wrapper for order operations
 */

import apiClient from './client'
import type {
  OrderListResponse,
  OrderDetailResponse,
  CancelOrderResponse,
  OrderStatus,
} from '@/types/order'

/**
 * Get order list with pagination and optional status filter
 */
export async function getOrders(params: {
  page?: number
  size?: number
  status?: OrderStatus | OrderStatus[]
}): Promise<OrderListResponse> {
  const { page = 1, size = 10, status } = params

  // Convert status array to comma-separated string if needed
  const statusParam = Array.isArray(status) ? status.join(',') : status

  const res = await apiClient.get<OrderListResponse>('/member/orders', {
    params: {
      page,
      size,
      ...(statusParam && { status: statusParam }),
    },
  })
  return res.data as OrderListResponse
}

/**
 * Get order detail by order number
 */
export async function getOrderDetail(orderNo: string): Promise<OrderDetailResponse> {
  const res = await apiClient.get<OrderDetailResponse>(`/member/orders/${orderNo}`)
  return res.data as OrderDetailResponse
}

/**
 * Cancel a pending payment order
 */
export async function cancelOrder(orderNo: string): Promise<CancelOrderResponse> {
  const res = await apiClient.post<CancelOrderResponse>(`/member/orders/${orderNo}/cancel`)
  return res.data as CancelOrderResponse
}