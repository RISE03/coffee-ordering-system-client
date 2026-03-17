/**
 * 前端本地分页工具
 */

export interface ClientPaginationResult<T> {
  /** 当前页数据 */
  list: T[]
  /** 当前页码（已自动收敛） */
  page: number
  /** 每页条数 */
  size: number
  /** 总条数 */
  total: number
  /** 总页数 */
  totalPages: number
  /** 当前页起始序号（从 1 开始） */
  start: number
  /** 当前页结束序号（从 1 开始） */
  end: number
}

/**
 * 对本地列表做安全分页
 */
export function paginateList<T>(
  list: T[],
  page = 1,
  size = 10,
): ClientPaginationResult<T> {
  const safeSize = Number.isFinite(size) && size > 0 ? Math.floor(size) : 10
  const total = list.length

  if (total === 0) {
    return {
      list: [],
      page: 1,
      size: safeSize,
      total: 0,
      totalPages: 0,
      start: 0,
      end: 0,
    }
  }

  const totalPages = Math.ceil(total / safeSize)
  const safePage = Math.min(Math.max(Math.floor(page) || 1, 1), totalPages)
  const startIndex = (safePage - 1) * safeSize
  const pageList = list.slice(startIndex, startIndex + safeSize)

  return {
    list: pageList,
    page: safePage,
    size: safeSize,
    total,
    totalPages,
    start: startIndex + 1,
    end: startIndex + pageList.length,
  }
}
