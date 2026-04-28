import type {
  PropertyOccupancy,
  PropertyStatus,
  TPropertyTypeFilter,
} from '../types'

export const propertyTypes: { value: TPropertyTypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'house', label: 'Houses' },
  { value: 'apartment', label: 'Apartments' },
  // { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
]

export const statusOptions: {
  label: string
  value: PropertyStatus
  icon?: React.ComponentType<{ className?: string }>
}[] = [
  { label: 'Vacant', value: 'vacant' },
  { label: 'Occupied', value: 'occupied' },
  { label: 'Maintenance', value: 'maintenance' },
]

export const occupancyOptions: {
  label: string
  value: PropertyOccupancy
  icon?: React.ComponentType<{ className?: string }>
}[] = [
  { label: 'Low occupancy', value: 'low' },
  { label: 'Medium occupancy', value: 'medium' },
  { label: 'High occupancy', value: 'high' },
]

export const UNIT_TYPES = {
  STUDIO: 'studio',
  ONE_BEDROOM: 'one_bedroom',
  TWO_BEDROOM: 'two_bedroom',
  THREE_BEDROOM: 'three_bedroom',
  PENTHOUSE: 'penthouse',
  OFFICE: 'office',
  RETAIL: 'retail',
  WAREHOUSE: 'warehouse',
  OTHER: 'other',
} as const

export const PROPERTY_TYPES = {
  HOUSE: 'house',
  APARTMENT: 'apartment',
  LAND: 'land',
} as const
