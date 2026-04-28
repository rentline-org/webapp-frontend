import { type QueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { handleGet, handlePost, type IResponse } from '@/api'
import type {
  IProperty,
  IPropertyResponse,
  TCreatePropertySchema,
} from '../types'

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

async function handleCreateProperty(payload: TCreatePropertySchema) {
  const result = await handlePost<IResponse<IProperty>, TCreatePropertySchema>(
    PROPERTIES_ENDPOINT,
    payload
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

export function useCreateProperty() {
  return useMutation({
    mutationKey: [PROPERTIES_ENDPOINT, 'new'],
    mutationFn: async (payload: TCreatePropertySchema) => {
      return await handleCreateProperty(payload)
    },
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
