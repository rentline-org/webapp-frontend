/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {
  applyOptimisticDelete,
  applyOptimisticUpdate,
  restoreOptimisticData,
} from '@/api/cache'
import { invalidatePropertyBySlug } from '@/features/properties/query'
import {
  PROPERTIES_ENDPOINT,
  propertiesKey,
} from '@/features/properties/query/cache'
import { type IProperty } from '@/features/properties/types'
import type { IUnitData, TCreateUnitSchema, IUpdateUnitInput } from '../types'
import { unitKey, UNITS_ENDPOINT, unitsKey } from './cache'

async function handleGetUnits(propertyId: number) {
  const res = await handleGet<IResponse<IUnitData[]>>(
    `${PROPERTIES_ENDPOINT}/${propertyId.toString()}${UNITS_ENDPOINT}`
  )

  return res.data
}

async function handleGetUnitBySlug(propertyId: number, unitId: number) {
  const res = await handleGet<IResponse<IUnitData>>(
    `${PROPERTIES_ENDPOINT}/${propertyId.toString()}${UNITS_ENDPOINT}/${unitId.toString()}`
  )

  return res.data
}

export function useGetUnits(propertyId: number) {
  return useQuery({
    queryKey: [...unitKey(propertyId.toString(), 'id')],
    queryFn: async () => await handleGetUnits(propertyId),
  })
}

export function useGetUnitBySlug(propertyId: number, unitId: number) {
  return useQuery({
    queryKey: [UNITS_ENDPOINT, 'detail', propertyId, unitId],
    queryFn: async () => await handleGetUnitBySlug(propertyId, unitId),
    enabled: !!propertyId && !!unitId,
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
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [...unitKey(property.id.toString(), 'id'), 'create'],
    mutationFn: (payload: TCreateUnitSchema) =>
      handleCreateUnit(property.id, payload),
    onSuccess: async (result) => {
      // Instantly add to the property's units list cache
      applyOptimisticUpdate<IProperty>({
        queryClient,
        queryKey: propertiesKey,
        matchValue: property.id,
        updater: (p) => {
          const updated = { ...p }
          if (Array.isArray(updated.units)) {
            updated.units = [result, ...updated.units]
          }
          return updated
        },
      })

      // Instantly add to the units list cache
      queryClient.setQueryData(
        [...unitKey(property.id.toString(), 'id')],
        (old: any) => {
          if (Array.isArray(old)) return [result, ...old]
          return [result]
        }
      )
    },
  })
}

export function useUpdateUnit(property: IProperty) {
  const queryClient = useQueryClient()

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
      await queryClient.cancelQueries({ queryKey: propertiesKey })
      await queryClient.cancelQueries({ queryKey: unitsKey })

      // Optimistically update all instances where this unit exists by itself
      const previousUnits = applyOptimisticUpdate<IUnitData>({
        queryClient,
        queryKey: unitsKey,
        matchValue: unitId,
        updater: (old) => ({ ...old, ...payload }),
      })

      // Optimistically update properties that might contain this unit
      const previousProperties = applyOptimisticUpdate<
        IProperty & { unit?: IUnitData | null }
      >({
        queryClient,
        queryKey: propertiesKey,
        matchValue: property.id,
        updater: (p) => {
          const updated = { ...p }
          if (Array.isArray(updated.units)) {
            updated.units = updated.units.map((u) =>
              u.id === unitId ? { ...u, ...payload } : u
            )
          }
          if (updated.unit && updated.unit.id === unitId) {
            updated.unit = { ...updated.unit, ...payload } as IUnitData
          }
          return updated
        },
      })

      return { previousProperties, previousUnits }
    },

    onError: (_error, _variables, context) => {
      if (context?.previousProperties) {
        restoreOptimisticData(queryClient, context.previousProperties)
      }
      if (context?.previousUnits) {
        restoreOptimisticData(queryClient, context.previousUnits)
      }
    },

    onSuccess: async () => {
      await invalidatePropertyBySlug(queryClient, property.slug)
      await queryClient.invalidateQueries({ queryKey: unitsKey })
    },
  })
}

export function useDeleteUnit(property: IProperty) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [UNITS_ENDPOINT, 'delete', property.id],
    mutationFn: (unitId: number) => handleDeleteUnit(property.id, unitId),

    onMutate: async (unitId) => {
      await queryClient.cancelQueries({ queryKey: propertiesKey })
      await queryClient.cancelQueries({ queryKey: unitsKey })

      // Optimistically delete from units queries
      const previousUnits = applyOptimisticDelete<IUnitData>({
        queryClient,
        queryKey: unitsKey,
        matchValue: unitId,
      })

      // Optimistically delete from properties queries that contain the unit
      const previousProperties = applyOptimisticUpdate<
        IProperty & { unit?: IUnitData | null }
      >({
        queryClient,
        queryKey: propertiesKey,
        matchValue: property.id,
        updater: (p) => {
          const updated = { ...p }
          if (Array.isArray(updated.units)) {
            updated.units = updated.units.filter((u) => u.id !== unitId)
          }
          if (updated.unit && updated.unit.id === unitId) {
            updated.unit = null
          }
          return updated
        },
      })

      return { previousProperties, previousUnits }
    },

    onError: (_error, _variables, context) => {
      if (context?.previousProperties) {
        restoreOptimisticData(queryClient, context.previousProperties)
      }
      if (context?.previousUnits) {
        restoreOptimisticData(queryClient, context.previousUnits)
      }
    },

    onSuccess: async () => {
      await invalidatePropertyBySlug(queryClient, property.slug)
      await queryClient.invalidateQueries({ queryKey: unitsKey })
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

export async function invalidateUnitById(
  propertyId: string,
  unitId: string,
  queryClient: QueryClient
) {
  await queryClient.invalidateQueries({
    queryKey: [UNITS_ENDPOINT, 'detail', propertyId, unitId],
  })
}
