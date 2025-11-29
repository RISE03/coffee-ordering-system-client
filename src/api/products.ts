/**
 * 商品与分类 API 模块
 *
 * 提供商品列表、分类、时间段推荐等接口
 */

import apiClient from './client'
import type {
  Category,
  Product,
  ProductListResponse,
  ProductQueryParams,
  RecommendationResponse,
  RecommendationQueryParams,
} from '@/types/product'

// ============================================================================
// 商品分类接口
// ============================================================================

/**
 * 获取商品分类列表
 * GET /api/categories
 */
export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>('/categories', { skipAuthRedirect: true } as any)
  return response.data
}

// ============================================================================
// 商品接口
// ============================================================================

/**
 * 获取商品列表（支持分页和筛选）
 * GET /api/products
 */
export async function getProducts(
  params?: ProductQueryParams
): Promise<ProductListResponse> {
  const response = await apiClient.get<ProductListResponse>('/products', {
    params,
    skipAuthRedirect: true
  } as any)
  return response.data
}

/**
 * 获取商品详情
 * GET /api/products/:id
 */
export async function getProductById(id: number): Promise<Product> {
  const response = await apiClient.get<Product>(`/products/${id}`)
  return response.data
}

// ============================================================================
// 时间段推荐接口
// ============================================================================

/**
 * 获取时间段推荐商品
 * GET /api/products/recommend
 *
 * 根据当前时间段（朝/午/暮）返回推荐商品列表
 * 如果不传 timeSlotCode，后端会根据服务器时间自动判断
 */
export async function getRecommendedProducts(
  params?: RecommendationQueryParams
): Promise<RecommendationResponse> {
  const response = await apiClient.get<RecommendationResponse>(
    '/products/recommend',
    { params, skipAuthRedirect: true } as any
  )
  return response.data
}
