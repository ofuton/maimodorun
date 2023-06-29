// popup からレコードを復元する際に，バックグラウンドページ経由でメッセージを受け取って，テキストをフォームに入力させる処理
// このスクリプトはバックグラウンドページからメッセージを受け取る前に読み込まれている可能性があるため，
// このスクリプトだけ manifest.json で run_at: document_start にする．
// バックグランドページでは，メッセージを送る時に chrome.tabs.onUpdated を使って，ページが読み込まれた後にメッセージを送るようにしている．

export interface RecoveryMessage {
  scope: string
  content: string
}

const run = (): void => {
  chrome.runtime.onMessage.addListener((message: RecoveryMessage, _, sendResponse) => {
    recoveryText(message.scope, message.content).then(() => {
      sendResponse({ status: 'Ok' })
    })

    return true
  })
}

const recoveryText = async (scope: string, content: string): Promise<void> => {
  if (await openTextEditor(scope)) {
    const form = document.querySelector('.ocean-ui-editor-field')
    if (form != null) {
      form.innerHTML = content
    }
  }
}

const openTextEditor = async (scope: string): Promise<boolean> => {
  let textAreElement: HTMLElement | null
  switch (scope) {
    case 'thread.nested':
    case 'people.nested':
      textAreElement = await queryWithWaitUntilDisplay('.ocean-ui-comments-commentbase-comment', 10)
      if (textAreElement == null) {
        return false
      }
      textAreElement?.click()
      break
    case 'thread.root':
    case 'people.root':
    case 'message.root':
    case 'record.root':
    default:
      textAreElement = await queryWithWaitUntilDisplay('.ocean-ui-comments-commentform-textarea', 10)
      if (textAreElement == null) {
        return false
      }
      textAreElement?.focus()
      break
  }

  return true
}

const queryWithWaitUntilDisplay = async (selector: string, maxAttempts: number): Promise<HTMLElement | null> => {
  let attempt = 1
  return await new Promise(resolve => {
    const setIntervalId = setInterval(() => {
      const target = document.querySelector(selector)
      if (target != null) {
        clearInterval(setIntervalId)
        resolve(target as HTMLElement)
      }

      if (attempt >= maxAttempts) {
        clearInterval(setIntervalId)
        resolve(null)
      }

      attempt++
    }, 200)
  })
}

run()
