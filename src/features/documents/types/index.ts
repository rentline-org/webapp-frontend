import { z } from 'zod'

export const documentTypeValues = ['generic', 'lease'] as const
export const signatureStatusValues = [
  'not_required',
  'pending',
  'signed',
] as const
export const leaseStatusValues = ['upcoming', 'active', 'expired'] as const

export type DocumentType = (typeof documentTypeValues)[number]
export type SignatureStatus = (typeof signatureStatusValues)[number]
export type LeaseStatus = (typeof leaseStatusValues)[number]

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
}

export interface IDocumentFile {
  id: number
  name: string
  file_name: string
  mime_type: string | null
  size: number
  download_url: string
}

export interface ILeaseTenant {
  id: number | null
  name: string
  email: string | null
  phone: string | null
  type: 'tenant'
}

export interface ILease {
  id: number
  tenant_contact_id: number | null
  tenant: ILeaseTenant
  property_title_snapshot: string
  unit_name_snapshot: string
  starts_on: string
  ends_on: string
  rent_amount: number
  currency: string
  security_deposit: number | null
  notes: string | null
  status: LeaseStatus
}

export interface IDocument {
  id: number
  organization_id: number
  type: DocumentType
  title: string
  purpose: string
  description: string | null
  property_id: number | null
  property: IDocumentProperty | null
  unit_id: number | null
  unit: IDocumentUnit | null
  requires_signature: boolean
  is_signed: boolean
  signature_status: SignatureStatus
  signed_at: string | null
  uploaded_by: number | null
  uploader: IDocumentPerson | null
  signed_by: number | null
  signer: IDocumentPerson | null
  lease: ILease | null
  files: {
    original: IDocumentFile | null
    signed: IDocumentFile | null
  }
  created_at: string
  updated_at: string
}

export interface IDocumentFilters {
  search?: string
  type?: DocumentType
  property_id?: number
  unit_id?: number
  signature_status?: SignatureStatus
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

export const documentFileError = (
  file: File | null,
  signed = false
): string | null => {
  if (!file) return null
  if (file.size > MAX_DOCUMENT_SIZE) return 'Files must be 10 MB or smaller.'

  const allowed = signed ? SIGNED_DOCUMENT_EXTENSIONS : DOCUMENT_EXTENSIONS
  if (!allowed.has(extensionFor(file))) {
    return signed
      ? 'Use a PDF, Word document, or image for the signed copy.'
      : 'Use a PDF, Word, spreadsheet, text file, or image.'
  }

  return null
}

const nullableFileSchema = z
  .custom<File | null>((value) => value === null || isFile(value))
  .nullable()

const documentFormBaseSchema = z.object({
  type: z.enum(documentTypeValues),
  title: z
    .string()
    .trim()
    .min(1, 'Title is required.')
    .max(255, 'Title must be 255 characters or fewer.'),
  purpose: z
    .string()
    .trim()
    .min(1, 'Purpose is required.')
    .max(500, 'Purpose must be 500 characters or fewer.'),
  description: z
    .string()
    .trim()
    .max(5000, 'Description must be 5,000 characters or fewer.'),
  property_id: z.number().int().positive().nullable(),
  unit_id: z.number().int().positive().nullable(),
  requires_signature: z.boolean(),
  is_signed: z.boolean(),
  file: nullableFileSchema,
  signed_file: nullableFileSchema,
  lease: z.object({
    tenant_contact_id: z.number().int().positive().nullable(),
    starts_on: z.string(),
    ends_on: z.string(),
    rent_amount: z.number().min(0, 'Rent cannot be negative.').nullable(),
    security_deposit: z
      .number()
      .min(0, 'Security deposit cannot be negative.')
      .nullable(),
    notes: z
      .string()
      .trim()
      .max(5000, 'Notes must be 5,000 characters or fewer.'),
  }),
})

export type TDocumentForm = z.infer<typeof documentFormBaseSchema>

export const createDocumentFormSchema = (originalFileRequired: boolean) =>
  documentFormBaseSchema.superRefine((value, context) => {
    if (originalFileRequired && !value.file) {
      context.addIssue({
        code: 'custom',
        path: ['file'],
        message: 'Upload the original document.',
      })
    }

    const originalError = documentFileError(value.file)
    if (originalError) {
      context.addIssue({
        code: 'custom',
        path: ['file'],
        message: originalError,
      })
    }

    const signedError = documentFileError(value.signed_file, true)
    if (signedError) {
      context.addIssue({
        code: 'custom',
        path: ['signed_file'],
        message: signedError,
      })
    }

    if (value.is_signed && !value.requires_signature) {
      context.addIssue({
        code: 'custom',
        path: ['is_signed'],
        message: 'Enable signature requirements before marking this as signed.',
      })
    }

    if (value.is_signed && !value.signed_file) {
      context.addIssue({
        code: 'custom',
        path: ['signed_file'],
        message: 'Upload the signed copy.',
      })
    }

    if (value.type !== 'lease') return

    if (!value.property_id) {
      context.addIssue({
        code: 'custom',
        path: ['property_id'],
        message: 'Select the leased property.',
      })
    }
    if (!value.unit_id) {
      context.addIssue({
        code: 'custom',
        path: ['unit_id'],
        message: 'Select the leased unit.',
      })
    }
    if (!value.lease.tenant_contact_id) {
      context.addIssue({
        code: 'custom',
        path: ['lease', 'tenant_contact_id'],
        message: 'Select the tenant on this lease.',
      })
    }
    if (!value.lease.starts_on) {
      context.addIssue({
        code: 'custom',
        path: ['lease', 'starts_on'],
        message: 'Start date is required.',
      })
    }
    if (!value.lease.ends_on) {
      context.addIssue({
        code: 'custom',
        path: ['lease', 'ends_on'],
        message: 'End date is required.',
      })
    }
    if (
      value.lease.starts_on &&
      value.lease.ends_on &&
      value.lease.ends_on <= value.lease.starts_on
    ) {
      context.addIssue({
        code: 'custom',
        path: ['lease', 'ends_on'],
        message: 'End date must be after the start date.',
      })
    }
    if (value.lease.rent_amount === null) {
      context.addIssue({
        code: 'custom',
        path: ['lease', 'rent_amount'],
        message: 'Rent amount is required.',
      })
    }
  })

export interface IDocumentUpdatePayload {
  title: string
  purpose: string
  description: string | null
  requires_signature: boolean
  property_id?: number | null
  unit_id?: number | null
  lease?: {
    tenant_contact_id: number
    starts_on: string
    ends_on: string
    rent_amount: number
    security_deposit: number | null
    notes: string | null
  }
}

export type TDocumentUpdateVariables = {
  document: IDocument
  payload: IDocumentUpdatePayload
}
