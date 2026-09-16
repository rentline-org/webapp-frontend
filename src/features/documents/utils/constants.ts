import type {
  DocumentLifecycle,
  DocumentType,
  LeaseStatus,
  SignatureStatus,
} from '../types'

export const DOCUMENT_KIND_I18N_KEYS: Record<
  DocumentType,
  | 'generic'
  | 'leaseAgreement'
  | 'leaseAddendum'
  | 'propertyManagementAgreement'
  | 'brokerageAuthorization'
  | 'inspectionReport'
  | 'insurancePolicy'
  | 'serviceContract'
  | 'complianceCertificate'
  | 'ownershipTitle'
> = {
  generic: 'generic',
  lease: 'leaseAgreement',
  lease_addendum: 'leaseAddendum',
  property_management_agreement: 'propertyManagementAgreement',
  brokerage_authorization: 'brokerageAuthorization',
  inspection_report: 'inspectionReport',
  insurance_policy: 'insurancePolicy',
  service_contract: 'serviceContract',
  compliance_certificate: 'complianceCertificate',
  ownership_record: 'ownershipTitle',
  custom: 'generic',
}

// English fallbacks keep components outside the i18n provider and older tests stable.
export const DOCUMENT_TYPE_OPTIONS: Array<{
  value: DocumentType
  label: string
  description: string
}> = [
  {
    value: 'generic',
    label: 'Generic document',
    description: 'A flexible record kept for reference or safekeeping.',
  },
  {
    value: 'lease',
    label: 'Lease agreement',
    description: 'The main agreement linked to an operational lease.',
  },
  {
    value: 'lease_addendum',
    label: 'Lease addendum',
    description: 'An effective-dated change to an existing lease.',
  },
  {
    value: 'property_management_agreement',
    label: 'Property management agreement',
    description: 'Authority, term, and fees agreed with a property owner.',
  },
  {
    value: 'brokerage_authorization',
    label: 'Brokerage or listing authorization',
    description: 'Listing authority, commission, and CRECI details.',
  },
  {
    value: 'inspection_report',
    label: 'Inspection report',
    description: 'Move-in, move-out, or routine condition evidence.',
  },
  {
    value: 'insurance_policy',
    label: 'Insurance policy',
    description: 'Coverage, premium, provider, and policy validity.',
  },
  {
    value: 'service_contract',
    label: 'Service or vendor contract',
    description: 'A supplier agreement and its recurring cost or renewal.',
  },
  {
    value: 'compliance_certificate',
    label: 'Compliance certificate',
    description: 'A certificate or permit with issue and expiry details.',
  },
  {
    value: 'ownership_record',
    label: 'Ownership or title record',
    description: 'Matrícula, registry, owner, and acquisition information.',
  },
]

export const SIGNATURE_STATUS_LABELS: Record<SignatureStatus, string> = {
  not_required: 'Not required',
  pending: 'Needs signature',
  partially_signed: 'Partially signed',
  signed: 'Signed',
  declined: 'Declined',
}

export const DOCUMENT_LIFECYCLE_LABELS: Record<DocumentLifecycle, string> = {
  draft: 'Draft',
  active: 'Active',
  superseded: 'Superseded',
  archived: 'Archived',
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
