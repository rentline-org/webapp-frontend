// properties/property-cache.ts
import { createOptimisticCache, itemCache, listCache } from '@/api/cache'
import type { IUpdatePropertyInput } from '../types'

export const PROPERTIES_ENDPOINT = '/properties' as const

export const propertiesKey = [PROPERTIES_ENDPOINT] as const
export const propertyKey = (value: string, slug: 'id' | 'slug' = 'id') => [
  PROPERTIES_ENDPOINT,
  slug,
  value,
]

export const getPropertyCache = (detailKey: string = '') =>
  createOptimisticCache<IUpdatePropertyInput & { slug: string }, 'slug'>({
    caches: {
      list: listCache(propertiesKey),
      detail: itemCache(propertyKey(detailKey, 'slug')),
    },
    matchBy: 'slug',
  })
