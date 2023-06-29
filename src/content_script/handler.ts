import { debounce } from 'debounce'
import { getRecord, hasKey, storeRecord } from '../background/client.ts'
import { bindEventListener } from './bind.ts'
import { getURL } from '../extension.ts'

const editorFieldClassName = 'ocean-ui-editor-field'

export interface Record {
  scope: string
  url: string
  iconUrl: string
  title: string
  timestamp: number
  content: string
}

export const openEditorHandler = async (scope: string, url: string, iconUrl: string, element: HTMLElement): Promise<void> => {
  const debounceFn = debounce(async (scope: string, url: string, iconUrl: string, element: HTMLElement) => {
    await saveRecord(scope, url, iconUrl, element, async () => {
      renderAutoSaveSign(element)
      await renderRecoveryButton(url, element, true)
    })
  }, 2000)
  const observer = new MutationObserver(async () => {
    removeAutoSaveSign(element)
    await debounceFn(scope, url, iconUrl, element)
  })

  const onCloseEditor: EventListener = () => {
    debounceFn.clear()
    observer.disconnect()
    saveRecord(scope, url, iconUrl, element).then(() => {
      removeAutoSaveSign(element)
    })
  }
  bindSubmit(element, onCloseEditor)
  bindCancel(element, onCloseEditor)
  await renderRecoveryButton(url, element, false)

  observer.observe(element.getElementsByClassName(editorFieldClassName)[0], {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true
  })
}

const saveRecord = async (scope: string, url: string, iconUrl: string, formElement: HTMLElement, onSave?: () => Promise<void>): Promise<void> => {
  const editorFieldElement = formElement.getElementsByClassName(editorFieldClassName)[0] as HTMLElement | null
  if (editorFieldElement == null) {
    return
  }

  if (hasNoContents(editorFieldElement)) {
    return
  }

  const content = extractHTML(editorFieldElement)
  await storeRecord({
    url,
    scope,
    iconUrl,
    title: document.title,
    content,
    timestamp: Date.now()
  })

  // レコードを保存した時に呼び出すコールバック
  await onSave?.()
}

const MAX_CONTENT_LENGTH = 65535

const extractHTML = (element: HTMLElement): string => {
  const content = element.innerHTML

  // string を直接扱うと、サロゲートペアが分割されてしまうので code point に変換してから扱う
  const codePoints = [...content]
  if (codePoints.length <= MAX_CONTENT_LENGTH) {
    return content
  }

  return codePoints.slice(0, MAX_CONTENT_LENGTH).join('')
}

const hasNoContents = (element: HTMLElement): boolean => {
  if (element.tagName === 'IMG') {
    return false
  }

  if (element.textContent?.trim() !== '') {
    return false
  }

  return [...element.children].every((child) => hasNoContents(child as HTMLElement))
}

const bindSubmit = (baseElement: Element, onSubmit: EventListener): void => {
  const submitButton = baseElement.querySelector('.ocean-ui-comments-commentform-submit')
  bindEventListener('submit', submitButton, 'click', onSubmit)
}

const bindCancel = (baseElement: Element, onCancel: EventListener): void => {
  const cancelButton = baseElement.querySelector('.ocean-ui-comments-commentform-cancel')
  bindEventListener('cancel', cancelButton, 'mousedown', onCancel)
}

const renderRecoveryButton = async (key: string, element: HTMLElement, forceRender: boolean): Promise<void> => {
  const recoveryButtonElement = element.querySelector('#maimodorun-recovery-button')

  if (forceRender || await hasKey(key)) {
    if (recoveryButtonElement != null) {
      return
    }

    const toolBarElement = element.querySelector('.goog-toolbar')
    if (toolBarElement == null) {
      return
    }

    // 既存のツールバーの右端にボーダーを追加する
    const toolBarButtons = [...toolBarElement.getElementsByClassName('goog-toolbar-button')]
    toolBarButtons[toolBarButtons.length - 1].classList.add('goog-toolbar-button-right-border')

    toolBarElement.insertAdjacentHTML(
      'beforeend',
            `
            <div id="maimodorun-recovery-button" class="goog-inline-block goog-toolbar-button ocean-ui-editor-toolbar-maimodorun" title="保存内容を復元する" role="button">
                <div class="goog-inline-block goog-toolbar-button-inner-box goog-toolbar-button-inner-box-maimodorun">
                  <div class="ocean-ui-editor-toolbar-maimodorun-button">
                      <img class="maimodorun-button-img" src="${getURL('/assets/icon48.png')}" />
                   </div>
                </div>
            </div>
            `
    )

    element.querySelector('#maimodorun-recovery-button')?.addEventListener('click', onRecovery(key, element))
  } else {
    recoveryButtonElement?.remove()
  }
}

const onRecovery = (key: string, element: HTMLElement): EventListener => {
  return () => {
    const editorElement = element.getElementsByClassName(editorFieldClassName)[0]
    if (editorElement != null) {
      getRecord(key).then(record => {
        editorElement.innerHTML = record?.content ?? ''
      })
    }
  }
}

const renderAutoSaveSign = (element: HTMLElement): void => {
  if (element.querySelector('#maimodorun-auto-save-sign') != null) {
    return
  }

  element.querySelector('.ocean-ui-comments-commentform-submit')?.insertAdjacentHTML(
    'afterend',
        `
        <div id="maimodorun-auto-save-sign" class="maimodorun-saved-sign">
            <span>保存しました</span>
        </div>
        `
  )
}

const removeAutoSaveSign = (element: HTMLElement): void => {
  const autoSaveSign = element.querySelector('#maimodorun-auto-save-sign')
  if (autoSaveSign != null) {
    autoSaveSign.remove()
  }
}
