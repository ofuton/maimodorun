import {
  deleteRecordHandler,
  existRecordHandler,
  getAllRecordsHandler,
  getRecordHandler, recoveryPageWithNewTabHandler,
  storeRecordHandler
} from './handler.ts'
import { type Storage } from './storage.ts'
import { type Record } from '../content_script/handler.ts'

export type Message = GetRecordMessage | ExistKeyMessage | StoreRecordMessage | GetAllRecordsMessage | DeleteRecordMessage | RecoveryPageWithNewTabMessage

export interface GetRecordMessage {
  type: 'GetRecord'
  key: string
}

export interface ExistKeyMessage {
  type: 'ExistKey'
  key: string
}

export interface StoreRecordMessage {
  type: 'StoreRecord'
  record: Record
}

export interface GetAllRecordsMessage {
  type: 'GetAllRecords'
}

export interface DeleteRecordMessage {
  type: 'DeleteRecord'
  key: string
}

export interface RecoveryPageWithNewTabMessage {
  type: 'RecoveryPageWithNewTab'
  url: string
}

export type MessageResponse = SuccessResponse | ErrorResponse

type SuccessResponse = OkResponse | GetRecordResponse | ExistKeyResponse | GetAllRecordsResponse

export type ErrorResponse = UnknownErrorResponse | NotFoundResponse

export interface UnknownErrorResponse {
  status: 'Error'
  message: string
}

export interface NotFoundResponse {
  status: 'NotFoundError'
  message: string
}

export interface OkResponse {
  status: 'Ok'
}

export interface GetRecordResponse {
  status: 'Ok'
  record: Record
}

export interface ExistKeyResponse {
  status: 'Ok'
  exist: boolean
}

export interface GetAllRecordsResponse {
  status: 'Ok'
  records: Record[]
}

type MessageListener = (message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response: MessageResponse) => void) => void

export const messageListener = (storage: Storage): MessageListener => {
  return (message: Message, _: chrome.runtime.MessageSender, sendResponse: (response: MessageResponse) => void) => {
    // messageListener を async にするとダメらしい
    switch (message.type) {
      case 'GetRecord':
        getRecordHandler(storage, message.key).then(response => { sendResponse(response) })
        break
      case 'ExistKey':
        existRecordHandler(storage, message.key).then(response => { sendResponse(response) })
        break
      case 'StoreRecord':
        storeRecordHandler(storage, message.record).then(response => { sendResponse(response) })
        break
      case 'GetAllRecords':
        getAllRecordsHandler(storage).then(response => { sendResponse(response) })
        break
      case 'DeleteRecord':
        deleteRecordHandler(storage, message.key).then(response => { sendResponse(response) })
        break
      case 'RecoveryPageWithNewTab':
        recoveryPageWithNewTabHandler(storage, message.url).then(response => { sendResponse(response) })
        break
      default:
        sendResponse({
          status: 'Error',
          message: 'Unknown message type'
        })
    }

    // messageLister の中で非同期処理をする時は true を返してあげる必要があるらしい
    return true
  }
}
