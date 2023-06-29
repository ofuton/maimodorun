import { messageListener } from './message.ts'
import { Storage } from './storage.ts'

const run = async (): Promise<void> => {
  const storage = await Storage.create({
    // v1 から使ってる人のデータをマイグレーションするのは難しいので諦める
    databaseName: 'maimodorun-v2',
    objectStoreName: 'records',
    version: 1,
    maxRecordCount: 50
  })
  chrome.runtime.onMessage.addListener(messageListener(storage))
}

run()
