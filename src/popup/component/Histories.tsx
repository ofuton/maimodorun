import './histories.css'
import { ReactComponent as EmptyMessage } from '../../../assets/popup/empty-message.svg'
import { ReactComponent as Trash } from '../../../assets/popup/trash.svg'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ja'
import React from 'react'
import { type Record } from '../../content_script/handler.ts'

dayjs.extend(relativeTime)
dayjs.locale('ja')

interface HistoriesProps {
  histories: Record[]
  clickTrashButtonHandler: (url: string) => Promise<void>
  recoveryRecordHandler: (url: string) => Promise<void>
}

export const Histories: React.FC<HistoriesProps> = ({ histories, clickTrashButtonHandler, recoveryRecordHandler }) => {
  return (
        <section id="l-histories" className="l-histories" aria-label="履歴の一覧">
            {histories.length === 0
              ? <EmptyHistory />
              : <RecordList histories={histories} clickTrashButtonHandler={clickTrashButtonHandler} recoveryRecordHandler={recoveryRecordHandler} />
            }
        </section>
  )
}

const EmptyHistory: React.FC = () => {
  return (
        <section className="l-histories-empty-container">
            <div className="l-histories-empty-svg" aria-label="アクティビティが存在しないことを表す画像">
                <EmptyMessage />
            </div>
            <div className="l-histories-empty-message">
                <h2>まだアクティビティが存在しません！</h2>
                <p>kintoneで何か書き込んでみてはいかがでしょうか？</p>
            </div>
        </section>
  )
}

interface RecordListProps {
  histories: Record[]
  clickTrashButtonHandler: (url: string) => Promise<void>
  recoveryRecordHandler: (url: string) => Promise<void>
}

const RecordList: React.FC<RecordListProps> = ({ histories, clickTrashButtonHandler, recoveryRecordHandler }) => {
  return (
        <ul id="l-histories-list" className="l-histories-list">
            {histories.map(record => <RecordCard key={record.url} record={record} clickTrashButtonHandler={clickTrashButtonHandler} recoveryRecordHandler={recoveryRecordHandler}/>)}
        </ul>
  )
}

interface RecordProps {
  record: Record
  clickTrashButtonHandler: (url: string) => Promise<void>
  recoveryRecordHandler: (url: string) => Promise<void>
}

const RecordCard: React.FC<RecordProps> = ({ record, clickTrashButtonHandler, recoveryRecordHandler }) => {
  return (
        <li>
            <section className="l-histories-list-card-container">
                <button className="l-histories-list-card" type="button" onClick={() => { recoveryRecordHandler(record.url) }}>
                    <div className="l-histories-list-card-left">
                        <div className="l-histories-list-img-container">
                            <img src={record.iconUrl} />
                        </div>
                    </div>
                    <div className="l-histories-list-card-right">
                        <div className="l-histories-list-card-right-container">
                            <div className="l-histories-list-card-right-top">
                                <div className="l-histories-list-card-right-top-title">
                                    <h2>
                                        <RecordCardTitle title={truncateTitle(record.title)} scope={record.scope} />
                                    </h2>
                                </div>
                                <div className="l-histories-list-card-right-top-body">
                                    <p>{truncateText(removeHTMLTag(record.content), 37)}</p>
                                </div>
                            </div>
                            <div className="l-histories-list-card-right-bottom">
                                <div className="l-histories-list-card-right-bottom-container">
                                    <div className="l-histories-list-card-right-bottom-left">
                                        <RecordCardTag scope={record.scope} />
                                    </div>
                                    <div className="l-histories-list-card-right-bottom-right">
                                        <div className="l-histories-list-card-right-bottom-right-time">
                                            {fromNow(record.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </button>
                <div className="l-histories-list-card-remove-container">
                    <button className="l-histories-list-card-remove" onClick={() => { clickTrashButtonHandler(record.url) }}>
                        <div className="l-histories-list-card-remove-svg">
                            <Trash />
                        </div>
                    </button>
                </div>
                <div className="l-histories-list-card-shadow"></div>
            </section>
        </li>
  )
}

const removeHTMLTag = (content: string): string => {
  return content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '')
}

const truncateText = (content: string, length: number): string => {
  const body = [...content]

  if (body.length < length) {
    return content
  }

  return body.slice(0, length).join('') + '...'
}

const truncateTitle = (title: string): string => {
  return title.split('-').map(text => truncateText(text, 21)).join(' - ')
}

interface RecordCardTitleProps {
  title: string
  scope: string
}

const RecordCardTitle: React.FC<RecordCardTitleProps> = ({ title, scope }) => {
  const suffix = (scope: string): string => {
    switch (scope) {
      case 'thread.root':
        return 'で本文を書きました'
      case 'thread.nested':
        return 'で返信を書きました'
      case 'people.root':
        return 'で本文を書きました'
      case 'people.nested':
        return 'で投稿しました'
      case 'message.root':
        return 'で送信しました'
      case 'record.root':
        return 'でコメントしました'
      default:
        return 'でのアクティビティ'
    }
  }

  return (
        <>
            <span>{title}</span>{suffix(scope)}
        </>
  )
}

interface RecordCardTagProps {
  scope: string
}

const RecordCardTag: React.FC<RecordCardTagProps> = ({ scope }) => {
  const tag = (scope: string): string => {
    switch (scope) {
      case 'thread.root':
        return 'スレッド / 本文'
      case 'thread.nested':
        return 'スレッド / 返信'
      case 'people.root':
        return 'ピープル / 本文'
      case 'people.nested':
        return 'ピープル / 返信'
      case 'message.root':
        return 'メッセージ / 本文'
      case 'record.root':
        return 'アプリ / コメント'
      default:
        return '不明'
    }
  }

  return (
        <div className="l-histories-list-card-right-bottom-left-tag">
            <span>{tag(scope)}</span>
        </div>
  )
}

const fromNow = (timestamp: number): string => {
  return dayjs.unix(timestamp).fromNow()
}
