import type { VariantProps } from 'class-variance-authority'
import { Building2, CircleSlash2, Home, Layers3 } from 'lucide-react'
import type { badgeVariants } from '@/components/ui/badge'
import type { PropertyOccupancy, PropertyStatus, PropertyType } from '../types'

export function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function typeIcon(type: PropertyType) {
  switch (type) {
    case 'houses':
      return <Home className='h-4 w-4' />
    case 'apartments':
      return <Building2 className='h-4 w-4' />
    case 'commercial':
      return <Layers3 className='h-4 w-4' />
    case 'land':
      return <CircleSlash2 className='h-4 w-4' />
    default:
      return <Building2 className='h-4 w-4' />
  }
}

export function statusStyles(
  status: PropertyStatus
): VariantProps<typeof badgeVariants>['variant'] {
  switch (status) {
    case 'vacant':
      return 'info'
    case 'occupied':
      return 'success'
    case 'maintenance':
      return 'warning'
  }
}

export function occupancyLabel(value: PropertyOccupancy) {
  switch (value) {
    case 'low':
      return 'Low occupancy'
    case 'medium':
      return 'Medium occupancy'
    case 'high':
      return 'High occupancy'
  }
}
