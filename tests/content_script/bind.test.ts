import { afterEach, describe, expect, it, vi } from 'vitest'
import { bindEventListener } from '../../src/content_script/bind.ts'

describe('src/content_script/bind.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('tests bindEventListener()', () => {
    const element = document.createElement('div')
    const callback = vi.fn()
    bindEventListener('key', element, 'click', callback)
    element.click()

    expect(callback).toHaveBeenCalledTimes(1)

    // 2回目の登録で，1回目の登録が解除されるか確認
    callback.mockReset()
    bindEventListener('key', element, 'click', callback)
    element.click()

    expect(callback).toHaveBeenCalledTimes(1)
  })
})
