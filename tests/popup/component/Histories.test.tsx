import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Histories } from '../../../src/popup/component/Histories.tsx'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'

describe('src/popup/component/Histories.tsx', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('レコードが空の時', () => {
    const props = {
      histories: [],
      clickTrashButtonHandler: async (_: string) => {},
      recoveryRecordHandler: async (_: string) => {}
    }
    render(<Histories {...props} />)

    expect(screen.getByText('まだアクティビティが存在しません！')).toBeInTheDocument()
  })

  it('レコードがある時', () => {
    const props = {
      histories: [{
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
      }],
      clickTrashButtonHandler: vi.fn().mockImplementation(async (_: string) => {}),
      recoveryRecordHandler: vi.fn().mockImplementation(async (_: string) => {})
    }
    render(<Histories {...props} />)

    expect(screen.getByText('Example Title 1')).toBeInTheDocument()
    expect(screen.getByText('Example Title 2')).toBeInTheDocument()

    const trashButtons = document.querySelectorAll('.l-histories-list-card-remove')

    userEvent.click(trashButtons[0])
    waitFor(() => {
      expect(props.clickTrashButtonHandler).toHaveBeenCalledTimes(1)
      expect(props.clickTrashButtonHandler).toHaveBeenCalledWith('https://example.com/1')
    })

    props.clickTrashButtonHandler.mockClear()
    userEvent.click(trashButtons[1])
    waitFor(() => {
      expect(props.clickTrashButtonHandler).toHaveBeenCalledTimes(1)
      expect(props.clickTrashButtonHandler).toHaveBeenCalledWith('https://example.com/2')
    })

    const recordCard = document.querySelectorAll('.l-histories-list-card')

    userEvent.click(recordCard[0])
    waitFor(() => {
      expect(props.recoveryRecordHandler).toHaveBeenCalledTimes(1)
      expect(props.recoveryRecordHandler).toHaveBeenCalledWith('https://example.com/1')
    })

    props.recoveryRecordHandler.mockClear()
    userEvent.click(recordCard[1])
    waitFor(() => {
      expect(props.recoveryRecordHandler).toHaveBeenCalledTimes(1)
      expect(props.recoveryRecordHandler).toHaveBeenCalledWith('https://example.com/2')
    })
  })

  it('タイトルが21文字より長い時', () => {
    const props = {
      histories: [{
        scope: 'thread.root',
        url: 'https://example.com/1',
        title: '0123456789012345678901',
        iconUrl: 'https://example.com/icon',
        timestamp: 1234567890,
        content: 'Example Content'
      }],
      clickTrashButtonHandler: async (_: string) => {},
      recoveryRecordHandler: async (_: string) => {}
    }
    render(<Histories {...props} />)

    expect(screen.getByText('012345678901234567890...')).toBeInTheDocument()
  })

  it('本文が37文字より長い時', () => {
    const props = {
      histories: [{
        scope: 'thread.root',
        url: 'https://example.com/1',
        title: 'Example Title',
        iconUrl: 'https://example.com/icon',
        timestamp: 1234567890,
        content: '0123456789012345678901234567890123456789'
      }],
      clickTrashButtonHandler: async (_: string) => {},
      recoveryRecordHandler: async (_: string) => {}
    }
    render(<Histories {...props} />)

    expect(screen.getByText('0123456789012345678901234567890123456...')).toBeInTheDocument()
  })

  it('本文にHTMLタグが含まれる場合', () => {
    const props = {
      histories: [{
        scope: 'thread.root',
        url: 'https://example.com/1',
        title: 'Example Title',
        iconUrl: 'https://example.com/icon',
        timestamp: 1234567890,
        content: '<span>tags will be removed</span>'
      }],
      clickTrashButtonHandler: async (_: string) => {},
      recoveryRecordHandler: async (_: string) => {}
    }
    render(<Histories {...props} />)

    expect(screen.getByText('tags will be removed')).toBeInTheDocument()
  })

  describe('fromNow()', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      // restoring date after each test run
      vi.useRealTimers()
    })

    it('数秒前', () => {
      const now = 1234567890
      vi.setSystemTime(dayjs.unix(now).toDate())
      const props = {
        histories: [{
          scope: 'thread.root',
          url: 'https://example.com/1',
          title: 'Example Title',
          iconUrl: 'https://example.com/icon',
          timestamp: now - 5,
          content: '<span>tags will be removed</span>'
        }],
        clickTrashButtonHandler: async (_: string) => {},
        recoveryRecordHandler: async (_: string) => {}
      }
      render(<Histories {...props} />)

      expect(screen.getByText('数秒前')).toBeInTheDocument()
    })

    it('5分前', () => {
      const now = 1234567890
      vi.setSystemTime(dayjs.unix(now).toDate())
      const props = {
        histories: [{
          scope: 'thread.root',
          url: 'https://example.com/1',
          title: 'Example Title',
          iconUrl: 'https://example.com/icon',
          timestamp: now - 5 * 60,
          content: '<span>tags will be removed</span>'
        }],
        clickTrashButtonHandler: async (_: string) => {},
        recoveryRecordHandler: async (_: string) => {}
      }
      render(<Histories {...props} />)

      expect(screen.getByText('5分前')).toBeInTheDocument()
    })

    it('1日前', () => {
      const now = 1234567890
      vi.setSystemTime(dayjs.unix(now).toDate())
      const props = {
        histories: [{
          scope: 'thread.root',
          url: 'https://example.com/1',
          title: 'Example Title',
          iconUrl: 'https://example.com/icon',
          timestamp: now - 60 * 60 * 24,
          content: '<span>tags will be removed</span>'
        }],
        clickTrashButtonHandler: async (_: string) => {},
        recoveryRecordHandler: async (_: string) => {}
      }
      render(<Histories {...props} />)

      expect(screen.getByText('1日前')).toBeInTheDocument()
    })
  })
})
