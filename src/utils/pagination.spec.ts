import { describe, expect, it } from 'vitest'
import { paginateList } from './pagination'

describe('paginateList', () => {
  it('空列表应返回空分页结果', () => {
    const result = paginateList([], 3, 6)

    expect(result).toEqual({
      list: [],
      page: 1,
      size: 6,
      total: 0,
      totalPages: 0,
      start: 0,
      end: 0,
    })
  })

  it('应返回指定页的数据切片', () => {
    const result = paginateList([1, 2, 3, 4, 5, 6, 7], 2, 3)

    expect(result).toEqual({
      list: [4, 5, 6],
      page: 2,
      size: 3,
      total: 7,
      totalPages: 3,
      start: 4,
      end: 6,
    })
  })

  it('页码越界时应自动收敛到最后一页', () => {
    const result = paginateList([1, 2, 3, 4, 5], 9, 2)

    expect(result).toEqual({
      list: [5],
      page: 3,
      size: 2,
      total: 5,
      totalPages: 3,
      start: 5,
      end: 5,
    })
  })
})
