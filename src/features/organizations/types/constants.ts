export const COUNTRY_BR = 'BR' as const

export const TAX_ID_OPTIONS = {
  BR: [
    { value: 'cpf', label: 'CPF' },
    { value: 'cnpj', label: 'CNPJ' },
  ],
  DEFAULT: [{ value: 'vat', label: 'VAT' }],
} as const

export const isBrazilCountry = (country?: string | null) =>
  country?.trim().toUpperCase() === COUNTRY_BR

export const getTaxIdOptions = (country?: string | null) =>
  isBrazilCountry(country) ? TAX_ID_OPTIONS.BR : TAX_ID_OPTIONS.DEFAULT

export const getTaxIdLabel = (country?: string | null) =>
  isBrazilCountry(country) ? 'CPF / CNPJ' : 'VAT'

export const getTaxIdPlaceholder = (country?: string | null) =>
  isBrazilCountry(country) ? 'CPF or CNPJ' : 'VAT number'

export const shouldShowStateField = (country?: string | null) =>
  isBrazilCountry(country)

export const getStepFields = (country?: string | null) => {
  const isBR = isBrazilCountry(country)

  return [
    ['title', 'email', 'description'],
    isBR
      ? ['country', 'state', 'city', 'postal_code', 'address_line']
      : ['country', 'city', 'postal_code', 'address_line'],
    isBR
      ? ['phone', 'website', 'tax_id', 'tax_id_type', 'is_active']
      : ['phone', 'website', 'tax_id', 'is_active'],
  ] as const
}
