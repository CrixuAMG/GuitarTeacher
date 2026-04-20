import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import nl from './locales/nl.json'
import de from './locales/de.json'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, nl, de },
})

export const availableLocales = [
  { code: 'en', label: 'English' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'de', label: 'Deutsch' },
]

export type LocaleCode = 'en' | 'nl' | 'de'

export function setLocale(locale: LocaleCode) {
  i18n.global.locale.value = locale
}

export default i18n
