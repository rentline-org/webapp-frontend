/* eslint-disable @typescript-eslint/no-explicit-any */
import { Building2, Home, Layers3, List, type LucideIcon } from 'lucide-react'
import { cleanSnakecase } from '@/lib/utils'
import type { TUnitType } from '@/features/units/types'
import type { TPropertyType, TPropertyTypeFilter } from '../types'

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
    value: 'single_unit',
    label: 'House',
    description: 'Standalone property with rooms and full pricing options.',
    icon: Home,
  },
  {
    value: 'multi_unit',
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

export const getPropertyTypes = () => {
  return Object.entries(PROPERTY_TYPES).map(([_, key]) => {
    return {
      label: cleanSnakecase(key),
      value: key,
    }
  })
}

export const statusOptions: {
  label: string
  value: any
  icon?: React.ComponentType<{ className?: string }>
}[] = [
  { label: 'Vacant', value: 'vacant' },
  { label: 'Occupied', value: 'occupied' },
  { label: 'Maintenance', value: 'maintenance' },
]

export const occupancyOptions: {
  label: string
  value: any
  icon?: React.ComponentType<{ className?: string }>
}[] = [
  { label: 'Low occupancy', value: 'low' },
  { label: 'Medium occupancy', value: 'medium' },
  { label: 'High occupancy', value: 'high' },
]

export const PROPERTY_TYPES = {
  SINGLE_UNIT: 'single_unit',
  MULTI_UNIT: 'multi_unit',
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

export const defaultUnitTypeByProperty: Record<TPropertyType, TUnitType> = {
  single_unit: 'house',
  multi_unit: 'apartment',
  land: 'other',
} as const

export const allowedUnitTypesByProperty = {
  single_unit: [
    { value: 'house', label: 'House' },
    { value: 'studio', label: 'Studio' },
    { value: 'office', label: 'Office' },
  ],
  multi_unit: [
    { value: 'apartment', label: 'Apartment' },
    { value: 'studio', label: 'Studio' },
    { value: 'room', label: 'Room' },
    { value: 'office', label: 'Office' },
    { value: 'retail', label: 'Retail' },
    { value: 'warehouse', label: 'Warehouse' },
  ],
  land: [{ value: 'land', label: 'Land' }],
} as const
