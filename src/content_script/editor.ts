import { detectPage, getHashName, type PageType, parseQuery } from './page.ts'

// 'root' は親コメント、'nested' は子コメント
type EditorType = 'root' | 'nested'

export class Editor {
  private readonly editorType: EditorType
  private readonly urlPattern: RegExp
  private readonly backgroundSelector: string
  constructor (private readonly location: Location, private readonly pageType: PageType, private readonly element: HTMLElement) {
    this.editorType = this.detectEditorType()
    switch (pageType) {
      case 'thread':
        this.urlPattern = /^https:\/\/.+\/k(\/guest\/\d+)?\/#\/space\/\d+\/thread\/\d+/
        this.backgroundSelector = '.gaia-argoui-space-spacelayout-cover'
        break
      case 'people':
        this.urlPattern = /^https:\/\/.+\/k\/#\/people\/user\/[^/]+/
        this.backgroundSelector = '.gaia-argoui-people-cover-icon'
        break
      case 'message':
        this.urlPattern = /^https:\/\/.+\/k\/#\/message\/\d+;\d+/
        this.backgroundSelector = '.ocean-message-header-photo'
        break
      case 'record':
        this.urlPattern = /^https:\/\/.+\/k\/\d+\/show/
        this.backgroundSelector = '.gaia-argoui-app-titlebar-has-background'
        break
      case 'unknown':
      default:
        this.urlPattern = /^$/
        this.backgroundSelector = ''
    }
  }

  public static createEditor (location: Location, element: HTMLElement): Editor | null {
    const pageType = detectPage(location)
    if (pageType === 'unknown') {
      return null
    }

    return new Editor(location, pageType, element)
  }

  public getScope (): string {
    return `${this.pageType}.${this.editorType}`
  }

  public getURL (): string {
    const matches = this.location.href.match(this.urlPattern)
    const key = matches?.[0]
    if (key === undefined) {
      throw new Error('This page url did not match url pattern.')
    }

    if (this.pageType === 'record') {
      const recordId = this.getRecordId()
      if (recordId != null) {
        return key + `#record=${recordId}`
      }
    }

    if (this.editorType === 'root') {
      return key
    }

    return key + this.getPostId()
  }

  public getIconURL (): string {
    if (this.pageType === 'record') {
      const appIconElement = document.querySelector('.gaia-argoui-app-titlebar-icon')
      if (appIconElement != null) {
        const src = appIconElement.getAttribute('src') ?? ''
        return /^https:\/\//.test(src) ? src : this.location.origin + src
      }
    }

    const backgroundElement = document.querySelector(this.backgroundSelector)
    if (backgroundElement != null) {
      return getComputedStyle(backgroundElement).getPropertyValue('background-image').replace(/^url\(['"](.+)['"]\)/, '$1')
    }

    return ''
  }

  private detectEditorType (): EditorType {
    const commentsPostElement = this.element.closest('.ocean-ui-comments-post')
    if (commentsPostElement == null) {
      return 'root'
    }

    return 'nested'
  }

  private getRecordId (): string | null {
    return parseQuery(getHashName(this.location)).get('record') ?? null
  }

  private getPostId (): string {
    const commentsPostElement = this.element.closest('.ocean-ui-comments-post')
    const pattern = /ocean-ui-comments-post-id-(\d+)/
    const matches = commentsPostElement?.className?.match(pattern)

    return (matches != null) ? `/${matches[1]}` : ''
  }
}
