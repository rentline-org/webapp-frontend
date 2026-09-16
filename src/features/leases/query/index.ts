import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { handleGet, handlePatch, handlePost, type IResponse } from '@/api'
import {
  normalizePaginatedResponse,
  type IPaginatedData,
} from '@/api/pagination'
import { handleServerError } from '@/lib/handle-server-error'
import { documentsKey } from '@/features/documents/query/cache'
import type {
  ILeaseFilters,
  ILeasePayload,
  ILeaseRenewalPayload,
  ILeaseTerminatePayload,
  IOperationalLease,
} from '../types'
import { LEASES_ENDPOINT, leaseKey, leaseListKey, leasesKey } from './cache'

const getLeases = async (
  filters: ILeaseFilters
): Promise<IPaginatedData<IOperationalLease>> => {
  const response = await handleGet<unknown, ILeaseFilters>(
    LEASES_ENDPOINT,
    filters
  )
  return normalizePaginatedResponse<IOperationalLease>(
    response,
    filters.page,
    filters.per_page
  )
}

const getLease = async (leaseId: number): Promise<IOperationalLease> => {
  const response = await handleGet<IResponse<IOperationalLease>>(
    `${LEASES_ENDPOINT}/${leaseId}`
  )
  return response.data
}

const createLease = async (payload: ILeasePayload) => {
  const response = await handlePost<
    IResponse<IOperationalLease>,
    ILeasePayload
  >(LEASES_ENDPOINT, payload)
  return response.data
}

const renewLease = async ({
  lease,
  payload,
}: {
  lease: IOperationalLease
  payload: ILeaseRenewalPayload
}) => {
  const response = await handlePost<
    IResponse<IOperationalLease>,
    ILeaseRenewalPayload
  >(`${LEASES_ENDPOINT}/${lease.id}/renewals`, payload)
  return response.data
}

const activateLease = async (lease: IOperationalLease) => {
  const response = await handlePost<IResponse<IOperationalLease>>(
    `${LEASES_ENDPOINT}/${lease.id}/activation`
  )
  return response.data
}

const terminateLease = async ({
  lease,
  payload,
}: {
  lease: IOperationalLease
  payload: ILeaseTerminatePayload
}) => {
  const response = await handlePost<
    IResponse<IOperationalLease>,
    ILeaseTerminatePayload
  >(`${LEASES_ENDPOINT}/${lease.id}/termination`, payload)
  return response.data
}

const cancelLease = async (lease: IOperationalLease) => {
  const response = await handlePost<IResponse<IOperationalLease>>(
    `${LEASES_ENDPOINT}/${lease.id}/cancellation`
  )
  return response.data
}

export function useGetLeases(filters: ILeaseFilters = {}) {
  return useQuery({
    queryKey: leaseListKey(filters),
    queryFn: () => getLeases(filters),
  })
}

export function useGetLease(leaseId: number, enabled = true) {
  return useQuery({
    queryKey: leaseKey(leaseId),
    queryFn: () => getLease(leaseId),
    enabled: enabled && leaseId > 0,
  })
}

const invalidateLeaseDomain = async (
  queryClient: ReturnType<typeof useQueryClient>,
  lease?: IOperationalLease
) => {
  if (lease) queryClient.setQueryData(leaseKey(lease.id), lease)
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: leasesKey }),
    queryClient.invalidateQueries({ queryKey: documentsKey }),
    queryClient.invalidateQueries({ queryKey: ['/properties'] }),
  ])
}

export function useCreateLease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [...leasesKey, 'create'],
    mutationFn: createLease,
    onSuccess: (lease) => invalidateLeaseDomain(queryClient, lease),
    onError: handleServerError,
  })
}

export function useRenewLease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [...leasesKey, 'renew'],
    mutationFn: renewLease,
    onSuccess: (lease) => invalidateLeaseDomain(queryClient, lease),
    onError: handleServerError,
  })
}

export function useActivateLease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [...leasesKey, 'activate'],
    mutationFn: activateLease,
    onSuccess: (lease) => invalidateLeaseDomain(queryClient, lease),
    onError: handleServerError,
  })
}

export function useTerminateLease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [...leasesKey, 'terminate'],
    mutationFn: terminateLease,
    onSuccess: (lease) => invalidateLeaseDomain(queryClient, lease),
    onError: handleServerError,
  })
}

export function useCancelLease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [...leasesKey, 'cancel'],
    mutationFn: cancelLease,
    onSuccess: (lease) => invalidateLeaseDomain(queryClient, lease),
    onError: handleServerError,
  })
}

export function useUpdateLease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [...leasesKey, 'update'],
    mutationFn: async ({
      lease,
      payload,
    }: {
      lease: IOperationalLease
      payload: Partial<ILeasePayload>
    }) => {
      const response = await handlePatch<
        IResponse<IOperationalLease>,
        Partial<ILeasePayload>
      >(`${LEASES_ENDPOINT}/${lease.id}`, payload)
      return response.data
    },
    onSuccess: (lease) => invalidateLeaseDomain(queryClient, lease),
    onError: handleServerError,
  })
}
