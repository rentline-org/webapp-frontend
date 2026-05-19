import { Building2, CircleSlash2, Home } from 'lucide-react'
import type {
  IProperty,
  TCreatePropertySchema,
  TCreatePropertyUnitSchema,
  TPropertyType,
} from '../types'
import { defaultUnitTypeByProperty } from './constants'

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
    case 'single_unit':
      return <Home className='h-4 w-4' />
    case 'multi_unit':
      return <Building2 className='h-4 w-4' />
    case 'land':
      return <CircleSlash2 className='h-4 w-4' />
    default:
      return <Building2 className='h-4 w-4' />
  }
}

export function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
  }).format(date)
}

export function typeBadgeVariant(type: TPropertyType) {
  const map: Record<TPropertyType, 'info' | 'success' | 'outline'> = {
    single_unit: 'info',
    multi_unit: 'success',
    land: 'outline',
  }

  return map[type]
}

export function statusBadgeVariant(isAvailable: boolean) {
  return isAvailable ? 'success' : 'warning'
}

export function checkPropertyIsHouse({ property_type }: IProperty) {
  return property_type === 'single_unit'
}

export function createEmptyUnit(
  propertyType: TCreatePropertySchema['property_type'],
  name: string = ''
): TCreatePropertyUnitSchema {
  return {
    name,
    unit_type: defaultUnitTypeByProperty[propertyType],
    rent_price: null,
    sale_price: null,
    bedrooms: null,
    bathrooms: null,
    square_feet: null,
  }
}
