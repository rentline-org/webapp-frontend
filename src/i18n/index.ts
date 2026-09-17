import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources, type AppLocale } from './resources'

export const LOCALE_STORAGE_KEY = 'rentline.locale'
export const DEFAULT_LOCALE: AppLocale = 'en'
export const SUPPORTED_LOCALES = ['en', 'pt-BR'] as const

const normalizeLocale = (locale?: string | null): AppLocale =>
  locale?.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en'

const storedLocale = () => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(LOCALE_STORAGE_KEY)
}

const initialLocale = normalizeLocale(
  storedLocale() ??
    (typeof navigator === 'undefined' ? DEFAULT_LOCALE : navigator.language)
)

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLocale,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: [...SUPPORTED_LOCALES],
  defaultNS: 'common',
  ns: [
    'common',
    'navigation',
    'dashboard',
    'documents',
    'leases',
    'contacts',
    'invitations',
    'settings',
  ],
  interpolation: { escapeValue: false },
  returnNull: false,
  initAsync: false,
})

const applyLocale = (locale: string) => {
  const normalized = normalizeLocale(locale)

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, normalized)
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = normalized
  }
}

applyLocale(initialLocale)
i18n.on('languageChanged', applyLocale)

export const getAppLocale = (): AppLocale =>
  normalizeLocale(i18n.resolvedLanguage ?? i18n.language)

export const changeAppLocale = async (locale: AppLocale) => {
  await i18n.changeLanguage(locale)
}

export { i18n, normalizeLocale }
export type { AppLocale } from './resources'
