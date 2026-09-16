import type {
  ILeasePayload,
  ILeaseRenewalPayload,
  TLeaseForm,
} from '../types'

const decimalString = (value: number) => value.toFixed(2)

export const toLeasePayload = (values: TLeaseForm): ILeasePayload => {
  if (
    !values.property_id ||
    !values.unit_id ||
    !values.primary_tenant_contact_id ||
    values.rent_amount === null
  ) {
    throw new Error('Lease form is incomplete.')
  }

  const parties: ILeasePayload['parties'] = [
    {
      contact_id: values.primary_tenant_contact_id,
      role: 'primary_tenant',
      is_primary: true,
    },
  ]

  if (values.guarantee_type === 'guarantor' && values.guarantor_contact_id) {
    parties.push({
      contact_id: values.guarantor_contact_id,
      role: 'guarantor',
      is_primary: false,
    })
  }

  const financialTerms: ILeasePayload['financial_terms'] = [
    {
      type: 'rent',
      calculation: 'fixed',
      amount: decimalString(values.rent_amount),
      currency: values.currency,
      frequency: values.rent_frequency,
      due_day: values.payment_due_day,
      effective_from: values.starts_on,
      effective_to: values.ends_on,
      is_liability: false,
    },
  ]

  if (values.guarantee_amount !== null) {
    financialTerms.push({
      type: 'security_deposit',
      calculation: 'fixed',
      amount: decimalString(values.guarantee_amount),
      currency: values.currency,
      frequency: 'one_time',
      due_day: null,
      effective_from: values.starts_on,
      effective_to: values.ends_on,
      is_liability: true,
    })
  }

  return {
    title: values.title.trim(),
    property_id: values.property_id,
    unit_id: values.unit_id,
    starts_on: values.starts_on,
    ends_on: values.ends_on,
    currency: values.currency,
    guarantee_type: values.guarantee_type,
    notes: values.notes.trim() || null,
    parties,
    financial_terms: financialTerms,
  }
}

export const toLeaseRenewalPayload = (
  values: TLeaseForm
): ILeaseRenewalPayload => {
  const payload = toLeasePayload(values)
  return {
    title: payload.title,
    starts_on: payload.starts_on,
    ends_on: payload.ends_on,
    notes: payload.notes,
    parties: payload.parties,
    financial_terms: payload.financial_terms,
  }
}
