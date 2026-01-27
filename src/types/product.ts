/**
 * 产品与分类类型定义
 *
 * 定义商品、分类、推荐等相关类型，用于首页展示
 */

// ============================================================================
// 商品分类
// ============================================================================

/**
 * 商品分类
 */
export interface Category {
  /** 分类 ID */
  id: number
  /** 分类名称（如"咖啡"、"饮品"、"甜点"） */
  name: string
  /** 分类图标（可选，URL） */
  icon?: string
}

// ============================================================================
// 商品
// ============================================================================

/**
 * 商品信息
 */
export interface Product {
  /** 商品 ID */
  id: number
  /** 商品名称（中文） */
  name: string
  /** 英文名称（可选） */
  englishName?: string
  /** 价格 */
  price: number
  /** 商品图片 URL */
  imageUrl?: string
  /** 所属分类 ID */
  categoryId: number
  /** 商品状态（1=上架，0=下架） */
  status?: number
  /** 商品描述 */
  description?: string
  /** 标签（如"醒神推荐"、"晚霞"） */
  tag?: string
  /** 标签列表 */
  tags?: string[]
}

/**
 * 商品列表响应（分页）
 */
export interface ProductListResponse {
  /** 总记录数 */
  total: number
  /** 商品列表 */
  list: Product[]
}

// ============================================================================
// 时间段推荐
// ============================================================================

/**
 * 时间段编码
 * - dawn: 朝（06:00-17:59）
 * - dusk: 暮（18:00-05:59）
 */
export type TimeSlotCode = 'dawn' | 'midday' | 'dusk'

/**
 * 时间段推荐响应
 */
export interface RecommendationResponse {
  /** 时间段编码 */
  timeSlotCode: TimeSlotCode
  /** 时间段名称（如"朝·醒"、"暮·微醺"） */
  timeSlotName: string
  /** 推荐商品列表 */
  products: Product[]
}

// ============================================================================
// API 请求参数
// ============================================================================

/**
 * 商品列表查询参数
 */
export interface ProductQueryParams {
  /** 分类 ID（可选） */
  categoryId?: number
  /** 关键字搜索（可选） */
  keyword?: string
  /** 页码（从 1 开始） */
  page?: number
  /** 每页条数 */
  size?: number
}

/**
 * 推荐商品查询参数
 */
export interface RecommendationQueryParams {
  /** 场景标识（可选，如 home） */
  scene?: string
  /** 时间段编码（可选，不传则后端自动判断） */
  timeSlotCode?: TimeSlotCode
}
