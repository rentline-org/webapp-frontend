import { Building2, Home, Layers3, List, type LucideIcon } from 'lucide-react'
import type {
  PropertyOccupancy,
  PropertyStatus,
  TPropertyTypeFilter,
} from '../types'

export const propertyTypes: {
  value: TPropertyTypeFilter
  label: string
  description: string
  icon: LucideIcon
}[] = [
  {
    value: 'all',
    label: 'All',
    description: 'All properties',
    icon: List,
  },
  {
    value: 'house',
    label: 'House',
    description: 'Standalone property with rooms and full pricing options.',
    icon: Home,
  },
  {
    value: 'apartment',
    label: 'Apartment',
    description: 'Room details live in units, not on the parent property.',
    icon: Building2,
  },
  {
    value: 'land',
    label: 'Land',
    description: 'Sale-oriented listing with no rooms or rent pricing.',
    icon: Layers3,
  },
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

export const AMENITY_OPTIONS = [
  { label: 'Garage', value: 'garage' },
  { label: 'Pool', value: 'pool' },
  { label: 'Balcony', value: 'balcony' },
  { label: 'Garden', value: 'garden' },
  { label: 'Gym', value: 'gym' },
  { label: 'Security', value: 'security' },
  { label: 'Elevator', value: 'elevator' },
  { label: 'Air conditioning', value: 'air_conditioning' },
  { label: 'Internet ready', value: 'internet_ready' },
  { label: 'Furnished', value: 'furnished' },
] as const

export const SALE_TYPE_OPTIONS = [
  { label: 'Rent', value: 'rent' },
  { label: 'Sale', value: 'sale' },
] as const
