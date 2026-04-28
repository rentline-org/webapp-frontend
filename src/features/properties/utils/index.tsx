import type { VariantProps } from 'class-variance-authority'
import { Building2, CircleSlash2, Home } from 'lucide-react'
import type { badgeVariants } from '@/components/ui/badge'
import type { PropertyOccupancy, PropertyStatus, TPropertyType } from '../types'

export function currency(
  value: number,
  locale: string = 'en-US',
  currency: string = 'USD'
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function typeIcon(type: TPropertyType) {
  switch (type) {
    case 'house':
      return <Home className='h-4 w-4' />
    case 'apartment':
      return <Building2 className='h-4 w-4' />
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
