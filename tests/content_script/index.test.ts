import { afterEach, describe, expect, it, vi } from 'vitest'
import * as handler from '../../src/content_script/handler.ts'
import { readFileSync } from 'fs'
import { waitFor } from '@testing-library/react'
import { run } from '../../src/content_script'

const loadFormHTML = (fileName: string): void => {
  window.document.write(readFileSync([__dirname, fileName].join('/')).toString())
}

describe('src/content_script/index.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('kintone でエディタを開いた時', () => {
    loadFormHTML('../html/form.html')
    window.happyDOM.setURL('https://example.cybozu.com/k/#/space/1/thread/2')

    const element = document.getElementById('root-form') as HTMLElement
    // 初期状態はエディタが開いているので閉じる
    element.removeAttribute('aria-expanded')

    const openEditorHandlerSpy = vi.spyOn(handler, 'openEditorHandler')
    openEditorHandlerSpy.mockResolvedValue()

    run()

    element.setAttribute('aria-expanded', 'true')
    waitFor(() => {
      expect(openEditorHandlerSpy).toHaveBeenCalledTimes(1)
    }, { timeout: 1000 })

    openEditorHandlerSpy.mockReset()
    element.removeAttribute('aria-expanded')
    waitFor(() => {
      expect(openEditorHandlerSpy).not.toHaveBeenCalled()
    }, { timeout: 100 })
  })

  it('kintone 以外のサイトで aria-expanded 属性を変更した時', () => {
    loadFormHTML('../html/form.html')
    window.happyDOM.setURL('https://other.example.com/other/page')

    const element = document.getElementById('root-form') as HTMLElement
    // 初期状態はエディタが開いているので閉じる
    element.removeAttribute('aria-expanded')

    const openEditorHandlerSpy = vi.spyOn(handler, 'openEditorHandler')
    openEditorHandlerSpy.mockResolvedValue()

    run()

    element.setAttribute('aria-expanded', 'true')
    waitFor(() => {
      expect(openEditorHandlerSpy).not.toHaveBeenCalled()
    }, { timeout: 100 })
  })
})
