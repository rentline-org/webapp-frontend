import type { IContactPayload, TContactForm } from '../types'

export const toContactPayload = (values: TContactForm): IContactPayload => ({
  name: values.name.trim(),
  type: values.type,
  email: values.email.trim() || null,
  phone: values.phone.trim() || null,
  property_ids: values.property_ids,
})
