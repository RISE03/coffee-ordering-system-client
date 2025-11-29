import { describe, it, expect } from 'vitest'

describe('测试环境验证', () => {
  it('基础断言应该通过', () => {
    expect(1 + 1).toBe(2)
  })

  it('数组操作应该正常', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })
})
