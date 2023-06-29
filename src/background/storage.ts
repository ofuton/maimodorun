import { type Record } from '../content_script/handler.ts'

interface StorageOptions {
  databaseName: string
  objectStoreName: string
  version: number
  maxRecordCount: number
}

const errorMessage = (request: IDBRequest | IDBTransaction): string => {
  return request.error?.message ?? 'unknown error'
}

export class Storage {
  constructor (private readonly database: IDBDatabase, private readonly objectStoreName: string, private readonly maxRecordCount: number) {
  }

  public static async create (options: StorageOptions): Promise<Storage> {
    const request = indexedDB.open(options.databaseName, options.version)

    return await new Promise((resolve, reject) => {
      request.onerror = () => {
        reject(new Error(`Failed to open database: ${errorMessage(request)}`))
      }

      request.onsuccess = () => {
        resolve(new Storage(request.result, options.objectStoreName, options.maxRecordCount))
      }

      request.onupgradeneeded = (event) => {
        const database = request.result

        switch (event.oldVersion) {
          case 0:
            // 初めてデータベースを作成する場合の初期化処理
            initializeObjectStore(database, options.objectStoreName)
            break
        }
      }
    })
  }

  public async get (key: string): Promise<Record | null> {
    const transaction = new Transaction<Record>(this.database, this.objectStoreName, 'readonly')

    return await transaction.commit(await transaction.get(key))
  }

  public async getAll (): Promise<Record[]> {
    const transaction = new Transaction<Record>(this.database, this.objectStoreName, 'readonly')

    return await transaction.commit(await transaction.getRange('timestamp', this.maxRecordCount, 'prev'))
  }

  public async hasKey (key: string): Promise<boolean> {
    const transaction = new Transaction<Record>(this.database, this.objectStoreName, 'readonly')

    return await transaction.commit(await transaction.hasKey(key))
  }

  public async set (record: Record): Promise<void> {
    const transaction = new Transaction<Record>(this.database, this.objectStoreName, 'readwrite')

    await transaction.set(record)
    const recordCount = await transaction.count()
    if (recordCount > this.maxRecordCount) {
      const oldestRecord: Record | null = (await transaction.getRange('timestamp', 1, 'next'))[0]
      if (oldestRecord != null) {
        await transaction.delete(oldestRecord.url)
      }
    }

    await transaction.commit(undefined)
  }

  public async delete (key: string): Promise<void> {
    const transaction = new Transaction<Record>(this.database, this.objectStoreName, 'readwrite')

    await transaction.delete(key)
    await transaction.commit(undefined)
  }
}

type IndexName = 'timestamp'

interface Index {
  name: IndexName
  property: string
  unique: boolean
}

const indices: Index[] = [
  {
    name: 'timestamp',
    property: 'timestamp',
    unique: false
  }
]

const initializeObjectStore = (database: IDBDatabase, storeName: string): void => {
  const store = database.createObjectStore(storeName, { keyPath: 'url' })
  indices.forEach(index => {
    store.createIndex(index.name, index.property, { unique: index.unique })
  })
}

class Transaction<T> {
  private readonly transaction: IDBTransaction
  private readonly store: IDBObjectStore

  constructor (database: IDBDatabase, storeName: string, mode: IDBTransactionMode) {
    this.transaction = database.transaction(storeName, mode)
    this.store = this.transaction.objectStore(storeName)
  }

  public async commit<R>(result: R): Promise<R> {
    return await new Promise<R>((resolve, reject) => {
      this.transaction.onerror = () => {
        reject(new Error(`Transaction failed: ${errorMessage(this.transaction)}`))
      }

      this.transaction.oncomplete = () => {
        resolve(result)
      }
    })
  }

  public async get (key: string): Promise<T | null> {
    const request = this.store.get(key) as IDBRequest<T | null>

    return await new Promise<T | null>((resolve, reject) => {
      request.onerror = () => {
        reject(new Error(`Failed to get record: ${errorMessage(request)}`))
      }

      request.onsuccess = () => {
        const result = request.result
        if (result != null) {
          resolve(result)
        }

        // レコードが存在しない時は request.result が undefined になるので明示的に null を返す
        resolve(null)
      }
    })
  }

  public async getRange (indexName: IndexName, limit: number, direction: IDBCursorDirection): Promise<T[]> {
    const index = this.store.index(indexName)
    const request = index.openCursor(null, direction)

    return await new Promise<T[]>((resolve, reject) => {
      request.onerror = () => {
        reject(new Error(`Failed to get records: ${errorMessage(request)}`))
      }

      const records: T[] = []
      request.onsuccess = () => {
        const cursor = request.result
        if ((cursor != null) && records.length < limit) {
          records.push(cursor.value as T)
          cursor.continue()
        } else {
          resolve(records)
        }
      }
    })
  }

  public async hasKey (key: string): Promise<boolean> {
    const request = this.store.getKey(key) as IDBRequest<string | undefined>

    return await new Promise<boolean>((resolve, reject) => {
      request.onerror = () => {
        reject(new Error(`Failed to get key: ${errorMessage(request)}`))
      }

      request.onsuccess = () => {
        resolve(request.result !== undefined)
      }
    })
  }

  public async set (record: Record): Promise<void> {
    const request = this.store.put(record)

    await new Promise<void>((resolve, reject) => {
      request.onerror = () => {
        reject(new Error(`Failed to set record: ${errorMessage(request)}`))
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  }

  public async count (): Promise<number> {
    const request = this.store.count()

    return await new Promise<number>((resolve, reject) => {
      request.onerror = () => {
        reject(new Error(`Failed to count records: ${errorMessage(request)}`))
      }

      request.onsuccess = () => {
        resolve(request.result)
      }
    })
  }

  public async delete (key: string): Promise<void> {
    const request = this.store.delete(key)

    await new Promise<void>((resolve, reject) => {
      request.onerror = () => {
        reject(new Error(`Failed to delete record: ${errorMessage(request)}`))
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  }
}
