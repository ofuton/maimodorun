import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useGetHistories } from '../../../src/popup/hooks/useGetHistories.ts'
import * as client from '../../../src/background/client.ts'

describe('src/popup/hooks/useGetHistories.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('tests useGetHistories()', () => {
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

    const { result } = renderHook(() => useGetHistories())

    // 初期値は空
    expect(result.current[0]).toEqual([])

    // 非同期でレコードが取得される
    waitFor(() => {
      expect(result.current[0]).toEqual(records.reverse())
    })

    // setHistories() でレコードを更新する
    result.current[1](records.slice(1))
    waitFor(() => {
      expect(result.current[0]).toEqual(records.slice(1))
    })
  })
})
