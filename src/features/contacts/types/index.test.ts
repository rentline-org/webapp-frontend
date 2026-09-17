import { describe, expect, it } from 'vitest'
import { contactFormSchema, contactTypeValues } from '.'

describe('contactFormSchema', () => {
  it.each(contactTypeValues)('accepts the %s contact type', (type) => {
    const result = contactFormSchema.parse({
      name: 'Maria Silva',
      type,
      identity_kind: 'person',
      preferred_locale: 'pt-BR',
      tax_id_type: null,
      tax_id: '',
      email: '',
      phone: '',
      property_ids: [10, 20],
    })

    expect(result.type).toBe(type)
    expect(result.property_ids).toEqual([10, 20])
  })

  it('rejects a blank name', () => {
    const result = contactFormSchema.safeParse({
      name: '   ',
      type: 'owner',
      identity_kind: 'person',
      preferred_locale: 'en',
      tax_id_type: null,
      tax_id: '',
      email: '',
      phone: '',
      property_ids: [],
    })

    expect(result.success).toBe(false)
  })

  it('rejects an invalid email and accepts an empty email', () => {
    const invalid = contactFormSchema.safeParse({
      name: 'Maria Silva',
      type: 'agent',
      identity_kind: 'person',
      preferred_locale: 'en',
      tax_id_type: null,
      tax_id: '',
      email: 'not-an-email',
      phone: '',
      property_ids: [],
    })
    const valid = contactFormSchema.safeParse({
      name: 'Maria Silva',
      type: 'agent',
      identity_kind: 'person',
      preferred_locale: 'en',
      tax_id_type: null,
      tax_id: '',
      email: '',
      phone: '',
      property_ids: [],
    })

    expect(invalid.success).toBe(false)
    expect(valid.success).toBe(true)
  })

  it('validates Brazilian tax ID checksums when an identifier is provided', () => {
    const cpf = contactFormSchema.safeParse({
      name: 'Maria Silva',
      type: 'tenant',
      identity_kind: 'person',
      preferred_locale: 'pt-BR',
      tax_id_type: 'cpf',
      tax_id: '529.982.247-25',
      email: '',
      phone: '',
      property_ids: [],
    })
    const invalidCnpj = contactFormSchema.safeParse({
      name: 'Imobiliária Exemplo',
      type: 'agent',
      identity_kind: 'company',
      preferred_locale: 'pt-BR',
      tax_id_type: 'cnpj',
      tax_id: '11.111.111/1111-11',
      email: '',
      phone: '',
      property_ids: [],
    })

    expect(cpf.success).toBe(true)
    expect(invalidCnpj.success).toBe(false)
  })
})
