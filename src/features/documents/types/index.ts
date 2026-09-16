import { z } from 'zod'

export const documentTypeValues = [
  'generic',
  'lease',
  'lease_addendum',
  'property_management_agreement',
  'brokerage_authorization',
  'inspection_report',
  'insurance_policy',
  'service_contract',
  'compliance_certificate',
  'ownership_record',
  'custom',
] as const
export const documentLifecycleValues = [
  'draft',
  'active',
  'superseded',
  'archived',
] as const
export const signatureStatusValues = [
  'not_required',
  'pending',
  'partially_signed',
  'signed',
  'declined',
] as const
export const leaseStatusValues = ['upcoming', 'active', 'expired'] as const

export type DocumentType = (typeof documentTypeValues)[number]
export type DocumentLifecycle = (typeof documentLifecycleValues)[number]
export type SignatureStatus = (typeof signatureStatusValues)[number]
export type LeaseStatus = (typeof leaseStatusValues)[number]

export interface IDocumentKindField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'number' | 'boolean' | 'select'
  required?: boolean
  options?: Array<{ value: string; label: string }>
}

export interface IDocumentKind {
  key: string
  type: DocumentType
  custom_kind_id: number | null
  label: string
  category: string
  allowed_scopes: Array<'organization' | 'property' | 'unit' | 'lease'>
  supports_expiry: boolean
  default_requires_signature: boolean
  capabilities: string[]
  fields: IDocumentKindField[]
}

export interface IDocumentProperty {
  id: number
  slug: string
  title: string
}

export interface IDocumentUnit {
  id: number
  property_id: number
  slug: string
  name: string
}

export interface IDocumentPerson {
  id: number
  name: string
  email?: string | null
}

export interface IDocumentFile {
  id: number
  name: string
  file_name: string
  mime_type: string | null
  size: number
  download_url: string
  label?: string | null
  party_visible?: boolean
  sha256?: string | null
  uploaded_at?: string | null
}

export interface ILeaseTenant {
  id: number | null
  name: string
  email: string | null
  phone: string | null
  type: 'tenant'
}

/** Legacy lease snapshot retained by the document API for compatibility. */
export interface ILease {
  id: number
  tenant_contact_id?: number | null
  tenant?: ILeaseTenant
  property_title_snapshot?: string
  unit_name_snapshot?: string
  starts_on: string
  ends_on: string
  rent_amount: string | number
  currency: string
  security_deposit?: string | number | null
  notes?: string | null
  status: LeaseStatus | string
  reference?: string | null
}

export interface IDocumentContext {
  id: number
  context_type: 'property' | 'unit'
  property?: IDocumentProperty | null
  unit?: IDocumentUnit | null
}

export interface IDocumentParty {
  id: number
  contact_id: number | null
  role: string
  is_primary: boolean
  ownership_percentage: string | null
  contact: IDocumentPerson | null
  name_snapshot?: string | null
}

export interface IDocumentSigner {
  id: number
  contact_id: number | null
  name: string
  email: string | null
  role: string | null
  status: 'pending' | 'signed' | 'declined' | 'waived'
  signed_at: string | null
}

export interface IDocumentVersion {
  id: number
  version_number: number
  notes: string | null
  created_at: string
  files: {
    original: IDocumentFile | null
    signed: IDocumentFile | null
    supporting: IDocumentFile[]
  }
}

export interface IDocumentCapabilities {
  can_update: boolean
  can_archive: boolean
  can_manage_signatures: boolean
  can_share: boolean
  can_download: boolean
  can_create_revision?: boolean
  can_delete?: boolean
}

export interface IDocument {
  id: number
  organization_id: number
  type: DocumentType
  custom_kind_id?: number | null
  kind?: IDocumentKind | null
  title: string
  purpose: string
  description: string | null
  reference_number?: string | null
  issued_on?: string | null
  effective_on?: string | null
  expires_on?: string | null
  lifecycle?: DocumentLifecycle
  expiry_status?: 'current' | 'expiring' | 'expired' | null
  days_until_expiry?: number | null
  property_id: number | null
  property: IDocumentProperty | null
  property_ids?: number[]
  properties?: IDocumentProperty[]
  unit_id: number | null
  unit: IDocumentUnit | null
  unit_ids?: number[]
  units?: IDocumentUnit[]
  contexts?: IDocumentContext[]
  requires_signature: boolean
  is_signed: boolean
  signature_status: SignatureStatus
  signed_at: string | null
  uploaded_by: number | null
  uploader: IDocumentPerson | null
  signed_by: number | null
  signer: IDocumentPerson | null
  lease: ILease | null
  lease_links?: Array<{
    id: number
    lease_id: number
    relation_type: string
    lease?: ILease
  }>
  parties?: IDocumentParty[]
  signers?: IDocumentSigner[]
  details?: Record<string, unknown>
  files: {
    original: IDocumentFile | null
    signed: IDocumentFile | null
    supporting?: IDocumentFile[]
  }
  versions?: IDocumentVersion[]
  current_version?: IDocumentVersion | null
  capabilities?: Partial<IDocumentCapabilities>
  created_at: string
  updated_at: string
}

export interface IDocumentFilters {
  search?: string
  type?: DocumentType
  custom_kind_id?: number
  lifecycle?: DocumentLifecycle
  property_id?: number
  unit_id?: number
  lease_id?: number
  contact_id?: number
  party_role?: string
  signature_status?: SignatureStatus
  visibility?: string
  expires_from?: string
  expires_to?: string
  page?: number
  per_page?: number
  sort?: string
}

export interface IDocumentSupportingUpload {
  file: File
  label: string
  party_visible: boolean
}

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024
const DOCUMENT_EXTENSIONS = new Set([
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'csv',
  'txt',
  'jpg',
  'jpeg',
  'png',
  'webp',
])
const SIGNED_DOCUMENT_EXTENSIONS = new Set([
  'pdf',
  'doc',
  'docx',
  'jpg',
  'jpeg',
  'png',
  'webp',
])

const isFile = (value: unknown): value is File =>
  typeof File !== 'undefined' && value instanceof File

const extensionFor = (file: File) =>
  file.name.split('.').pop()?.toLowerCase() ?? ''

type TranslateValidation = (key: string) => string

const defaultValidation: TranslateValidation = (key) => {
  const messages: Record<string, string> = {
    titleRequired: 'Title is required.',
    titleMax: 'Title must be 255 characters or fewer.',
    purposeRequired: 'Purpose is required.',
    purposeMax: 'Purpose must be 500 characters or fewer.',
    descriptionMax: 'Description must be 5,000 characters or fewer.',
    primaryRequired: 'Upload the primary document.',
    signedRequired: 'Upload the final signed copy.',
    maxFileSize: 'Files must be 10 MB or smaller.',
    originalType: 'Use a PDF, Word, spreadsheet, text file, or image.',
    signedType: 'Use a PDF, Word document, or image for the signed copy.',
    tooManySupporting: 'Add no more than 20 supporting files.',
    signatureRequiresTracking:
      'Enable signature tracking before marking this as signed.',
    kindRequired: 'Select a custom document type.',
  }
  return messages[key] ?? key
}

export const documentFileError = (
  file: File | null,
  signed = false,
  t: TranslateValidation = defaultValidation
): string | null => {
  if (!file) return null
  if (file.size > MAX_DOCUMENT_SIZE) return t('maxFileSize')

  const allowed = signed ? SIGNED_DOCUMENT_EXTENSIONS : DOCUMENT_EXTENSIONS
  if (!allowed.has(extensionFor(file))) {
    return signed ? t('signedType') : t('originalType')
  }

  return null
}

const nullableFileSchema = z
  .custom<File | null>((value) => value === null || isFile(value))
  .nullable()

const supportingUploadSchema = z.object({
  file: z.custom<File>(isFile),
  label: z.string().max(255),
  party_visible: z.boolean(),
})

const documentDetailsSchema = z.object({
  provider_name: z.string(),
  policy_number: z.string(),
  coverage_amount: z.number().nullable(),
  premium_amount: z.number().nullable(),
  service_scope: z.string(),
  recurring_cost: z.number().nullable(),
  inspection_type: z.enum(['move_in', 'move_out', 'routine']).nullable(),
  inspection_date: z.string(),
  inspector_contact_id: z.number().int().positive().nullable(),
  registry_office: z.string(),
  registry_number: z.string(),
  acquisition_date: z.string(),
  fee_type: z.enum(['fixed', 'percentage']).nullable(),
  fee_value: z.number().nullable(),
  calculation_basis: z.string(),
  exclusive: z.boolean(),
  creci_number: z.string(),
  advertising_allowed: z.boolean(),
})

const documentFormBaseSchema = z.object({
  type: z.enum(documentTypeValues),
  custom_kind_id: z.number().int().positive().nullable(),
  title: z.string().trim(),
  purpose: z.string().trim(),
  description: z.string().trim(),
  reference_number: z.string().trim(),
  issued_on: z.string(),
  effective_on: z.string(),
  expires_on: z.string(),
  lifecycle: z.enum(documentLifecycleValues),
  property_id: z.number().int().positive().nullable(),
  unit_id: z.number().int().positive().nullable(),
  lease_id: z.number().int().positive().nullable(),
  requires_signature: z.boolean(),
  is_signed: z.boolean(),
  file: nullableFileSchema,
  signed_file: nullableFileSchema,
  supporting_files: z.array(supportingUploadSchema),
  signer_contact_ids: z.array(z.number().int().positive()),
  details: documentDetailsSchema,
})

export type TDocumentForm = z.infer<typeof documentFormBaseSchema>

export const createDocumentFormSchema = (
  originalFileRequired: boolean,
  t: TranslateValidation = defaultValidation
) =>
  documentFormBaseSchema.superRefine((value, context) => {
    if (!value.title) {
      context.addIssue({
        code: 'custom',
        path: ['title'],
        message: t('titleRequired'),
      })
    } else if (value.title.length > 255) {
      context.addIssue({
        code: 'custom',
        path: ['title'],
        message: t('titleMax'),
      })
    }

    if (!value.purpose) {
      context.addIssue({
        code: 'custom',
        path: ['purpose'],
        message: t('purposeRequired'),
      })
    } else if (value.purpose.length > 500) {
      context.addIssue({
        code: 'custom',
        path: ['purpose'],
        message: t('purposeMax'),
      })
    }

    if (value.description.length > 5000) {
      context.addIssue({
        code: 'custom',
        path: ['description'],
        message: t('descriptionMax'),
      })
    }

    if (originalFileRequired && !value.file) {
      context.addIssue({
        code: 'custom',
        path: ['file'],
        message: t('primaryRequired'),
      })
    }

    const originalError = documentFileError(value.file, false, t)
    if (originalError) {
      context.addIssue({ code: 'custom', path: ['file'], message: originalError })
    }

    const signedError = documentFileError(value.signed_file, true, t)
    if (signedError) {
      context.addIssue({
        code: 'custom',
        path: ['signed_file'],
        message: signedError,
      })
    }

    value.supporting_files.forEach((upload, index) => {
      const error = documentFileError(upload.file, false, t)
      if (error) {
        context.addIssue({
          code: 'custom',
          path: ['supporting_files', index, 'file'],
          message: error,
        })
      }
    })

    if (value.supporting_files.length > 20) {
      context.addIssue({
        code: 'custom',
        path: ['supporting_files'],
        message: t('tooManySupporting'),
      })
    }

    if (value.is_signed && !value.requires_signature) {
      context.addIssue({
        code: 'custom',
        path: ['is_signed'],
        message: t('signatureRequiresTracking'),
      })
    }

    if (value.is_signed && !value.signed_file) {
      context.addIssue({
        code: 'custom',
        path: ['signed_file'],
        message: t('signedRequired'),
      })
    }

    if (value.type === 'custom' && !value.custom_kind_id) {
      context.addIssue({
        code: 'custom',
        path: ['custom_kind_id'],
        message: t('kindRequired'),
      })
    }
  })

export interface IDocumentUpdatePayload {
  title: string
  purpose: string
  description: string | null
  reference_number?: string | null
  issued_on?: string | null
  effective_on?: string | null
  expires_on?: string | null
  lifecycle?: DocumentLifecycle
  requires_signature: boolean
  property_id?: number | null
  unit_id?: number | null
  details?: Record<string, string | number | boolean | null>
}

export type TDocumentUpdateVariables = {
  document: IDocument
  payload: IDocumentUpdatePayload
}

export interface IDocumentUploadVariables {
  payload: FormData
  onProgress?: (progress: number) => void
  signal?: AbortSignal
}
