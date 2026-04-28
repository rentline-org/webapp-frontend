import { type QueryClient, useQuery } from '@tanstack/react-query'
import { handleGet, type IResponse } from '@/api'
import type { IProperty, IPropertyResponse } from '../types'

const PROPERTIES_ENDPOINT = '/properties'

async function handleGetProperties(): Promise<IProperty[]> {
  const result = await handleGet<IPropertyResponse>(PROPERTIES_ENDPOINT)

  return result.data
}

async function handleGetPropertyBySlug(slug: string): Promise<IProperty> {
  const result = await handleGet<IResponse<IProperty>>(
    `${PROPERTIES_ENDPOINT}/slug/${slug}`
  )
  return result.data
}

export function useGetProperties() {
  return useQuery<IProperty[]>({
    queryKey: [PROPERTIES_ENDPOINT],
    queryFn: handleGetProperties,
  })
}

export function useGetPropertyBySlug(slug: string) {
  return useQuery<IProperty>({
    queryKey: [`${PROPERTIES_ENDPOINT}/slug/${slug}`],
    queryFn: () => handleGetPropertyBySlug(slug),
  })
}

export async function invalidatePropertiesQuery(
  queryClient: QueryClient,
  slug: string = ''
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [PROPERTIES_ENDPOINT] }),
    queryClient.invalidateQueries({
      queryKey: [`${PROPERTIES_ENDPOINT}/slug/${slug}`],
    }),
  ])
}
