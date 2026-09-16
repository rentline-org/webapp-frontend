import type {
  ILeaseFinancialTerm,
  ILeaseParty,
  IOperationalLease,
  LeaseTemporalStatus,
} from './types'

export const getPrimaryTenantParty = (
  lease: IOperationalLease
): ILeaseParty | undefined =>
  lease.parties?.find(
    (party) => party.role === 'primary_tenant' || party.is_primary
  )

export const getRentTerm = (
  lease: IOperationalLease
): ILeaseFinancialTerm | undefined =>
  lease.financial_terms?.find((term) => term.type === 'rent')

export const getLeaseTemporalStatus = (
  lease: IOperationalLease
): LeaseTemporalStatus => {
  if (lease.temporal_status) return lease.temporal_status
  if (lease.status === 'active') return 'current'
  if (lease.status === 'upcoming' || lease.status === 'expired') {
    return lease.status
  }
  return 'current'
}
