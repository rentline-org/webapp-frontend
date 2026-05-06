/* eslint-disable @typescript-eslint/no-explicit-any */
import type { QueryClient } from '@tanstack/react-query'
import { propertyKey } from '@/features/properties/query/cache'
import type { IProperty } from '@/features/properties/types'
import { unitKey } from '@/features/units/query/cache'
import type { IUnitData } from '@/features/units/types'

export const breadcrumbResolvers = {
  home: () => 'Home',
  properties: () => 'Properties',
  property: (match: any, queryClient: QueryClient) => {
    const slug = match.params.propertySlug
    const data: IProperty | undefined = slug
      ? queryClient.getQueryData(propertyKey(slug, 'slug'))
      : undefined
    return data?.title ?? data?.slug
  },
  unit: (match: any, queryClient: QueryClient) => {
    const slug = match.params.unitSlug
    const data: IUnitData | undefined = slug
      ? queryClient.getQueryData(unitKey(slug, 'id'))
      : undefined
    return data?.name ?? 'Unit'
  },
} as const
