/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'
import type { IProperty } from '@/features/properties/types'
import { UNIT_TYPES } from './constants'

export type TUnitType = (typeof UNIT_TYPES)[keyof typeof UNIT_TYPES]
export const unitTypeValues = Object.values(UNIT_TYPES) as [
  TUnitType,
  ...TUnitType[],
]

export interface IMediaData {
  id: string
  url: string
}

export interface IUnitData {
  id: number
  property_id: number

  name: string
  slug: string
  description?: string | null

  unit_type: TUnitType

  is_available: boolean
  is_furnished: boolean

  rent_price?: number | null
  sale_price?: number | null

  bedrooms?: number | null
  bathrooms?: number | null
  square_feet?: number | null

  amenities?: string[] | null
  thumbnail?: IMediaData | null
  gallery_urls?: IMediaData[] | null
  media?: any

  available_from?: string | null
  is_pet_friendly: boolean

  property?: IProperty

  created_at: string
  updated_at: string
}

export type UnitTabKey = 'overview' | 'leases' | 'contacts' | 'accounting'

export const createUnitSchema = z
  .object({
    name: z.string().min(1, 'This field is required').max(255),
    description: z.string().optional().nullable(),

    unit_type: z.enum(Object.values(UNIT_TYPES)),

    is_available: z.boolean().optional().default(true),
    is_furnished: z.boolean().optional().default(false),
    is_pet_friendly: z.boolean().optional().default(false),

    rent_price: z.coerce
      .number()
      .min(0, 'Price must be greater than 0')
      .optional()
      .nullable(),

    sale_price: z.coerce
      .number()
      .min(0, 'Price must be greater than 0')
      .optional()
      .nullable(),

    bedrooms: z.number().min(0).optional().nullable(),

    bathrooms: z.number().min(0).optional().nullable(),

    square_feet: z.number().min(0).optional().nullable(),

    amenities: z.array(z.string().max(100)).optional().nullable(),

    available_from: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    const { unit_type, rent_price, sale_price, bedrooms } = data

    if (unit_type === 'studio') {
      if (bedrooms && bedrooms > 1) {
        ctx.addIssue({
          code: 'custom',
          message: 'Studios cannot have more than 1 bedroom.',
          path: ['bedrooms'],
        })
      }
    }

    // --- PRICING RULES ---

    if (rent_price === null && sale_price === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Provide at least one price (rent or sale).',
        path: ['rent_price'],
      })
    }

    // --- AVAILABILITY LOGIC ---

    if (!data.is_available && data.available_from) {
      ctx.addIssue({
        code: 'custom',
        message: 'Unavailable units should not have an availability date.',
        path: ['available_from'],
      })
    }
  })

export type TCreateUnitSchema = z.infer<typeof createUnitSchema>

export interface IUpdateUnitInput {
  name?: string
  description?: string | null

  unit_type?: TUnitType

  is_available?: boolean
  is_furnished?: boolean
  is_pet_friendly?: boolean

  rent_price?: number | null
  sale_price?: number | null

  bedrooms?: number | null
  bathrooms?: number | null
  square_feet?: number | null

  amenities?: string[] | null

  //   available_from?: Date
}

export type TUpdateUnitVariables = {
  unitId: number
  payload: IUpdateUnitInput
}

export type TUpdateUnitContext = {
  previousUnits?: IUnitData[]
  previousUnit?: IUnitData
}
