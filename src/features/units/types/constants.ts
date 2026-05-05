export const UNIT_TYPES = {
  STUDIO: 'studio',
  APARTMENT: 'apartment',
  HOUSE: 'house',
  PENTHOUSE: 'penthouse',
  OFFICE: 'office',
  RETAIL: 'retail',
  WAREHOUSE: 'warehouse',
  OTHER: 'other',
} as const

export const getUnitTypes = () => {
  return Object.entries(UNIT_TYPES).map(([_, key]) => {
    return {
      label: key.split('_').join(' ').toLowerCase(),
      value: key,
    }
  })
}
