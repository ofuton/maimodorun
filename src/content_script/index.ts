import { openEditorHandler } from './handler.ts'
import './index.css'
import { Editor } from './editor.ts'

export const run = (): void => {
  const observer = new MutationObserver(async (mutations) => {
    for (const mutation of mutations) {
      const element = mutation.target as HTMLElement
      if (!isExpandStatusChanged(element, mutation.oldValue)) {
        return
      }

      const editor = Editor.createEditor(location, element)
      if (editor == null) {
        return
      }

      if (element.getAttribute('aria-expanded') === 'true') {
        await openEditorHandler(editor.getScope(), editor.getURL(), editor.getIconURL(), element)
      }
    }
  })

  observer.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeOldValue: true,
    attributeFilter: ['aria-expanded']
  })
}

const isExpandStatusChanged = (element: HTMLElement, previousAttribute: string | null): boolean => {
  if (previousAttribute == null) return false
  if (!element.classList.contains('ocean-ui-comments-commentform')) return false

  return previousAttribute !== element.getAttribute('aria-expanded')
}

run()
