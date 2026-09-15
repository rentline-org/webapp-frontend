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
  formData.append('title', values.title.trim())
  formData.append('purpose', values.purpose.trim())
  appendNullable(formData, 'description', values.description)
  formData.append('requires_signature', values.requires_signature ? '1' : '0')
  formData.append('is_signed', values.is_signed ? '1' : '0')

  if (values.property_id) {
    formData.append('property_id', String(values.property_id))
  }
  if (values.unit_id) {
    formData.append('unit_id', String(values.unit_id))
  }
  if (values.file) formData.append('file', values.file)
  if (values.signed_file) formData.append('signed_file', values.signed_file)

  if (values.type === 'lease') {
    formData.append(
      'lease[tenant_contact_id]',
      String(values.lease.tenant_contact_id)
    )
    formData.append('lease[starts_on]', values.lease.starts_on)
    formData.append('lease[ends_on]', values.lease.ends_on)
    formData.append('lease[rent_amount]', String(values.lease.rent_amount))
    if (values.lease.security_deposit !== null) {
      formData.append(
        'lease[security_deposit]',
        String(values.lease.security_deposit)
      )
    }
    appendNullable(formData, 'lease[notes]', values.lease.notes)
  }

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
    requires_signature:
      document.type === 'lease' ? true : values.requires_signature,
  }

  if (document.is_signed) return payload

  payload.property_id = values.property_id
  payload.unit_id = values.unit_id

  if (
    values.type === 'lease' &&
    values.lease.tenant_contact_id &&
    values.lease.rent_amount !== null
  ) {
    payload.lease = {
      tenant_contact_id: values.lease.tenant_contact_id,
      starts_on: values.lease.starts_on,
      ends_on: values.lease.ends_on,
      rent_amount: values.lease.rent_amount,
      security_deposit: values.lease.security_deposit,
      notes: values.lease.notes.trim() || null,
    }
  }

  return payload
}
