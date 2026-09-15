import type { DocumentType, LeaseStatus, SignatureStatus } from '../types'

export const DOCUMENT_TYPE_OPTIONS: Array<{
  value: DocumentType
  label: string
  description: string
}> = [
  {
    value: 'generic',
    label: 'Generic document',
    description: 'Records, certificates, policies, and files kept for reference.',
  },
  {
    value: 'lease',
    label: 'Lease',
    description: 'A tenancy agreement with tenant, unit, term, and rent details.',
  },
]

export const SIGNATURE_STATUS_LABELS: Record<SignatureStatus, string> = {
  not_required: 'Not required',
  pending: 'Needs signature',
  signed: 'Signed',
}

export const LEASE_STATUS_LABELS: Record<LeaseStatus, string> = {
  upcoming: 'Upcoming',
  active: 'Active',
  expired: 'Expired',
}

export const DOCUMENT_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.webp'
export const SIGNED_DOCUMENT_ACCEPT =
  '.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp'
