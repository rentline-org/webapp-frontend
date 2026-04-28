import type { IResponse } from '@/api'
import type { IOrganizationData } from '@/features/organizations/types'
import type { PROPERTY_TYPES, UNIT_TYPES } from '../utils/constants'

export type PropertyStatus = 'vacant' | 'occupied' | 'maintenance'
export type PropertyOccupancy = 'low' | 'medium' | 'high'
export type PropertySort = 'newly_added' | 'name_asc' | 'name_desc'

export type TUnitType = (typeof UNIT_TYPES)[keyof typeof UNIT_TYPES]
export type TPropertyType = (typeof PROPERTY_TYPES)[keyof typeof PROPERTY_TYPES]

export type TPropertyTypeFilter = TPropertyType | 'all'

export type IPropertyResponse = IResponse<IProperty[]>

export interface IProperty {
  id: number
  organization_id: number
  thumbnail_url?: string | null

  slug: string
  title: string
  description?: string | null

  address: string
  city: string
  state?: string | null
  postal_code: string
  country: string

  property_type: TPropertyType

  is_available: boolean
  is_furnished: boolean

  rent_price?: number | null
  sale_price?: number | null
  buy_price?: number | null

  bedrooms?: number | null
  bathrooms?: number | null
  square_feet?: string | null

  amenities?: string[] | null

  available_from?: string | null
  is_pet_friendly: boolean

  sale_types?: string[] | null

  organization?: IOrganizationData
  units?: IUnitData[]

  units_count?: number

  created_at: string
  updated_at: string
}

export interface IUnitData {
  id: number
  property_id: number

  name: string
  description?: string | null

  unit_type: TUnitType

  is_available: boolean
  is_furnished: boolean

  rent_price?: string | null
  sale_price?: string | null

  bedrooms?: number | null
  bathrooms?: number | null
  square_feet?: string | null

  amenities?: string[] | null

  available_from?: string | null
  is_pet_friendly: boolean

  property?: IProperty

  created_at: string
  updated_at: string
}
