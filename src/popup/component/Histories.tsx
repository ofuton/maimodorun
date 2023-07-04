import './histories.css'
import { ReactComponent as Trash } from '../../../assets/popup/trash.svg'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'
import 'dayjs/locale/ja'
import React from 'react'
import { type Record } from '../../content_script/handler.ts'
import { EmptyMessage } from './icons/EmptyMessage.tsx'
import { useTranslation } from 'react-i18next'

interface HistoriesProps {
  histories: Record[]
  clickTrashButtonHandler: (url: string) => Promise<void>
  recoveryRecordHandler: (url: string) => Promise<void>
}

const setupDayjs = (locale: string): void => {
  dayjs.extend(updateLocale)
  dayjs.extend(relativeTime)

  if (locale === 'ja') {
    dayjs.locale('ja')
  } else {
    // デフォルトは英語
    dayjs.locale('en')
    dayjs.updateLocale('en', {
      relativeTime: {
        past: '%s ago',
        s: 'a few sec',
        m: 'a min',
        mm: '%d min',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years'
      }
    })
  }
}

export const Histories: React.FC<HistoriesProps> = ({ histories, clickTrashButtonHandler, recoveryRecordHandler }) => {
  const { t, i18n } = useTranslation()
  setupDayjs(i18n.language)

  return (
        <section id="l-histories" className="l-histories" aria-label={t('AriaLabelForListOfHistory')}>
            {histories.length === 0
              ? <EmptyHistory />
              : <RecordList histories={histories} clickTrashButtonHandler={clickTrashButtonHandler} recoveryRecordHandler={recoveryRecordHandler} />
            }
        </section>
  )
}

const EmptyHistory: React.FC = () => {
  const { t } = useTranslation()

  return (
        <section className="l-histories-empty-container">
            <div className="l-histories-empty-svg" aria-label={t('AriaLabelForEmptyHistoryImage')}>
                <EmptyMessage />
            </div>
            <div className="l-histories-empty-message">
                <h2>{t('ActivityDoesNotExist')}</h2>
                <p>{t('WhyDoNotYouPostComment')}</p>
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
                                        <span>{getRecordCardTitle(truncateTitle(record.title), record.scope)}</span>
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

const getRecordCardTitle = (location: string, scope: string): string => {
  const { t } = useTranslation()

  switch (scope) {
    case 'thread.root':
      return t('RecordCardTitleForComment', { location })
    case 'thread.nested':
      return t('RecordCardTitleForReply', { location })
    case 'people.root':
      return t('RecordCardTitleForComment', { location })
    case 'people.nested':
      return t('RecordCardTitleForReplyInPeople', { location })
    case 'message.root':
      return t('RecordCardTitleForCommentInMessage', { location })
    case 'record.root':
      return t('RecordCardTitleForCommentInApp', { location })
    default:
      return t('RecordCardTitleForComment', { location })
  }
}

interface RecordCardTagProps {
  scope: string
}

const RecordCardTag: React.FC<RecordCardTagProps> = ({ scope }) => {
  const { t } = useTranslation()
  const tag = (scope: string): string => {
    switch (scope) {
      case 'thread.root':
        return t('ThreadBodyTag')
      case 'thread.nested':
        return t('ThreadReplyTag')
      case 'people.root':
        return t('PeopleBodyTag')
      case 'people.nested':
        return t('PeopleReplyTag')
      case 'message.root':
        return t('MessageBodyTag')
      case 'record.root':
        return t('AppCommentTag')
      default:
        return t('UnknownTag')
    }
  }

  return (
        <div className="l-histories-list-card-right-bottom-left-tag">
            <span>{tag(scope)}</span>
        </div>
  )
}

const fromNow = (timestamp: number): string => {
  return dayjs(timestamp).fromNow()
}
