import type {
  IDocument,
  IDocumentUpdatePayload,
  TDocumentForm,
} from '../types'

const appendNullable = (formData: FormData, key: string, value: string) => {
  formData.append(key, value.trim())
}

export const toDocumentFormData = (values: TDocumentForm): FormData => {
  const formData = new FormData()

  formData.append('type', values.type)
  if (values.custom_kind_id) {
    formData.append('custom_kind_id', String(values.custom_kind_id))
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

  values.signer_contact_ids.forEach((contactId, index) => {
    formData.append(`signers[${index}][contact_id]`, String(contactId))
  })

  Object.entries(values.details).forEach(([key, value]) => {
    if (value === null || value === '') return
    formData.append(`details[${key}]`, typeof value === 'boolean' ? (value ? '1' : '0') : String(value))
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
    lifecycle: values.lifecycle,
    requires_signature:
      document.type === 'lease' ? true : values.requires_signature,
    details: Object.fromEntries(
      Object.entries(values.details).map(([key, value]) => [
        key,
        value === '' ? null : value,
      ])
    ),
  }

  if (document.is_signed) return payload

  payload.property_id = values.property_id
  payload.unit_id = values.unit_id

  return payload
}
