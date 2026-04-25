// constants/countries.ts
import countries, { type Country } from 'world-countries'

// import type { CountryOption } from '@/components/country-combobox'

export type CountryOption = {
  value: string // ISO code like "BR", "DE"
  label: string // Human name like "Brazil"
  flag?: string // optional flag URL
}

const EU_COUNTRIES = new Set([
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'HR', // Croatia
  'CY', // Cyprus
  'CZ', // Czech Republic
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'GR', // Greece
  'HU', // Hungary
  'IE', // Ireland
  'IT', // Italy
  'LV', // Latvia
  'LT', // Lithuania
  'LU', // Luxembourg
  'MT', // Malta
  'NL', // Netherlands
  'PL', // Poland
  'PT', // Portugal
  'RO', // Romania
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
  'SE', // Sweden
])

const isBrazil = (c: Country) => c.cca2 === 'BR'

const isEU = (c: Country) => EU_COUNTRIES.has(c.cca2)

export const COUNTRIES: CountryOption[] = countries
  .filter((c) => isBrazil(c) || isEU(c))
  .map((c) => ({
    value: c.cca2,
    label: c.name.common,
    flag: `https://flagcdn.com/w40/${c.cca2.toLowerCase()}.png`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label))
