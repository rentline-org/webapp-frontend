import { z } from 'zod'
import type { IResponse } from '@/api'
import type { IOrganizationData } from '@/features/organizations/types'
import { PROPERTY_TYPES, type UNIT_TYPES } from '../utils/constants'

export type PropertyStatus = 'vacant' | 'occupied' | 'maintenance'
export type PropertyOccupancy = 'low' | 'medium' | 'high'
export type PropertySort = 'newly_added' | 'name_asc' | 'name_desc'

export type TUnitType = (typeof UNIT_TYPES)[keyof typeof UNIT_TYPES]
export type TPropertyType = (typeof PROPERTY_TYPES)[keyof typeof PROPERTY_TYPES]

export type TPropertyTypeFilter = TPropertyType | 'all'

export type IPropertyResponse = IResponse<IProperty[]>

export type TabKey = 'overview' | 'units' | 'leases' | 'contacts' | 'accounting'

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

export const createPropertySchema = z
  .object({
    title: z.string().min(1, 'This field is required').max(255),
    description: z.string().optional().nullable(),

    address: z.string().min(1, 'This field is required').max(255),
    city: z.string().min(1, 'This field is required').max(100),
    state: z.string().min(1, 'This field is required').max(100),
    postal_code: z.string().min(1, 'This field is required').max(20),
    country: z
      .string()
      .min(2, 'Country is required')
      .max(2, 'Use ISO code like BR or DE')
      .transform((v) => v.toUpperCase()),

    property_type: z.enum(PROPERTY_TYPES),

    is_available: z.boolean().optional().default(true),
    is_furnished: z.boolean().optional().default(false),
    is_pet_friendly: z.boolean().optional().default(false),

    rent_price: z.coerce.number().min(0).optional().nullable(),
    sale_price: z.coerce.number().min(0).optional().nullable(),
    buy_price: z.coerce.number().min(0).min(0).optional().nullable(),

    bedrooms: z.coerce.number().min(0).optional().nullable(),
    bathrooms: z.coerce.number().min(0).optional().nullable(),
    square_feet: z.coerce.number().min(0).optional().nullable(),

    amenities: z.array(z.string().max(100)).optional().nullable(),
    sale_types: z
      .array(z.enum(['sale', 'rent']))
      .optional()
      .nullable(),

    available_from: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    const {
      property_type,
      rent_price,
      sale_price,
      buy_price,
      bedrooms,
      bathrooms,
    } = data

    if (property_type === 'apartment') {
      if (rent_price) {
        ctx.addIssue({
          code: 'invalid_type',
          expected: 'null',
          message: 'Apartments cannot have a rent price (units handle this).',
          path: ['rent_price'],
        })
      }

      if (bedrooms !== undefined && bedrooms !== null) {
        ctx.addIssue({
          code: 'custom',
          expected: 'null',
          message: 'Apartments cannot define bedrooms.',
          path: ['bedrooms'],
        })
      }

      if (bathrooms !== undefined && bathrooms !== null) {
        ctx.addIssue({
          code: 'custom',
          expected: 'null',
          message: 'Apartments cannot define bathrooms.',
          path: ['bathrooms'],
        })
      }
    }

    if (property_type === 'land') {
      if (rent_price) {
        ctx.addIssue({
          code: 'custom',
          expected: 'null',
          message: 'Land cannot be rented.',
          path: ['rent_price'],
        })
      }

      if (bedrooms !== undefined && bedrooms !== null) {
        ctx.addIssue({
          code: 'custom',
          expected: 'null',
          message: 'Land cannot have bedrooms.',
          path: ['bedrooms'],
        })
      }

      if (bathrooms !== undefined && bathrooms !== null) {
        ctx.addIssue({
          code: 'custom',
          expected: 'null',
          message: 'Land cannot have bathrooms.',
          path: ['bathrooms'],
        })
      }

      if (!sale_price && !buy_price) {
        ctx.addIssue({
          code: 'custom',
          expected: 'number',
          message: 'Land must have a sale or buy price.',
          path: ['sale_price'],
        })
      }
    }

    if (property_type === 'house') {
      if (!rent_price && !sale_price) {
        ctx.addIssue({
          code: 'custom',
          expected: 'number',
          message: 'Provide at least one price (rent, sale, or buy).',
          path: ['rent_price'],
        })
      }
    }
  })

export type TCreatePropertySchema = z.infer<typeof createPropertySchema>
