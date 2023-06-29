export const getURL = (path: string): string => chrome.runtime.getURL(path)
export const sendMessage = <Req, Res>(message: Req, callback: (response: Res) => void): void => {
  chrome.runtime.sendMessage(message, callback)
}

export const sendMessageToTab = <Req, Res>(tabId: number, message: Req, callback: (response: Res) => void): void => {
  chrome.tabs.sendMessage(tabId, message, callback)
}

export const createTab = async (createProperties: chrome.tabs.CreateProperties): Promise<number> => {
  const tab = await chrome.tabs.create(createProperties)
  if (tab.id == null) {
    throw new Error('tab.id is null')
  }

  return tab.id
}

export const addListenerForOnUpdated = (callback: (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => void): void => {
  chrome.tabs.onUpdated.addListener(callback)
}

export const removeListenerForOnUpdated = (callback: (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => void): void => {
  chrome.tabs.onUpdated.removeListener(callback)
}
