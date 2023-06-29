import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'fs'
import { openEditorHandler, type Record } from '../../src/content_script/handler.ts'
import * as client from '../../src/background/client.ts'
import * as chrome from '../../src/extension.ts'
import { waitFor } from '@testing-library/react'

const loadFormHTML = (fileName: string): void => {
  window.document.write(readFileSync([__dirname, fileName].join('/')).toString())
}

describe('src/content_script/handler.ts', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('レコードがない時', async () => {
    document.title = 'title'
    loadFormHTML('../html/form.html')
    const element = document.getElementById('root-form') as HTMLElement

    const hasKeySpy = vi.spyOn(client, 'hasKey')
    hasKeySpy.mockResolvedValue(false)

    await openEditorHandler('thread.root', 'https://example.cybozu.com/k/#/space/1/thread/2', 'https://example.cybozu.com/icon', element)
    // 最初はレコードがないので復元ボタンは表示されない
    expect(document.getElementById('maimodorun-recovery-button')).toBeNull()

    const getURLSpy = vi.spyOn(chrome, 'getURL')
    getURLSpy.mockReturnValue('https://example.com/assets/icon48.png')

    // recordStore をモックして Map にレコードを保存する
    const recordStore = new Map<string, Record>()
    const storeRecordSpy = vi.spyOn(client, 'storeRecord')
    storeRecordSpy.mockImplementation(async (record) => {
      recordStore.set(record.url, record)
    })

    // テキストエリアにテキストを入力すると2秒後に保存処理が動く
    const textArea = element.querySelector('.ocean-ui-editor-field') as HTMLElement
    textArea.innerHTML = 'Test Text'
    await waitFor(() => {
      expect(document.getElementById('maimodorun-recovery-button')).not.toBeNull()
      expect(document.getElementById('maimodorun-auto-save-sign')).not.toBeNull()
    }, { timeout: 2500 })

    // テキストエリアの内容を変更すると自動保存のサインが消える
    textArea.innerHTML = 'Changed Text'
    expect(document.getElementById('maimodorun-auto-save-sign')).toBeNull()

    // getRecord をモックして Map からレコードを取得する
    const getRecordSpy = vi.spyOn(client, 'getRecord')
    getRecordSpy.mockImplementation(async (url) => recordStore.get(url) ?? null)

    // 復元ボタンをクリックするとテキストエリアに保存した内容が復元される
    const recoveryButton = document.getElementById('maimodorun-recovery-button') as HTMLElement
    recoveryButton.click()
    await waitFor(() => {
      expect(textArea.innerHTML).toBe('Test Text')
    }, { timeout: 1000 })
  })

  it('レコードがある時', async () => {
    loadFormHTML('../html/form.html')
    const element = document.getElementById('root-form') as HTMLElement

    const hasKeySpy = vi.spyOn(client, 'hasKey')
    hasKeySpy.mockResolvedValue(true)

    const getURLSpy = vi.spyOn(chrome, 'getURL')
    getURLSpy.mockReturnValue('https://example.com/assets/icon48.png')

    await openEditorHandler('thread.root', 'https://example.cybozu.com/k/#/space/1/thread/2', 'https://example.cybozu.com/k/img/record_icon.png', element)
    expect(document.getElementById('maimodorun-recovery-button')).not.toBeNull()
  })

  it('エディタを閉じた時', async () => {
    loadFormHTML('../html/form.html')
    const element = document.getElementById('root-form') as HTMLElement

    const hasKeySpy = vi.spyOn(client, 'hasKey')
    hasKeySpy.mockResolvedValue(false)

    const getURLSpy = vi.spyOn(chrome, 'getURL')
    getURLSpy.mockReturnValue('https://example.com/assets/icon48.png')

    const recordStore = new Map<string, Record>()
    const storeRecordSpy = vi.spyOn(client, 'storeRecord')
    storeRecordSpy.mockImplementation(async (record) => {
      recordStore.set(record.url, record)
    })

    await openEditorHandler('thread.root', 'https://example.cybozu.com/k/#/space/1/thread/2', 'https://example.cybozu.com/k/img/record_icon.png', element)
    const textArea = element.querySelector('.ocean-ui-editor-field') as HTMLElement
    textArea.innerHTML = 'Submit'

    const submitElement = element.querySelector('.ocean-ui-comments-commentform-submit') as HTMLElement
    submitElement.click()
    await waitFor(() => {
      const record = recordStore.get('https://example.cybozu.com/k/#/space/1/thread/2')
      expect(record?.url).toBe('https://example.cybozu.com/k/#/space/1/thread/2')
      expect(record?.content).toBe('Submit')
    }, { timeout: 1000 })

    textArea.innerHTML = 'Cancel'
    const cancelElement = element.querySelector('.ocean-ui-comments-commentform-cancel') as HTMLElement
    cancelElement.click()
    await waitFor(() => {
      const record = recordStore.get('https://example.cybozu.com/k/#/space/1/thread/2')
      expect(record?.url).toBe('https://example.cybozu.com/k/#/space/1/thread/2')
      expect(record?.content).toBe('Submit')
    }, { timeout: 1000 })
  })

  it('フォームが空の時', async () => {
    loadFormHTML('../html/form.html')
    const element = document.getElementById('root-form') as HTMLElement

    const hasKeySpy = vi.spyOn(client, 'hasKey')
    hasKeySpy.mockResolvedValue(false)

    const getURLSpy = vi.spyOn(chrome, 'getURL')
    getURLSpy.mockReturnValue('https://example.com/assets/icon48.png')

    const storeRecordSpy = vi.spyOn(client, 'storeRecord')
    storeRecordSpy.mockResolvedValue()

    await openEditorHandler('thread.root', 'https://example.cybozu.com/k/#/space/1/thread/2', 'https://example.cybozu.com/k/img/record_icon.png', element)
    const textArea = element.querySelector('.ocean-ui-editor-field') as HTMLElement

    // 空の時は保存処理が動かない
    textArea.innerHTML = ''
    const submitElement = element.querySelector('.ocean-ui-comments-commentform-submit') as HTMLElement
    submitElement.click()
    await waitFor(() => {
      expect(storeRecordSpy).not.toHaveBeenCalled()
    }, { timeout: 100 })

    // 空白のみの時は保存処理が動かない
    textArea.innerHTML = '   '
    submitElement.click()
    await waitFor(() => {
      expect(storeRecordSpy).not.toHaveBeenCalled()
    }, { timeout: 100 })

    // テキストが空のHTMLタグの時のみは保存処理が動かない
    textArea.innerHTML = '<div><div>'
    submitElement.click()
    await waitFor(() => {
      expect(storeRecordSpy).not.toHaveBeenCalled()
    }, { timeout: 100 })

    // 組み合わせ
    textArea.innerHTML = '<div> <span>   </span> </div>'
    submitElement.click()
    await waitFor(() => {
      expect(storeRecordSpy).not.toHaveBeenCalled()
    }, { timeout: 100 })
  })

  it('テキストが65535文字以上の時', async () => {
    loadFormHTML('../html/form.html')
    const element = document.getElementById('root-form') as HTMLElement

    const hasKeySpy = vi.spyOn(client, 'hasKey')
    hasKeySpy.mockResolvedValue(false)

    const getURLSpy = vi.spyOn(chrome, 'getURL')
    getURLSpy.mockReturnValue('https://example.com/assets/icon48.png')

    const recordStore = new Map<string, Record>()
    const storeRecordSpy = vi.spyOn(client, 'storeRecord')
    storeRecordSpy.mockImplementation(async (record) => {
      recordStore.set(record.url, record)
    })

    await openEditorHandler('thread.root', 'https://example.cybozu.com/k/#/space/1/thread/2', 'https://example.cybozu.com/k/img/record_icon.png', element)
    const textArea = element.querySelector('.ocean-ui-editor-field') as HTMLElement
    textArea.innerHTML = 'a'.repeat(65536)

    const submitElement = element.querySelector('.ocean-ui-comments-commentform-submit') as HTMLElement
    submitElement.click()
    await waitFor(() => {
      const record = recordStore.get('https://example.cybozu.com/k/#/space/1/thread/2')
      expect(record?.content).toHaveLength(65535)
    }, { timeout: 1000 })
  })
})
