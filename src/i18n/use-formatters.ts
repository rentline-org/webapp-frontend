import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getAppLocale } from './index'

type DateInput = string | number | Date | null | undefined

const toDate = (value: DateInput) => {
  if (value === null || value === undefined || value === '') return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function useAppFormatters() {
  const { i18n } = useTranslation()
  const locale = getAppLocale()

  const mediumDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }),
    [locale, i18n.resolvedLanguage]
  )
  const shortDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'short' }),
    [locale, i18n.resolvedLanguage]
  )

  const formatDate = useCallback(
    (value: DateInput, fallback = '—') => {
      const date = toDate(value)
      return date ? mediumDateFormatter.format(date) : fallback
    },
    [mediumDateFormatter]
  )

  const formatDateShort = useCallback(
    (value: DateInput, fallback = '—') => {
      const date = toDate(value)
      return date ? shortDateFormatter.format(date) : fallback
    },
    [shortDateFormatter]
  )

  const formatCurrency = useCallback(
    (value: string | number | null | undefined, currency = 'BRL') => {
      const amount = Number(value)
      if (!Number.isFinite(amount)) return '—'

      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(amount)
    },
    [locale, i18n.resolvedLanguage]
  )

  const formatList = useCallback(
    (items: string[]) =>
      new Intl.ListFormat(locale, {
        style: 'long',
        type: 'conjunction',
      }).format(items),
    [locale, i18n.resolvedLanguage]
  )

  return {
    locale,
    formatDate,
    formatDateShort,
    formatCurrency,
    formatList,
  }
}
