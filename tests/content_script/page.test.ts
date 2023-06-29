import { describe, expect, it } from 'vitest'
import { detectPage } from '../../src/content_script/page.ts'
import { type IWindow } from 'happy-dom'

declare global {
  interface Window extends IWindow {}
}

describe('src/content_script/page.ts', () => {
  it.each([
    { url: 'https://example.cybozu.com/k/#/space/1/thread/2', expected: 'thread' },
    { url: 'https://example.cybozu.com/k/#/space/1/thread/2/3', expected: 'thread' },
    { url: 'https://example.cybozu.com/k/#/space/1/thread/2/3/4', expected: 'thread' },
    { url: 'https://example.cybozu.com/k/#/people/user/username', expected: 'people' },
    { url: 'https://example.cybozu.com/k/#/people/user/username/1', expected: 'people' },
    { url: 'https://example.cybozu.com/k/#/people/user/username/1/2', expected: 'people' },
    { url: 'https://example.cybozu.com/k/#/message/1;2', expected: 'message' },
    { url: 'https://example.cybozu.com/k/#/message/1;2/3', expected: 'message' },
    { url: 'https://example.cybozu.com/k/1/show#record=2', expected: 'record' },
    { url: 'https://example.cybozu.com/unknown', expected: 'unknown' }
  ])('tests detectPage()', ({ url, expected }) => {
    window.happyDOM.setURL(url)
    expect(detectPage(window.location)).toBe(expected)
  })
})
