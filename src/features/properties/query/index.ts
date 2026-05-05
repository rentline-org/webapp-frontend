// properties/query.ts
import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
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
import {
  getPropertyCache,
  PROPERTIES_ENDPOINT,
  propertiesKey,
  propertyKey,
} from './cache'

// --- data fetchers --- //

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

async function handleCreateProperty(
  payload: TCreatePropertySchema
): Promise<IProperty> {
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

async function handleDeleteProperty(propertyId: number): Promise<void> {
  await handleDelete<unknown>(`${PROPERTIES_ENDPOINT}/${propertyId}`)
}

export function useGetProperties() {
  return useQuery<IProperty[]>({
    queryKey: propertiesKey,
    queryFn: handleGetProperties,
  })
}

export function useGetPropertyBySlug(slug: string) {
  return useQuery<IProperty>({
    queryKey: propertyKey(slug, 'slug'),
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

export function useUpdateProperty(queryClient: QueryClient, slug: string) {
  const { snapshot, restore, patch } = getPropertyCache(slug)

  return useMutation({
    mutationKey: [PROPERTIES_ENDPOINT, 'update'],
    mutationFn: ({ property, payload }: TUpdateVariables) =>
      handleUpdateProperty(property, payload),

    onMutate: async ({ property, payload }) => {
      await queryClient.cancelQueries({ queryKey: propertiesKey })
      await queryClient.cancelQueries({ queryKey: propertyKey(slug, 'slug') })

      const previous = snapshot(queryClient)

      patch(queryClient, property, (p) => ({
        ...p,
        ...payload,
        slug,
      }))

      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        restore(queryClient, context.previous)
      }
    },
    onSuccess: async (result, { property }) => {
      // handled through page navigation
      if (result.title !== property.title) {
        return
      }

      await queryClient.invalidateQueries({ queryKey: propertiesKey })
    },
  })
}

export function useDeleteProperty(property: IProperty) {
  const queryClient = useQueryClient()
  const id = property.id
  const { snapshot, restore, remove } = getPropertyCache(id.toString())

  return useMutation({
    mutationKey: [...propertyKey(property.slug, 'slug'), 'delete'],
    mutationFn: async () => {
      return await handleDeleteProperty(id)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: propertiesKey })
      await queryClient.cancelQueries({
        queryKey: propertyKey(property.slug, 'slug'),
      })
      const previous = snapshot(queryClient)

      const listData = queryClient.getQueryData(propertiesKey)
      const list = listData ? (listData as IProperty[]) : []

      const itemToDelete = list.find((p) => p.id === id)
      if (itemToDelete) {
        remove(queryClient, itemToDelete)
      }

      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        restore(queryClient, context.previous)
      }
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
    queryKey: propertyKey(slug, 'slug'),
  })
}
