import { z } from 'zod'
import type { IResponse } from '@/api'
import type { IOrganizationData } from '@/features/organizations/types'
import {
  createUnitSchema,
  type TUnitType,
  type IUnitData,
  unitTypeValues,
} from '@/features/units/types'
import { PROPERTY_TYPES } from '../utils/constants'

export type PropertySort = 'newly_added' | 'name_asc' | 'name_desc'
export type TPropertyType = (typeof PROPERTY_TYPES)[keyof typeof PROPERTY_TYPES]
export type TPropertyTypeFilter = TPropertyType | 'all'

export type IPropertyResponse = IResponse<IProperty[]>

export type TabKey = 'overview' | 'units' | 'leases' | 'contacts' | 'accounting'

export interface IProperty {
  id: number
  organization_id: number
  thumbnail?: string | null

  slug: string
  title: string
  description?: string | null

  address: string
  city: string
  state: string
  postal_code: string
  country?: string | null
  sale_price: number | null

  property_type: TPropertyType

  created_at: string
  updated_at: string

  organization?: IOrganizationData
  units?: IUnitData[]
  units_count?: number
}

export const createPropertyUnitSchema = z.object({
  name: z.string().min(1, 'This field is required').max(255),
  rent_price: createUnitSchema.shape.rent_price,
  sale_price: createUnitSchema.shape.sale_price,
  bedrooms: createUnitSchema.shape.bedrooms,
  bathrooms: createUnitSchema.shape.bathrooms,
  square_feet: createUnitSchema.shape.square_feet,
  unit_type: z.enum(unitTypeValues),
})

export type TCreatePropertyUnitSchema = z.infer<typeof createPropertyUnitSchema>

const allowedUnitTypesByProperty: Record<TPropertyType, TUnitType[]> = {
  single_unit: ['house', 'office', 'studio', 'retail', 'warehouse'],
  multi_unit: [
    'apartment',
    'studio',
    'studio',
    'office',
    'retail',
    'warehouse',
  ],
  land: ['other'],
}

export const createPropertySchema = z
  .object({
    title: z.string().min(1).max(255),
    description: z.string().optional().nullable(),

    address: z.string().min(1).max(255),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    postal_code: z.string().min(1).max(20),

    country: z
      .string()
      .min(2)
      .max(100)
      .nullable()
      .optional()
      .transform((v) => (v ? v.toUpperCase() : v)),

    property_type: z.enum(PROPERTY_TYPES),

    slug: z.string().max(255).optional().nullable(),

    units: z.array(createPropertyUnitSchema).min(1, 'Add at least one unit'),
  })
  .superRefine((data, ctx) => {
    const count = data.units.length

    if (data.property_type === 'single_unit' && count !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['units'],
        message: 'Single unit properties must have exactly one unit.',
      })
    }

    if (data.property_type === 'land' && count !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['units'],
        message: 'Land properties must have exactly one unit.',
      })
    }

    if (data.property_type === 'multi_unit' && count < 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['units'],
        message: 'Multi-unit properties must have at least one unit.',
      })
    }

    data.units.forEach((unit, index) => {
      if (
        !allowedUnitTypesByProperty[data.property_type].includes(unit.unit_type)
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['units', index, 'unit_type'],
          message: `Unit type is not allowed for ${data.property_type}.`,
        })
      }
    })
  })

export type TCreatePropertySchema = z.infer<typeof createPropertySchema>

export interface IUpdatePropertyInput {
  title?: string
  description?: string | null

  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string | null

  property_type?: TPropertyType

  slug?: string | null
}

export type TUpdateVariables = {
  property: IProperty
  payload: IUpdatePropertyInput
}

export type TUpdateContext = {
  previousProperties?: IProperty[]
  previousProperty?: IProperty
}
