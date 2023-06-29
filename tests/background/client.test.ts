import { afterEach, describe, expect, it, vi } from 'vitest'
import * as chrome from '../../src/extension.ts'
import {
  type ErrorResponse,
  type ExistKeyResponse, type GetAllRecordsResponse,
  type GetRecordResponse,
  type NotFoundResponse, type OkResponse
} from '../../src/background/message.ts'
import {
  deleteRecord,
  getAllRecords,
  getRecord,
  hasKey,
  recoveryPageWithNewTab,
  storeRecord
} from '../../src/background/client.ts'

describe('src/background/client.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('hasKey()', () => {
    it('キーが存在する時', async () => {
      const sendMessageSpy = vi.spyOn(chrome, 'sendMessage')
      sendMessageSpy.mockImplementation((_, fn: (response: ExistKeyResponse) => void) => {
        fn({ status: 'Ok', exist: true })
      })

      await expect(hasKey('key')).resolves.toBeTruthy()
    })

    it('キーが存在しない時', async () => {
      const sendMessageSpy = vi.spyOn(chrome, 'sendMessage')
      sendMessageSpy.mockImplementation((_, fn: (response: ExistKeyResponse) => void) => {
        fn({ status: 'Ok', exist: false })
      })

      await expect(hasKey('key')).resolves.toBeFalsy()
    })

    it('エラーが発生した時', async () => {
      const sendMessageSpy = vi.spyOn(chrome, 'sendMessage')
      sendMessageSpy.mockImplementation((_, fn: (response: ErrorResponse) => void) => {
        fn({ status: 'Error', message: 'something happened' })
      })

      await expect(hasKey('key')).rejects.toThrowError('something happened')
    })
  })

  describe('getRecord()', () => {
    it('レコードが存在する時', async () => {
      const record = {
        scope: 'thread.root',
        url: 'https://example.com',
        title: 'Example Title',
        iconUrl: 'https://example.com/icon',
        timestamp: 1234567890,
        content: 'Example Content'
      }

      const sendMessageSpy = vi.spyOn(chrome, 'sendMessage')
      sendMessageSpy.mockImplementation((_, fn: (response: GetRecordResponse) => void) => {
        fn({ status: 'Ok', record })
      })

      await expect(getRecord('key')).resolves.toEqual(record)
    })

    it('レコードが存在しない時', async () => {
      const sendMessageSpy = vi.spyOn(chrome, 'sendMessage')
      sendMessageSpy.mockImplementation((_, fn: (response: NotFoundResponse) => void) => {
        fn({ status: 'NotFoundError', message: 'record is not found' })
      })

      await expect(getRecord('key')).resolves.toBeNull()
    })

    it('エラーが発生した時', async () => {
      const sendMessageSpy = vi.spyOn(chrome, 'sendMessage')
      sendMessageSpy.mockImplementation((_, fn: (response: ErrorResponse) => void) => {
        fn({ status: 'Error', message: 'something happened' })
      })

      await expect(getRecord('key')).rejects.toThrowError('something happened')
    })
  })

  describe('storeRecord()', () => {
    it('処理が成功した時', async () => {
      const sendMessageSpy = vi.spyOn(chrome, 'sendMessage')
      sendMessageSpy.mockImplementation((_, fn: (response: OkResponse) => void) => {
        fn({ status: 'Ok' })
      })

      const record = {
        scope: 'thread.root',
        url: 'https://example.com',
        title: 'Example Title',
        iconUrl: 'https://example.com/icon',
        timestamp: 1234567890,
        content: 'Example Content'
      }
      await expect(storeRecord(record)).resolves.toBeUndefined()
    })

    it('エラーが発生した時', async () => {
      const sendMessageSpy = vi.spyOn(chrome, 'sendMessage')
      sendMessageSpy.mockImplementation((_, fn: (response: ErrorResponse) => void) => {
        fn({ status: 'Error', message: 'something happened' })
      })

      const record = {
        scope: 'thread.root',
        url: 'https://example.com',
        title: 'Example Title',
        iconUrl: 'https://example.com/icon',
        timestamp: 1234567890,
        content: 'Example Content'
      }
      await expect(storeRecord(record)).rejects.toThrowError('something happened')
    })
  })

  describe('getAllRecords()', () => {
    it('処理が成功した時', async () => {
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
      const sendMessageSpy = vi.spyOn(chrome, 'sendMessage')
      sendMessageSpy.mockImplementation((_, fn: (response: GetAllRecordsResponse) => void) => {
        fn({ status: 'Ok', records })
      })

      await expect(getAllRecords()).resolves.toEqual(records)
    })

    it('エラーが発生した時', async () => {
      const sendMessageSpy = vi.spyOn(chrome, 'sendMessage')
      sendMessageSpy.mockImplementation((_, fn: (response: ErrorResponse) => void) => {
        fn({ status: 'Error', message: 'something happened' })
      })

      await expect(getAllRecords()).rejects.toThrowError('something happened')
    })
  })

  describe('deleteRecord()', () => {
    it('処理が成功した時', async () => {
      const sendMessageSpy = vi.spyOn(chrome, 'sendMessage')
      sendMessageSpy.mockImplementation((_, fn: (response: OkResponse) => void) => {
        fn({ status: 'Ok' })
      })

      await expect(deleteRecord('key')).resolves.toBeUndefined()
    })

    it('エラーが発生した時', async () => {
      const sendMessageSpy = vi.spyOn(chrome, 'sendMessage')
      sendMessageSpy.mockImplementation((_, fn: (response: ErrorResponse) => void) => {
        fn({ status: 'Error', message: 'something happened' })
      })

      await expect(deleteRecord('key')).rejects.toThrowError('something happened')
    })
  })

  describe('recoveryPageWithNewTab()', () => {
    it('処理が成功した時', async () => {
      const sendMessageSpy = vi.spyOn(chrome, 'sendMessage')
      sendMessageSpy.mockImplementation((_, fn: (response: OkResponse) => void) => {
        fn({ status: 'Ok' })
      })

      await expect(recoveryPageWithNewTab('key')).resolves.toBeUndefined()
    })

    it('レコードが存在しないとき', async () => {
      const sendMessageSpy = vi.spyOn(chrome, 'sendMessage')
      sendMessageSpy.mockImplementation((_, fn: (response: ErrorResponse) => void) => {
        fn({ status: 'NotFoundError', message: 'record is not found' })
      })

      await expect(recoveryPageWithNewTab('key')).rejects.toThrowError('record is not found')
    })

    it('エラーが発生した時', async () => {
      const sendMessageSpy = vi.spyOn(chrome, 'sendMessage')
      sendMessageSpy.mockImplementation((_, fn: (response: ErrorResponse) => void) => {
        fn({ status: 'Error', message: 'something happened' })
      })

      await expect(recoveryPageWithNewTab('key')).rejects.toThrowError('something happened')
    })
  })
})
