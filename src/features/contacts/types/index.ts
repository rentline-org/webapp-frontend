import { z } from 'zod'
import type { IOperationalLease } from '@/features/leases/types'

export const contactTypeValues = ['agent', 'owner', 'tenant'] as const
export const contactIdentityKindValues = ['person', 'company'] as const
export const contactTaxIdTypeValues = ['cpf', 'cnpj'] as const
export const contactLocaleValues = ['en', 'pt-BR'] as const

export type ContactType = (typeof contactTypeValues)[number]
export type ContactIdentityKind = (typeof contactIdentityKindValues)[number]
export type ContactTaxIdType = (typeof contactTaxIdTypeValues)[number]
export type ContactLocale = (typeof contactLocaleValues)[number]

export interface IContactProperty {
  id: number
  slug: string
  title: string
  address?: string
}

export interface IContactAssignment {
  id: number
  contact_id: number
  property_id: number
  unit_id: number | null
  lease_id: number | null
  role: string
  source: 'manual' | 'lease'
  is_primary: boolean
  starts_on: string | null
  ends_on: string | null
  ownership_percentage: string | null
  property?: IContactProperty | null
  unit?: {
    id: number
    slug: string
    name: string
  } | null
  created_at: string
  updated_at: string
}

export interface IContactPortalAccess {
  linked: boolean
  invitation: {
    id: number
    email: string
    role: string
    status: 'pending' | 'accepted' | 'revoked' | 'expired'
    expires_at: string | null
    accepted_at: string | null
  } | null
}

export interface IContact {
  id: number
  organization_id: number
  user_id?: number | null
  name: string
  email: string | null
  phone: string | null
  type: ContactType
  identity_kind: ContactIdentityKind
  preferred_locale: ContactLocale
  tax_id_type: ContactTaxIdType | null
  tax_id_masked: string | null
  property_ids: number[]
  properties: IContactProperty[]
  assignments?: IContactAssignment[]
  leases?: IOperationalLease[]
  portal_access?: IContactPortalAccess
  created_at: string
  updated_at: string
}

const digitsOnly = (value: string) => value.replace(/\D/g, '')

const hasRepeatedDigits = (value: string) => /^(\d)\1+$/.test(value)

const hasValidCpfChecksum = (value: string) => {
  const digits = digitsOnly(value)
  if (digits.length !== 11 || hasRepeatedDigits(digits)) return false

  const checksum = (length: number) => {
    const total = digits
      .slice(0, length)
      .split('')
      .reduce((sum, digit, index) => sum + Number(digit) * (length + 1 - index), 0)
    const remainder = (total * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  return checksum(9) === Number(digits[9]) && checksum(10) === Number(digits[10])
}

const hasValidCnpjChecksum = (value: string) => {
  const digits = digitsOnly(value)
  if (digits.length !== 14 || hasRepeatedDigits(digits)) return false

  const checksum = (length: 12 | 13) => {
    const weights =
      length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const total = digits
      .slice(0, length)
      .split('')
      .reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0)
    const remainder = total % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  return checksum(12) === Number(digits[12]) && checksum(13) === Number(digits[13])
}

export const contactFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required.')
      .max(255, 'Name must be 255 characters or fewer.'),
    type: z.enum(contactTypeValues),
    identity_kind: z.enum(contactIdentityKindValues).default('person'),
    preferred_locale: z.enum(contactLocaleValues).default('en'),
    tax_id_type: z.enum(contactTaxIdTypeValues).nullable().default(null),
    tax_id: z.string().trim().max(30, 'Tax ID is too long.').default(''),
    email: z
      .string()
      .trim()
      .max(255, 'Email must be 255 characters or fewer.')
      .refine(
        (value) => value.length === 0 || z.email().safeParse(value).success,
        'Enter a valid email address.'
      )
      .default(''),
    phone: z
      .string()
      .trim()
      .max(50, 'Phone must be 50 characters or fewer.')
      .default(''),
    property_ids: z.array(z.number().int().positive()).default([]),
  })
  .superRefine((value, context) => {
    if (!value.tax_id) return

    if (!value.tax_id_type) {
      context.addIssue({
        code: 'custom',
        path: ['tax_id_type'],
        message: 'Select CPF or CNPJ.',
      })
      return
    }

    const isValid =
      value.tax_id_type === 'cpf'
        ? hasValidCpfChecksum(value.tax_id)
        : hasValidCnpjChecksum(value.tax_id)

    if (!isValid) {
      context.addIssue({
        code: 'custom',
        path: ['tax_id'],
        message: `Enter a valid ${value.tax_id_type.toUpperCase()}.`,
      })
    }
  })

export type TContactForm = z.infer<typeof contactFormSchema>

export interface IContactPayload {
  name: string
  type: ContactType
  email: string | null
  phone: string | null
  identity_kind: ContactIdentityKind
  preferred_locale: ContactLocale
  tax_id_type: ContactTaxIdType | null
  tax_id?: string | null
  property_ids: number[]
}

export type IContactUpdatePayload = Partial<IContactPayload>

export type TContactUpdateVariables = {
  contact: IContact
  payload: IContactUpdatePayload
}
