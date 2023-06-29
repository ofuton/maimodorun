import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import * as client from '../../../src/background/client.ts'
import userEvent from '@testing-library/user-event'
import { App } from '../../../src/popup/component/App.tsx'

describe('src/popup/component/Histories.tsx', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('レコードが空の時', () => {
    const getAllRecordsSpy = vi.spyOn(client, 'getAllRecords')
    getAllRecordsSpy.mockResolvedValue([])
    render(<App />)

    expect(screen.getByText('0個のアクティビティ')).toBeInTheDocument()
    expect(screen.getByText('まだアクティビティが存在しません！')).toBeInTheDocument()
  })

  it('レコードがある時', () => {
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
    const getAllRecordsSpy = vi.spyOn(client, 'getAllRecords')
    getAllRecordsSpy.mockResolvedValue(records)

    render(<App />)

    waitFor(() => {
      expect(screen.getByText('2個のアクティビティ')).toBeInTheDocument()
      expect(screen.getByText('Example Title 1')).toBeInTheDocument()
      expect(screen.getByText('Example Title 2')).toBeInTheDocument()
    })

    const deleteRecordSpy = vi.spyOn(client, 'deleteRecord')
    deleteRecordSpy.mockResolvedValue(undefined)

    const trashButtons = document.querySelectorAll('.l-histories-list-card-remove')
    userEvent.click(trashButtons[0])
    waitFor(() => {
      expect(deleteRecordSpy).toHaveBeenCalledTimes(1)
      expect(deleteRecordSpy).toHaveBeenCalledWith('https://example.com/1')
      expect(screen.getByText('1個のアクティビティ')).toBeInTheDocument()
      expect(screen.queryByText('Example Title 1')).not.toBeInTheDocument()
    })

    const recoveryPageWithNewTabSpy = vi.spyOn(client, 'recoveryPageWithNewTab')
    recoveryPageWithNewTabSpy.mockResolvedValue(undefined)

    const recordCard = document.querySelectorAll('.l-histories-list-card')
    userEvent.click(recordCard[0])
    waitFor(() => {
      expect(recoveryPageWithNewTabSpy).toHaveBeenCalledTimes(1)
      expect(recoveryPageWithNewTabSpy).toHaveBeenCalledWith('https://example.com/2')
      expect(screen.getByText('1個のアクティビティ')).toBeInTheDocument()
      expect(screen.queryByText('Example Title 2')).toBeInTheDocument()
    })
  })
})
