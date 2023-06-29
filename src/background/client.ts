import {
  type ErrorResponse,
  type ExistKeyResponse,
  type GetAllRecordsResponse,
  type GetRecordResponse,
  type Message,
  type MessageResponse
} from './message.ts'
import { type Record } from '../content_script/handler.ts'
import { sendMessage } from '../extension.ts'

export const hasKey = async (key: string): Promise<boolean> => {
  return await new Promise<boolean>((resolve, reject) => {
    sendMessage<Message, ExistKeyResponse | ErrorResponse>({ type: 'ExistKey', key }, (response) => {
      if (response.status === 'Ok') {
        resolve(response.exist)
      } else {
        reject(new Error(response.message))
      }
    })
  })
}

export const getRecord = async (key: string): Promise<Record | null> => {
  return await new Promise<Record | null>((resolve, reject) => {
    sendMessage<Message, GetRecordResponse | ErrorResponse>({ type: 'GetRecord', key }, (response) => {
      if (response.status === 'Ok') {
        resolve(response.record)
      } else {
        if (response.status === 'NotFoundError') {
          resolve(null)
        }

        reject(new Error(response.message))
      }
    })
  })
}

export const storeRecord = async (record: Record): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    sendMessage<Message, MessageResponse>({ type: 'StoreRecord', record }, (response) => {
      if (response.status === 'Ok') {
        resolve()
      } else {
        reject(new Error(response.message))
      }
    })
  })
}

export const getAllRecords = async (): Promise<Record[]> => {
  return await new Promise<Record[]>((resolve, reject) => {
    sendMessage<Message, GetAllRecordsResponse | ErrorResponse>({ type: 'GetAllRecords' }, (response) => {
      if (response.status === 'Ok') {
        resolve(response.records)
      } else {
        reject(new Error(response.message))
      }
    })
  })
}

export const deleteRecord = async (key: string): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    sendMessage<Message, MessageResponse>({ type: 'DeleteRecord', key }, (response) => {
      if (response.status === 'Ok') {
        resolve()
      } else {
        reject(new Error(response.message))
      }
    })
  })
}

export class NotFoundRecordError extends Error {}

export const recoveryPageWithNewTab = async (url: string): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    sendMessage<Message, MessageResponse>({ type: 'RecoveryPageWithNewTab', url }, (response) => {
      if (response.status === 'Ok') {
        resolve()
      } else {
        if (response.status === 'NotFoundError') {
          reject(new NotFoundRecordError(response.message))
        }

        reject(new Error(response.message))
      }
    })
  })
}
