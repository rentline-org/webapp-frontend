// constants/countries.ts
import * as countryLocaleMap from 'country-locale-map'
import countryToCurrency from 'country-to-currency'
import countries from 'world-countries'

export type CountryOption = {
  value: string
  label: string
  flag?: string
  currency: string
  locale: string
}

export type MoneyFormatConfig = {
  currency: string
  locale: string
}

const FALLBACK_CURRENCY = 'USD'
const FALLBACK_LOCALE = 'en-US'

const countryCurrencyMap = countryToCurrency as Record<string, string>

const normalizeLocale = (locale?: string | null) => {
  if (!locale) return FALLBACK_LOCALE
  return locale.replace('_', '-')
}

const getCurrencyByCountryCode = (countryCode: string) => {
  const code = countryCode.toUpperCase()

  return (
    countryCurrencyMap[code] ??
    countryLocaleMap.getCurrencyByAlpha2?.(code) ??
    FALLBACK_CURRENCY
  )
}

const getLocaleByCountryCode = (countryCode: string) => {
  const code = countryCode.toUpperCase()

  return normalizeLocale(
    countryLocaleMap.getLocaleByAlpha2(code) ??
      countryLocaleMap.getCountryByAlpha2?.(code)?.default_locale ??
      FALLBACK_LOCALE
  )
}

export const COUNTRIES: CountryOption[] = countries
  .map((country) => {
    const code = country.cca2.toUpperCase()

    return {
      value: code,
      label: country.name.common,
      flag: `https://flagcdn.com/w40/${code.toLowerCase()}.png`,
      currency: getCurrencyByCountryCode(code),
      locale: getLocaleByCountryCode(code),
    }
  })
  .sort((a, b) => a.label.localeCompare(b.label))

export function getMoneyFormatConfig(countryCode: string): MoneyFormatConfig {
  const code = countryCode.toUpperCase()
  const country = COUNTRIES.find((item) => item.value === code)

  const value = {
    currency: country?.currency ?? getCurrencyByCountryCode(code),
    locale: country?.locale ?? getLocaleByCountryCode(code),
  }

  return value
}

export function formatMoney(
  value: number,
  countryCode: string,
  options?: Omit<Intl.NumberFormatOptions, 'style' | 'currency'>
) {
  const code = countryCode.toUpperCase()

  const { currency, locale } = getMoneyFormatConfig(code)

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...options,
  }).format(value)

  if (code === 'MZ') {
    return formatted.replace('MTn', 'MT')
  }

  return formatted
}
