/**
 * Cart API
 *
 * API wrapper for shopping cart operations
 */

import apiClient from './client'
import type {
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
} from '@/types/cart'

/**
 * Get current user's cart
 */
export async function getCart(): Promise<CartResponse> {
  const res = await apiClient.get<CartResponse>('/member/cart')
  return res.data as CartResponse
}

/**
 * Add item to cart (merges if product already exists)
 */
export async function addToCart(data: AddToCartRequest): Promise<CartResponse> {
  const res = await apiClient.post<CartResponse>('/member/cart/items', data)
  return res.data as CartResponse
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  productId: number,
  data: UpdateCartItemRequest
): Promise<CartResponse> {
  const res = await apiClient.put<CartResponse>(`/member/cart/items/${productId}`, data)
  return res.data as CartResponse
}

/**
 * Remove item from cart
 */
export async function removeCartItem(productId: number): Promise<CartResponse> {
  const res = await apiClient.delete<CartResponse>(`/member/cart/items/${productId}`)
  return res.data as CartResponse
}

/**
 * Clear entire cart
 */
export async function clearCart(): Promise<void> {
  await apiClient.delete('/member/cart')
}
