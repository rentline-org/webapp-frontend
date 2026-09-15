import { describe, expect, it } from 'vitest'
import { contactFormSchema, contactTypeValues } from '.'

describe('contactFormSchema', () => {
  it.each(contactTypeValues)('accepts the %s contact type', (type) => {
    const result = contactFormSchema.parse({
      name: 'Maria Silva',
      type,
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
      email: 'not-an-email',
      phone: '',
      property_ids: [],
    })
    const valid = contactFormSchema.safeParse({
      name: 'Maria Silva',
      type: 'agent',
      email: '',
      phone: '',
      property_ids: [],
    })

    expect(invalid.success).toBe(false)
    expect(valid.success).toBe(true)
  })
})
