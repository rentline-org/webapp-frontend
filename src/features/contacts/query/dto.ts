import type { IContact, IContactPayload, TContactForm } from '../types'

export const toContactPayload = (
  values: TContactForm,
  existing?: IContact | null
): IContactPayload => {
  const taxId = values.tax_id.trim()

  return {
    name: values.name.trim(),
    type: values.type,
    identity_kind: values.identity_kind,
    preferred_locale: values.preferred_locale,
    tax_id_type: values.tax_id_type,
    ...(taxId
      ? { tax_id: taxId }
      : existing?.tax_id_masked &&
          values.tax_id_type === existing.tax_id_type
        ? {}
        : { tax_id: null }),
    email: values.email.trim() || null,
    phone: values.phone.trim() || null,
    property_ids: values.property_ids,
  }
}
