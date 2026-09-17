import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { handleGet, handlePost } from '@/api'
import { normalizePaginatedResponse } from '@/api/pagination'
import { handleServerError } from '@/lib/handle-server-error'
import { NOTIFICATIONS_ENDPOINT, notificationsListKey } from './cache'

export interface IOperationsNotification {
  id: string
  type: string
  data: {
    organization_id: number
    title: string
    count: number
    action_items: Array<{
      id: number
      type: string
      title: string
      due_on: string | null
    }>
  }
  read_at: string | null
  created_at: string
}

export function useGetNotifications() {
  return useQuery({
    queryKey: notificationsListKey,
    queryFn: async () => {
      const response = await handleGet<unknown, { per_page: number }>(
        NOTIFICATIONS_ENDPOINT,
        { per_page: 50 }
      )
      return normalizePaginatedResponse<IOperationsNotification>(
        response,
        1,
        50
      )
    },
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) =>
      handlePost(`${NOTIFICATIONS_ENDPOINT}/${notificationId}/read`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationsListKey })
    },
    onError: handleServerError,
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => handlePost(`${NOTIFICATIONS_ENDPOINT}/read-all`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationsListKey })
    },
    onError: handleServerError,
  })
}
