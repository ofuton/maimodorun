import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources } from '../../src/i18n/config.ts'

i18n
  .use(initReactI18next)
  .init({
    lng: 'ja',
    resources,
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
