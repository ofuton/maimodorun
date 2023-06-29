import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import 'fake-indexeddb/auto'
import * as extension from '../../src/extension.ts'
import { Storage } from '../../src/background/storage.ts'
import {
  deleteRecordHandler,
  existRecordHandler,
  getAllRecordsHandler,
  getRecordHandler, recoveryPageWithNewTabHandler,
  storeRecordHandler
} from '../../src/background/handler.ts'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { IDBFactory } from 'fake-indexeddb'
import { waitFor } from '@testing-library/react'

const storageOption = {
  databaseName: 'maimodorun-test',
  objectStoreName: 'records',
  version: 1,
  maxRecordCount: 5
}

describe('src/background/handler.ts', () => {
  beforeEach(() => {
    // eslint-disable-next-line no-global-assign
    indexedDB = new IDBFactory()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getRecordHandler()', () => {
    it('レコードが存在する時', async () => {
      const record = {
        scope: 'thread.root',
        url: 'https://example.com',
        title: 'Example Title',
        iconUrl: 'https://example.com/icon',
        timestamp: 1234567890,
        content: 'Example Content'
      }

      const storage = await Storage.create(storageOption)
      await expect(storeRecordHandler(storage, record)).resolves.toEqual({ status: 'Ok' })

      await expect(getRecordHandler(storage, record.url)).resolves.toEqual({ status: 'Ok', record })
    })

    it('レコードが存在しない時', async () => {
      const storage = await Storage.create(storageOption)
      await expect(getRecordHandler(storage, 'unknown-key')).resolves.toEqual({ status: 'NotFoundError', message: 'Record not found' })
    })
  })

  describe('existRecordHandler()', () => {
    it('キーが存在する時', async () => {
      const record = {
        scope: 'thread.root',
        url: 'https://example.com',
        title: 'Example Title',
        iconUrl: 'https://example.com/icon',
        timestamp: 1234567890,
        content: 'Example Content'
      }

      const storage = await Storage.create(storageOption)
      await expect(storeRecordHandler(storage, record)).resolves.toEqual({ status: 'Ok' })

      await expect(existRecordHandler(storage, record.url)).resolves.toEqual({ status: 'Ok', exist: true })
    })

    it('キーが存在しない時', async () => {
      const storage = await Storage.create(storageOption)
      await expect(existRecordHandler(storage, 'unknown-key')).resolves.toEqual({ status: 'Ok', exist: false })
    })
  })

  describe('getAllRecordsHandler()', () => {
    it('レコードが存在する時', async () => {
      const records = [{
        scope: 'thread.root',
        url: 'https://example.com/1',
        title: 'Example Title 1',
        iconUrl: 'https://example.com/icon',
        timestamp: 1234567890,
        content: 'Example Content 1'
      }, {
        scope: 'thread.nested',
        url: 'https://example.com/2',
        title: 'Example Title 2',
        iconUrl: 'https://example.com/icon',
        timestamp: 1234567895,
        content: 'Example Content 2'
      }]
      const storage = await Storage.create(storageOption)
      for (const record of records) {
        await expect(storeRecordHandler(storage, record)).resolves.toEqual({ status: 'Ok' })
      }

      // Storage は後に入れたものが先頭に来るため，比較するときは逆順にする
      await expect(getAllRecordsHandler(storage)).resolves.toMatchObject({ status: 'Ok', records: records.reverse() })
    })

    it('レコードが存在しないとき', async () => {
      const storage = await Storage.create(storageOption)
      await expect(getAllRecordsHandler(storage)).resolves.toMatchObject({ status: 'Ok', records: [] })
    })
  })

  describe('deleteRecordHandler()', () => {
    it('レコードが存在する時', async () => {
      const record = {
        scope: 'thread.root',
        url: 'https://example.com',
        title: 'Example Title',
        iconUrl: 'https://example.com/icon',
        timestamp: 1234567890,
        content: 'Example Content'
      }

      const storage = await Storage.create(storageOption)
      await expect(storeRecordHandler(storage, record)).resolves.toEqual({ status: 'Ok' })

      await expect(deleteRecordHandler(storage, record.url)).resolves.toEqual({ status: 'Ok' })
    })

    it('レコードが存在しない時', async () => {
      const storage = await Storage.create(storageOption)
      await expect(deleteRecordHandler(storage, 'unknown-key')).resolves.toEqual({ status: 'Ok' })
    })
  })

  describe('recoveryPageWithNewTab()', () => {
    it('レコードが存在する時', async () => {
      const record = {
        scope: 'thread.root',
        url: 'https://example.com',
        title: 'Example Title',
        iconUrl: 'https://example.com/icon',
        timestamp: 1234567890,
        content: 'Example Content'
      }

      const storage = await Storage.create(storageOption)
      await expect(storeRecordHandler(storage, record)).resolves.toEqual({ status: 'Ok' })

      const createTabSpyOn = vi.spyOn(extension, 'createTab')
      createTabSpyOn.mockReturnValue(Promise.resolve(1))

      // あとで登録された listener を直接実行するために，addListenerForOnUpdated が実行されたら listener を listenerList に格納する
      const listenerList: Array<(tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => void> = []
      const addListenerForOnUpdatedSpyOn = vi.spyOn(extension, 'addListenerForOnUpdated')
      addListenerForOnUpdatedSpyOn.mockImplementation((listener) => {
        listenerList.push(listener)
      })

      // removeListenerForOnUpdated が実行されたら listener を listenerList から削除する
      const removeListenerForOnUpdatedSpyOn = vi.spyOn(extension, 'removeListenerForOnUpdated')
      removeListenerForOnUpdatedSpyOn.mockImplementation((listener) => {
        listenerList.filter((callback) => callback !== listener)
      })

      const sendMessageToTabSpyOn = vi.spyOn(extension, 'sendMessageToTab')
      sendMessageToTabSpyOn.mockImplementation((_tabId, _message, onSend) => {
        onSend({})
      })

      // 登録された listener を実行するまで result は pending のまま
      const result = recoveryPageWithNewTabHandler(storage, record.url)
      waitFor(() => {
        // listenerList に listener が登録されるまで待つ
        expect(listenerList).toHaveLength(1)
        // tabId が 2 のときは登録された listener は実行されない
        listenerList[0](2, { status: 'complete' })
        // tabId が 1 のときは登録された listener が実行される (createTab で返された tabId と一致するため)
        listenerList[0](1, { status: 'complete' })
      })

      // listener が実行されたら result が resolve される
      await expect(result).resolves.toEqual({ status: 'Ok' })
      expect(createTabSpyOn).toBeCalledWith({ url: record.url })
      expect(addListenerForOnUpdatedSpyOn).toBeCalledTimes(1)
      // listener が実行されたら removeListenerForOnUpdated が一度だけ実行される
      expect(removeListenerForOnUpdatedSpyOn).toBeCalledTimes(1)
      // listener が複数実行されていても tabId と一致した場合しか sendMessageToTab は実行されない
      expect(sendMessageToTabSpyOn).toBeCalledTimes(1)
      // sendMessageToTab が実行されたら listener が削除されリストが空になる
      waitFor(() => {
        expect(listenerList).toEqual([])
      })
    })

    it('レコードが存在しない時', async () => {
      const storage = await Storage.create(storageOption)
      await expect(recoveryPageWithNewTabHandler(storage, 'unknown-key')).resolves.toEqual({ status: 'NotFoundError', message: 'Record not found' })
    })
  })
})
