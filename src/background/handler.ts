import { type Storage } from './storage.ts'
import { type MessageResponse } from './message.ts'
import TabChangeInfo = chrome.tabs.TabChangeInfo
import { type RecoveryMessage } from '../content_script/message_listener'
import { type Record } from '../content_script/handler.ts'
import { addListenerForOnUpdated, createTab, removeListenerForOnUpdated, sendMessageToTab } from '../extension.ts'

export const getRecordHandler = async (storage: Storage, key: string): Promise<MessageResponse> => {
  const record = await storage.get(key).catch((error: Error) => error)
  if (record instanceof Error) {
    return {
      status: 'Error',
      message: record.message
    }
  }

  if (record == null) {
    return {
      status: 'NotFoundError',
      message: 'Record not found'
    }
  }

  return {
    status: 'Ok',
    record
  }
}

export const existRecordHandler = async (storage: Storage, key: string): Promise<MessageResponse> => {
  const exist = await storage.hasKey(key).catch((error: Error) => error)
  if (exist instanceof Error) {
    return {
      status: 'Error',
      message: exist.message
    }
  }

  return {
    status: 'Ok',
    exist
  }
}

export const storeRecordHandler = async (storage: Storage, record: Record): Promise<MessageResponse> => {
  const error = await storage.set(record).catch((error: Error) => error)
  if (error instanceof Error) {
    return {
      status: 'Error',
      message: error.message
    }
  }

  return { status: 'Ok' }
}

export const getAllRecordsHandler = async (storage: Storage): Promise<MessageResponse> => {
  const records = await storage.getAll().catch((error: Error) => error)
  if (records instanceof Error) {
    return {
      status: 'Error',
      message: records.message
    }
  }

  return {
    status: 'Ok',
    records
  }
}

export const deleteRecordHandler = async (storage: Storage, key: string): Promise<MessageResponse> => {
  const error = await storage.delete(key).catch((error: Error) => error)
  if (error instanceof Error) {
    return {
      status: 'Error',
      message: error.message
    }
  }

  return { status: 'Ok' }
}

export const recoveryPageWithNewTabHandler = async (storage: Storage, url: string): Promise<MessageResponse> => {
  const record = await storage.get(url).catch((error: Error) => error)
  if (record instanceof Error) {
    return {
      status: 'Error',
      message: record.message
    }
  }

  if (record == null) {
    return {
      status: 'NotFoundError',
      message: 'Record not found'
    }
  }

  const tabId = await createTab({ url }).catch((error: Error) => error)
  if (tabId instanceof Error) {
    return {
      status: 'Error',
      message: tabId.message
    }
  }

  await sendRecoveryRecordMessage(tabId, { scope: record.scope, content: record.content })

  return { status: 'Ok' }
}

const sendRecoveryRecordMessage = async (tabId: number | undefined, message: RecoveryMessage): Promise<void> => {
  await new Promise<void>(resolve => {
    addListener(tabId, 'complete', (updatedTabId: number, _: TabChangeInfo) => {
      sendMessageToTab(updatedTabId, message, () => {
        resolve()
      })
    })
  })
  removeListener(tabId)
}

const removeListenerMap = new Map<number | undefined, () => void>()

const addListener = (tabId: number | undefined, status: string, callback: (updatedTabId: number, changeInfo: TabChangeInfo) => void): void => {
  const listener = (updatedTabId: number, changeInfo: TabChangeInfo): void => {
    if (tabId === updatedTabId && changeInfo.status === status) {
      callback(updatedTabId, changeInfo)
    }
  }

  addListenerForOnUpdated(listener)

  removeListenerMap.set(tabId, () => {
    removeListenerForOnUpdated(listener)
  })
}

const removeListener = (tabId: number | undefined): void => {
  const removeListener = removeListenerMap.get(tabId)
  if (removeListener != null) {
    removeListener()
    removeListenerMap.delete(tabId)
  }
}
