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
import { invalidatePropertyBySlug } from '@/features/properties/query'
import {
  PROPERTIES_ENDPOINT,
  propertyKey,
} from '@/features/properties/query/cache'
import { type IProperty } from '@/features/properties/types'
import type { IUnitData, TCreateUnitSchema, IUpdateUnitInput } from '../types'
import { getUnitsCache, unitKey, UNITS_ENDPOINT, unitsKey } from './cache'

async function handleGetUnits(propertyId: number) {
  const res = await handleGet<IResponse<IUnitData[]>>(
    `${PROPERTIES_ENDPOINT}/${propertyId.toString()}${UNITS_ENDPOINT}`
  )

  return res.data
}

export function useGetUnits(propertyId: number) {
  return useQuery({
    queryKey: [...unitKey(propertyId.toString(), 'id')],
    queryFn: async () => await handleGetUnits(propertyId),
  })
}

async function handleCreateUnit(
  propertyId: number,
  payload: TCreateUnitSchema
) {
  const res = await handlePost<IResponse<IUnitData>, TCreateUnitSchema>(
    `/properties/${propertyId}${UNITS_ENDPOINT}`,
    payload
  )

  return res.data
}

async function handleUpdateUnit(
  propertyId: number,
  unitId: number,
  payload: IUpdateUnitInput
) {
  const res = await handlePut<IResponse<IUnitData>, IUpdateUnitInput>(
    `/properties/${propertyId}${UNITS_ENDPOINT}/${unitId}`,
    payload
  )

  return res.data
}

async function handleDeleteUnit(propertyId: number, unitId: number) {
  await handleDelete<unknown>(
    `/properties/${propertyId}${UNITS_ENDPOINT}/${unitId}`
  )
}

export function useCreateUnit(property: IProperty) {
  return useMutation({
    mutationKey: [...unitKey(property.id.toString(), 'id'), 'create'],
    mutationFn: (payload: TCreateUnitSchema) =>
      handleCreateUnit(property.id, payload),
  })
}

export function useUpdateUnit(property: IProperty) {
  const queryClient = useQueryClient()
  const { snapshot, patch, restore } = getUnitsCache(property.id.toString())

  return useMutation({
    mutationKey: [UNITS_ENDPOINT, 'update', property.id],
    mutationFn: ({
      unitId,
      payload,
    }: {
      unitId: number
      payload: IUpdateUnitInput
    }) => handleUpdateUnit(property.id, unitId, payload),

    onMutate: async ({ unitId, payload }) => {
      await queryClient.cancelQueries({
        queryKey: propertyKey(property.slug, 'slug'),
      })
      await queryClient.cancelQueries({ queryKey: unitsKey })

      const previous = snapshot(queryClient)

      patch(queryClient, { id: unitId } as IUnitData, (current) => ({
        ...current,
        ...payload,
      }))

      return { previous }
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        restore(queryClient, context.previous)
      }
    },

    onSuccess: async () => {
      await invalidatePropertyBySlug(queryClient, property.slug)
    },
  })
}

export function useDeleteUnit(property: IProperty) {
  const queryClient = useQueryClient()
  const { snapshot, remove, restore } = getUnitsCache(property.id.toString())

  return useMutation({
    mutationKey: [UNITS_ENDPOINT, 'delete', property.id],
    mutationFn: (unitId: number) => handleDeleteUnit(property.id, unitId),

    onMutate: async (unitId) => {
      await queryClient.cancelQueries({
        queryKey: propertyKey(property.slug, 'slug'),
      })
      await queryClient.cancelQueries({ queryKey: unitsKey })

      const previous = snapshot(queryClient)

      remove(queryClient, { id: unitId } as IUnitData)

      return { previous }
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        restore(queryClient, context.previous)
      }
    },

    onSuccess: async () => {
      await invalidatePropertyBySlug(queryClient, property.slug)
    },
  })
}

export async function invalidateUnitList(
  propertyId: string,
  queryClient: QueryClient
) {
  await queryClient.invalidateQueries({
    queryKey: [...unitKey(propertyId, 'id')],
  })
}
