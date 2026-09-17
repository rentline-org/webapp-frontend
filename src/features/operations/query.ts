import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { handleGet, handlePatch, type IResponse } from '@/api'
import { normalizePaginatedResponse } from '@/api/pagination'
import { handleServerError } from '@/lib/handle-server-error'
import type { IActionItem } from './types'

export const actionItemsKey = ['action-items'] as const

export interface ActionItemFilters {
  status?: IActionItem['status']
  type?: IActionItem['type']
  property_id?: number
  unit_id?: number
  lease_id?: number
  document_id?: number
  due_before?: string
  page?: number
  per_page?: number
}

export function useGetActionItems(filters: ActionItemFilters = {}) {
  return useQuery({
    queryKey: [...actionItemsKey, filters],
    queryFn: async () => {
      const response = await handleGet<unknown, ActionItemFilters>(
        '/action-items',
        filters
      )
      return normalizePaginatedResponse<IActionItem>(
        response,
        filters.page,
        filters.per_page
      )
    },
  })
}

export function useUpdateActionItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [...actionItemsKey, 'update'],
    mutationFn: async ({
      item,
      status,
    }: {
      item: IActionItem
      status: IActionItem['status']
    }) => {
      const response = await handlePatch<
        IResponse<IActionItem>,
        { status: IActionItem['status'] }
      >(`/action-items/${item.id}`, { status })
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: actionItemsKey })
    },
    onError: handleServerError,
  })
}
