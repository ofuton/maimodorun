import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './en/translation.json'
import ja from './ja/translation.json'
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'

export const resources = {
  en: { translation: en },
  ja: { translation: ja }
}

i18n
  .use(I18nextBrowserLanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources,
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
