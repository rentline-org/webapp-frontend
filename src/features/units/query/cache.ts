// properties/property-cache.ts
import { createOptimisticCache, listCache } from '@/api/cache'
import { propertyKey } from '@/features/properties/query/cache'
import type { IProperty } from '@/features/properties/types'
import type { IUnitData } from '@/features/units/types'

type PropertyWithUnits = IProperty & {
  units?: IUnitData[]
  unit?: IUnitData | null
}

export const UNITS_ENDPOINT = '/units' as const

export const unitsKey = [UNITS_ENDPOINT] as const
export const unitKey = (value: string, slug: 'id' | 'slug' = 'id') => [
  UNITS_ENDPOINT,
  slug,
  value,
]

export const getUnitsCache = (propertyId: string = '') =>
  createOptimisticCache<IUnitData, 'id'>({
    caches: {
      list: listCache(unitKey(propertyId, 'slug')),
      detail: {
        key: propertyKey(propertyId, 'slug'),

        select: (data: unknown): IUnitData[] => {
          const property = data as PropertyWithUnits

          if (Array.isArray(property?.units)) return property.units
          if (property?.unit) return [property.unit]

          return []
        },

        set: (data: unknown, items: IUnitData[]): unknown => {
          const property = data as PropertyWithUnits

          if (!property) return data

          if (Array.isArray(property.units)) {
            return { ...property, units: items }
          }

          if ('unit' in property) {
            return { ...property, unit: items[0] ?? null }
          }

          return property
        },
      },
    },
    matchBy: 'id',
  })
