import { describe, expect, it } from 'vitest'
import { type IWindow } from 'happy-dom'
import { readFileSync } from 'fs'
import { Editor } from '../../src/content_script/editor.ts'

declare global {
  interface Window extends IWindow {}
}

const loadFormHTML = (fileName: string): void => {
  window.document.write(readFileSync([__dirname, fileName].join('/')).toString())
}

// getIconURL() は happy-dom 上で getComputedStyle (getPropertyValue?) がうまく動かないのでテストは諦める
describe('src/content_script/editor.ts', () => {
  it.each([
    {
      url: 'https://example.cybozu.com/k/#/space/1/thread/2',
      elementId: 'root-form',
      expected: {
        scope: 'thread.root',
        url: 'https://example.cybozu.com/k/#/space/1/thread/2'
      }
    },
    {
      url: 'https://example.cybozu.com/k/#/space/1/thread/2/3/4',
      elementId: 'root-form',
      expected: {
        scope: 'thread.root',
        url: 'https://example.cybozu.com/k/#/space/1/thread/2'
      }
    },
    {
      url: 'https://example.cybozu.com/k/#/space/1/thread/2',
      elementId: 'nested-form',
      expected: {
        scope: 'thread.nested',
        url: 'https://example.cybozu.com/k/#/space/1/thread/2/3'
      }
    },
    {
      url: 'https://example.cybozu.com/k/#/space/1/thread/2/5/6',
      elementId: 'nested-form',
      expected: {
        scope: 'thread.nested',
        url: 'https://example.cybozu.com/k/#/space/1/thread/2/3'
      }
    },
    {
      url: 'https://example.cybozu.com/k/#/people/user/emiksk',
      elementId: 'root-form',
      expected: {
        scope: 'people.root',
        url: 'https://example.cybozu.com/k/#/people/user/emiksk'
      }
    },
    {
      url: 'https://example.cybozu.com/k/#/people/user/emiksk/1',
      elementId: 'root-form',
      expected: {
        scope: 'people.root',
        url: 'https://example.cybozu.com/k/#/people/user/emiksk'
      }
    },
    {
      url: 'https://example.cybozu.com/k/#/people/user/emiksk',
      elementId: 'nested-form',
      expected: {
        scope: 'people.nested',
        url: 'https://example.cybozu.com/k/#/people/user/emiksk/3'
      }
    },
    {
      url: 'https://example.cybozu.com/k/#/people/user/emiksk/1',
      elementId: 'nested-form',
      expected: {
        scope: 'people.nested',
        url: 'https://example.cybozu.com/k/#/people/user/emiksk/3'
      }
    },
    {
      url: 'https://example.cybozu.com/k/#/message/1;2',
      elementId: 'root-form',
      expected: {
        scope: 'message.root',
        url: 'https://example.cybozu.com/k/#/message/1;2'
      }
    },
    {
      url: 'https://example.cybozu.com/k/#/message/1;2/3',
      elementId: 'root-form',
      expected: {
        scope: 'message.root',
        url: 'https://example.cybozu.com/k/#/message/1;2'
      }
    },
    {
      url: 'https://example.cybozu.com/k/1/show#record=2',
      elementId: 'root-form',
      expected: {
        scope: 'record.root',
        url: 'https://example.cybozu.com/k/1/show#record=2'
      }
    },
    {
      url: 'https://example.cybozu.com/k/1/show#l.view=20&record=2',
      elementId: 'root-form',
      expected: {
        scope: 'record.root',
        url: 'https://example.cybozu.com/k/1/show#record=2'
      }
    }
  ])('tests Editor', ({ url, elementId, expected }) => {
    loadFormHTML('../html/form.html')
    window.happyDOM.setURL(url)
    const editor = Editor.createEditor(window.location, window.document.getElementById(elementId) as HTMLElement)
    expect(editor?.getScope()).toBe(expected.scope)
    expect(editor?.getURL()).toBe(expected.url)
  })
})
