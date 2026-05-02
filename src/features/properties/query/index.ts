import { type QueryClient, useMutation, useQuery } from '@tanstack/react-query'
import {
  handleDelete,
  handleGet,
  handlePost,
  handlePut,
  type IResponse,
} from '@/api'
import type {
  IProperty,
  IPropertyResponse,
  IUpdatePropertyInput,
  TCreatePropertySchema,
  TUpdateVariables,
} from '../types'

const PROPERTIES_ENDPOINT = '/properties'
const propertiesKey = [PROPERTIES_ENDPOINT] as const
const propertyKey = (value: string, type: 'slug' | 'id' = 'slug') =>
  [PROPERTIES_ENDPOINT, type, value] as const

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

async function handleUpdateProperty(
  property: IProperty,
  payload: IUpdatePropertyInput
): Promise<IProperty> {
  const result = await handlePut<IResponse<IProperty>, IUpdatePropertyInput>(
    `${PROPERTIES_ENDPOINT}/${property.id}`,
    payload
  )

  return result.data
}

async function handleDeleteProperty(propertyId: number) {
  return await handleDelete<unknown>(`${PROPERTIES_ENDPOINT}/${propertyId}`)
}

// hooks

export function useGetProperties() {
  return useQuery<IProperty[]>({
    queryKey: propertiesKey,
    queryFn: handleGetProperties,
  })
}

export function useGetPropertyBySlug(slug: string) {
  return useQuery<IProperty>({
    queryKey: propertyKey(slug),
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

export function useUpdateProperty(queryClient?: QueryClient) {
  return useMutation({
    mutationKey: [PROPERTIES_ENDPOINT, 'update'],
    mutationFn: ({ property, payload }: TUpdateVariables) =>
      handleUpdateProperty(property, payload),

    onMutate: async ({ property, payload }) => {
      if (!queryClient) return {}

      const oldKey = propertyKey(property.slug)

      await Promise.all([
        queryClient.cancelQueries({ queryKey: propertiesKey }),
        queryClient.cancelQueries({ queryKey: oldKey }),
      ])

      const previousProperties =
        queryClient.getQueryData<IProperty[]>(propertiesKey)
      const previousProperty = queryClient.getQueryData<IProperty>(oldKey)

      const optimisticProperty = { ...property, ...payload }

      queryClient.setQueryData<IProperty[]>(propertiesKey, (current) =>
        (current as IProperty[] | undefined)?.map((item) =>
          item.id === property.id
            ? ({ ...item, ...payload } as IProperty)
            : item
        )
      )

      queryClient.setQueryData(oldKey, optimisticProperty)

      return { previousProperties, previousProperty }
    },

    onError: (_error, { property }, context) => {
      if (!queryClient) return

      const oldKey = propertyKey(property.slug)

      queryClient.setQueryData(propertiesKey, context?.previousProperties)
      queryClient.setQueryData(oldKey, context?.previousProperty)
    },

    onSuccess: async (result, { property }) => {
      if (!queryClient) return

      const oldKey = propertyKey(property.slug)
      const newKey = propertyKey(result.slug)

      queryClient.setQueryData<IProperty[]>(propertiesKey, (current) =>
        (current as IProperty[] | undefined)?.map((item) =>
          item.id === result.id ? result : item
        )
      )

      queryClient.setQueryData(newKey, result)

      if (result.slug !== property.slug) {
        queryClient.removeQueries({ queryKey: oldKey, exact: true })
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: propertiesKey }),
        queryClient.invalidateQueries({ queryKey: newKey }),
      ])
    },
  })
}

export function useDeleteProperty(id: number) {
  return useMutation({
    mutationKey: propertyKey(id.toString(), 'id'),
    mutationFn: async () => {
      return await handleDeleteProperty(id)
    },
  })
}

export async function invalidatePropertiesQuery(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: propertiesKey })
}

export async function invalidatePropertyBySlug(
  queryClient: QueryClient,
  slug: string = ''
) {
  await queryClient.invalidateQueries({
    queryKey: [`${PROPERTIES_ENDPOINT}/slug/${slug}`],
  })
}
