import { beforeEach, describe, expect, it } from 'vitest'
import 'fake-indexeddb/auto'
import { Storage } from '../../src/background/storage.ts'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { IDBFactory } from 'fake-indexeddb'

const storageOption = {
  databaseName: 'maimodorun-test',
  objectStoreName: 'records',
  version: 1,
  maxRecordCount: 2
}

describe('src/background/storage.ts', () => {
  beforeEach(() => {
    // eslint-disable-next-line no-global-assign
    indexedDB = new IDBFactory()
  })

  it('tests get()', async () => {
    // レコードがない時
    const storage = await Storage.create(storageOption)
    await expect(storage.get('unknown-key')).resolves.toBeNull()

    const record = {
      scope: 'thread.root',
      url: 'https://example.com',
      title: 'Example Title',
      iconUrl: 'https://example.com/icon',
      timestamp: 1234567890,
      content: 'Example Content'
    }
    await expect(storage.set(record)).resolves.toBeUndefined()

    // レコードがある時
    await expect(storage.get('https://example.com')).resolves.toEqual(record)
  })

  it('tests getAll()', async () => {
    const storage = await Storage.create(storageOption)
    // レコードがない時
    await expect(storage.getAll()).resolves.toEqual([])

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
    for (const record of records) {
      await expect(storage.set(record)).resolves.toBeUndefined()
    }

    // レコードがある時
    await expect(storage.getAll()).resolves.toMatchObject(records.reverse())
  })

  it('tests hasKey()', async () => {
    const storage = await Storage.create(storageOption)
    // レコードがない時
    await expect(storage.hasKey('unknown-key')).resolves.toBeFalsy()

    const record = {
      scope: 'thread.root',
      url: 'https://example.com',
      title: 'Example Title',
      iconUrl: 'https://example.com/icon',
      timestamp: 1234567890,
      content: 'Example Content'
    }
    await expect(storage.set(record)).resolves.toBeUndefined()

    // レコードがある時
    await expect(storage.hasKey('https://example.com')).resolves.toBeTruthy()
  })

  it('tests set()', async () => {
    const storage = await Storage.create(storageOption)
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
    }, {
      scope: 'thread.nested',
      url: 'https://example.com/3',
      title: 'Example Title 3',
      iconUrl: 'https://example.com/icon',
      timestamp: 1234567899,
      content: 'Example Content 3'
    }]
    for (const record of records) {
      await expect(storage.set(record)).resolves.toBeUndefined()
    }

    // maxRecordCount が 2 なので，古いレコードは削除される
    await expect(storage.getAll()).resolves.toMatchObject(records.slice(1).reverse())
  })

  it('tests delete()', async () => {
    const storage = await Storage.create(storageOption)
    // レコードがない時
    await expect(storage.delete('unknown-key')).resolves.toBeUndefined()

    const record = {
      scope: 'thread.root',
      url: 'https://example.com',
      title: 'Example Title',
      iconUrl: 'https://example.com/icon',
      timestamp: 1234567890,
      content: 'Example Content'
    }
    await expect(storage.set(record)).resolves.toBeUndefined()

    // レコードがある時
    // 消す前はレコードがある
    await expect(storage.get('https://example.com')).resolves.toEqual(record)
    await expect(storage.delete('https://example.com')).resolves.toBeUndefined()
    // 消したらない
    await expect(storage.get('https://example.com')).resolves.toBeNull()
  })
})
