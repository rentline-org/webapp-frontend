import type { ILeaseFilters } from '../types'

export const LEASES_ENDPOINT = '/leases' as const
export const leasesKey = [LEASES_ENDPOINT] as const
export const leaseListKey = (filters: ILeaseFilters = {}) =>
  [LEASES_ENDPOINT, 'list', filters] as const
export const leaseKey = (leaseId: number) =>
  [LEASES_ENDPOINT, 'detail', leaseId] as const
