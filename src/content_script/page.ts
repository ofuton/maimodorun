export type PageType = 'thread' | 'people' | 'message' | 'record' | 'unknown'

export const getHashName = (location: Location): string => location.hash.replace(/^#[/]?/g, '')

const getPathName = (location: Location): string => location.pathname.replace(/^[/]?/g, '')

const isThread = (hashName: string): boolean => /^space\/\d+\/thread\/\d+(\/\d+)?(\/\d+)?$/.test(hashName)

const isPeople = (hashName: string): boolean => /^people\/user\/[^/]+(\/\d+)?(\/\d+)?$/.test(hashName)

const isMessage = (hashName: string): boolean => /^message\/\d+;\d+(\/\d+)?$/.test(hashName)

const isRecord = (pathName: string, hashName: string): boolean => {
  return isAppPath(pathName) && includeRecordId(hashName)
}

const isAppPath = (pathName: string): boolean => /^k\/\d+\/show$/.test(pathName)

const includeRecordId = (hashName: string): boolean => parseQuery(hashName).has('record')

export const detectPage = (location: Location): PageType => {
  const hashName = getHashName(location)
  const pathName = getPathName(location)

  if (isThread(hashName)) {
    return 'thread'
  }

  if (isPeople(hashName)) {
    return 'people'
  }

  if (isMessage(hashName)) {
    return 'message'
  }

  if (isRecord(pathName, hashName)) {
    return 'record'
  }

  return 'unknown'
}

export const parseQuery = (hashName: string): Map<string, string> => {
  return hashName.split('&').reduce((map, query) => {
    const [key, value] = query.split('=')
    map.set(key, value)
    return map
  }, new Map<string, string>())
}
