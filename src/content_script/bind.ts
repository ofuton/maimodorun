const unbindFunctionMap = new Map<string, () => void>()

// イベントの多重登録を防ぐために，登録したイベントの解除関数を保持して，再登録時に解除する
export const bindEventListener = (key: string, target: Element | null, eventType: string, eventListener: EventListener): void => {
  if (target == null) {
    return
  }

  unbindFunctionMap.get(key)?.()
  target.addEventListener(eventType, eventListener)

  unbindFunctionMap.set(key, () => {
    target.removeEventListener(eventType, eventListener)
  })
}
