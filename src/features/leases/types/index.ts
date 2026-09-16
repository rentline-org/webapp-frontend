import { z } from 'zod'

export const leaseWorkflowStatusValues = [
  'draft',
  'active',
  'terminated',
  'cancelled',
] as const
export const leaseTemporalStatusValues = [
  'upcoming',
  'current',
  'expired',
] as const
export const rentFrequencyValues = [
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
] as const
export const rentalGuaranteeValues = [
  'cash_deposit',
  'guarantor',
  'rental_guarantee_insurance',
  'investment_fund_quotas',
] as const

export type LeaseWorkflowStatus = (typeof leaseWorkflowStatusValues)[number]
export type LeaseTemporalStatus = (typeof leaseTemporalStatusValues)[number]
export type RentFrequency = (typeof rentFrequencyValues)[number]
export type RentalGuarantee = (typeof rentalGuaranteeValues)[number]

export interface ILeaseProperty {
  id: number
  slug: string
  title: string
}

export interface ILeaseUnit {
  id: number
  property_id: number
  slug: string
  name: string
  occupancy_status?: 'vacant' | 'reserved' | 'occupied'
}

export interface ILeaseContact {
  id: number | null
  name: string
  email?: string | null
  phone?: string | null
}

export interface ILeaseParty {
  id: number
  contact_id: number | null
  role:
    | 'primary_tenant'
    | 'co_tenant'
    | 'occupant'
    | 'guarantor'
    | 'owner'
    | 'manager'
    | 'agent'
  is_primary: boolean
  contact?: ILeaseContact | null
  name_snapshot: string
  email_snapshot?: string | null
  starts_on?: string | null
  ends_on?: string | null
}

export interface ILeaseFinancialTerm {
  id: number
  type:
    | 'rent'
    | 'security_deposit'
    | 'management_fee'
    | 'commission'
    | 'insurance_premium'
    | 'service_cost'
  calculation: 'fixed' | 'percentage'
  amount: string | null
  percentage: string | null
  currency: string | null
  frequency: 'one_time' | RentFrequency
  calculation_basis: string | null
  due_day: number | null
  effective_from: string | null
  effective_to: string | null
  is_liability: boolean
}

export interface IOperationalLease {
  id: number
  organization_id: number
  property_id: number
  property: ILeaseProperty | null
  unit_id: number
  unit: ILeaseUnit | null
  title: string
  reference?: string | null
  tenant_contact_id: number | null
  tenant?: ILeaseContact | null
  primary_tenant?: ILeaseContact | null
  starts_on: string
  ends_on: string
  workflow_status: LeaseWorkflowStatus
  temporal_status: LeaseTemporalStatus
  status?: LeaseTemporalStatus | 'active'
  rent_amount: string
  currency: string
  rent_frequency?: RentFrequency
  payment_due_day?: number | null
  security_deposit: string | null
  guarantee_type: RentalGuarantee | null
  activated_at: string | null
  terminated_on: string | null
  termination_reason: string | null
  renewed_from_id: number | null
  renewal_id?: number | null
  days_until_expiry?: number | null
  notes: string | null
  parties: ILeaseParty[]
  financial_terms: ILeaseFinancialTerm[]
  documents_count?: number
  capabilities?: {
    can_update?: boolean
    can_activate?: boolean
    can_terminate?: boolean
    can_cancel?: boolean
    can_renew?: boolean
  }
  created_at: string
  updated_at: string
}

export interface ILeaseFilters {
  search?: string
  workflow_status?: LeaseWorkflowStatus
  temporal_status?: LeaseTemporalStatus
  property_id?: number
  unit_id?: number
  contact_id?: number
  expiring_within_days?: number
  expires_from?: string
  expires_to?: string
  page?: number
  per_page?: number
  sort?: string
}

const nullablePositiveNumber = z.number().int().positive().nullable()

const leaseFormBaseSchema = z.object({
  title: z.string().trim().max(255),
  property_id: nullablePositiveNumber,
  unit_id: nullablePositiveNumber,
  primary_tenant_contact_id: nullablePositiveNumber,
  guarantor_contact_id: nullablePositiveNumber,
  starts_on: z.string(),
  ends_on: z.string(),
  rent_amount: z.number().nonnegative().nullable(),
  currency: z.string().length(3),
  rent_frequency: z.enum(rentFrequencyValues),
  payment_due_day: z.number().int().min(1).max(31).nullable(),
  guarantee_type: z.enum(rentalGuaranteeValues).nullable(),
  guarantee_amount: z.number().nonnegative().nullable(),
  notes: z.string().trim().max(5000),
})

export type TLeaseForm = z.infer<typeof leaseFormBaseSchema>

type TranslateValidation = (key: string) => string

const defaultValidation: TranslateValidation = (key) => key

export const createLeaseFormSchema = (
  t: TranslateValidation = defaultValidation
) =>
  leaseFormBaseSchema.superRefine((value, context) => {
    if (!value.property_id) {
      context.addIssue({
        code: 'custom',
        path: ['property_id'],
        message: t('propertyRequired'),
      })
    }
    if (!value.unit_id) {
      context.addIssue({
        code: 'custom',
        path: ['unit_id'],
        message: t('unitRequired'),
      })
    }
    if (!value.primary_tenant_contact_id) {
      context.addIssue({
        code: 'custom',
        path: ['primary_tenant_contact_id'],
        message: t('tenantRequired'),
      })
    }
    if (!value.starts_on) {
      context.addIssue({
        code: 'custom',
        path: ['starts_on'],
        message: t('startRequired'),
      })
    }
    if (!value.ends_on) {
      context.addIssue({
        code: 'custom',
        path: ['ends_on'],
        message: t('endRequired'),
      })
    }
    if (value.starts_on && value.ends_on && value.ends_on <= value.starts_on) {
      context.addIssue({
        code: 'custom',
        path: ['ends_on'],
        message: t('endAfterStart'),
      })
    }
    if (value.rent_amount === null) {
      context.addIssue({
        code: 'custom',
        path: ['rent_amount'],
        message: t('rentRequired'),
      })
    }
    if (
      value.guarantee_type === 'cash_deposit' &&
      value.guarantee_amount !== null &&
      value.rent_amount !== null &&
      value.guarantee_amount > value.rent_amount * 3
    ) {
      context.addIssue({
        code: 'custom',
        path: ['guarantee_amount'],
        message: t('cashDepositLimit'),
      })
    }
    if (value.guarantee_type === 'guarantor' && !value.guarantor_contact_id) {
      context.addIssue({
        code: 'custom',
        path: ['guarantor_contact_id'],
        message: t('guarantorRequired'),
      })
    }
  })

export interface ILeasePayload {
  title: string
  property_id: number
  unit_id: number
  starts_on: string
  ends_on: string
  currency: string
  guarantee_type: RentalGuarantee | null
  notes: string | null
  parties: Array<{
    contact_id: number
    role: 'primary_tenant' | 'guarantor'
    is_primary: boolean
  }>
  financial_terms: Array<{
    type: 'rent' | 'security_deposit'
    calculation: 'fixed'
    amount: string
    currency: string
    frequency: 'one_time' | RentFrequency
    due_day: number | null
    effective_from: string
    effective_to: string
    is_liability: boolean
  }>
}

export type ILeaseRenewalPayload = Pick<
  ILeasePayload,
  'title' | 'starts_on' | 'ends_on' | 'notes' | 'parties' | 'financial_terms'
>

export interface ILeaseTerminatePayload {
  terminated_on?: string
  reason: string
}
