import type { IDocument, IDocumentUpdatePayload, TDocumentForm } from '../types'

const appendNullable = (formData: FormData, key: string, value: string) => {
  formData.append(key, value.trim())
}

const detailKeysByType: Partial<
  Record<IDocument['type'], Array<keyof TDocumentForm['details']>>
> = {
  lease_addendum: ['change_summary'],
  property_management_agreement: [
    'management_fee_type',
    'management_fee_value',
  ],
  brokerage_authorization: [
    'exclusive',
    'commission_type',
    'commission_value',
    'calculation_basis',
    'advertising_permitted',
    'creci_reference',
  ],
  inspection_report: ['inspection_type', 'inspected_on', 'outcome'],
  insurance_policy: [
    'provider',
    'policy_number',
    'coverage_amount',
    'premium_amount',
    'deductible_amount',
    'currency',
  ],
  service_contract: [
    'service_scope',
    'recurring_cost',
    'currency',
    'frequency',
  ],
  compliance_certificate: ['issuer', 'certificate_number'],
  ownership_record: [
    'registry_office',
    'registration_number',
    'acquisition_date',
  ],
}

const selectedDetails = (values: TDocumentForm) =>
  (detailKeysByType[values.type] ?? []).reduce<
    Record<string, string | number | boolean>
  >((result, key) => {
    const value = values.details[key]
    if (value !== null && value !== '') result[key] = value
    return result
  }, {})

export const toDocumentFormData = (values: TDocumentForm): FormData => {
  const formData = new FormData()

  formData.append('type', values.type)
  if (values.custom_kind_id) {
    formData.append('document_kind_id', String(values.custom_kind_id))
  }
  formData.append('title', values.title.trim())
  formData.append('purpose', values.purpose.trim())
  appendNullable(formData, 'description', values.description)
  formData.append('requires_signature', values.requires_signature ? '1' : '0')
  formData.append('is_signed', values.is_signed ? '1' : '0')
  formData.append('lifecycle', values.lifecycle)
  appendNullable(formData, 'reference_number', values.reference_number)
  appendNullable(formData, 'issued_on', values.issued_on)
  appendNullable(formData, 'effective_on', values.effective_on)
  appendNullable(formData, 'expires_on', values.expires_on)

  if (values.property_id) {
    formData.append('property_id', String(values.property_id))
  }
  if (values.unit_id) {
    formData.append('unit_id', String(values.unit_id))
  }
  if (values.file) formData.append('file', values.file)
  if (values.signed_file) formData.append('signed_file', values.signed_file)

  values.supporting_files.forEach((upload) => {
    formData.append('supporting_files[]', upload.file)
    formData.append('supporting_labels[]', upload.label.trim())
    formData.append(
      'supporting_party_visible[]',
      upload.party_visible ? '1' : '0'
    )
  })

  if (values.lease_id) {
    formData.append('lease_links[0][lease_id]', String(values.lease_id))
    formData.append(
      'lease_links[0][relation_type]',
      values.type === 'lease_addendum' ? 'addendum' : 'agreement'
    )
  }

  const parties = values.parties.filter(
    (party): party is typeof party & { contact_id: number } =>
      party.contact_id !== null
  )
  parties.forEach((party, index) => {
    formData.append(`parties[${index}][contact_id]`, String(party.contact_id))
    formData.append(`parties[${index}][role]`, party.role)
    formData.append(
      `parties[${index}][is_primary]`,
      party.is_primary ? '1' : '0'
    )
  })

  values.signer_contact_ids.forEach((contactId, index) => {
    formData.append(`signers[${index}][contact_id]`, String(contactId))
    const party = parties.find((item) => item.contact_id === contactId)
    formData.append(`signers[${index}][role]`, party?.role ?? 'other')
  })

  Object.entries(selectedDetails(values)).forEach(([key, value]) => {
    formData.append(
      `details[${key}]`,
      typeof value === 'boolean' ? (value ? '1' : '0') : String(value)
    )
  })

  return formData
}

export const toDocumentUpdatePayload = (
  values: TDocumentForm,
  document: IDocument
): IDocumentUpdatePayload => {
  const payload: IDocumentUpdatePayload = {
    title: values.title.trim(),
    purpose: values.purpose.trim(),
    description: values.description.trim() || null,
    reference_number: values.reference_number.trim() || null,
    issued_on: values.issued_on || null,
    effective_on: values.effective_on || null,
    expires_on: values.expires_on || null,
    requires_signature:
      document.type === 'lease' ? true : values.requires_signature,
  }

  const details = selectedDetails(values)
  if (!document.is_signed && document.lifecycle !== 'active') {
    payload.details = details
    payload.parties = values.parties.filter(
      (party): party is typeof party & { contact_id: number } =>
        party.contact_id !== null
    )
  }

  if (document.is_signed) return payload

  payload.property_id = values.property_id
  payload.unit_id = values.unit_id

  return payload
}
