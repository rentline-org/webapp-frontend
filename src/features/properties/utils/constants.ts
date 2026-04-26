import type { PropertyOccupancy, PropertyStatus, PropertyType } from '../types'

export const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'houses', label: 'Houses' },
  { value: 'apartments', label: 'Apartments' },
  { value: 'commercial', label: 'Commercial' },
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
