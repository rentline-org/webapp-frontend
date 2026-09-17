import { describe, expect, it } from 'vitest'
import { toContactPayload } from './dto'

describe('toContactPayload', () => {
  it('trims values and normalizes blank contact details to null', () => {
    const payload = toContactPayload({
      name: '  Maria Silva  ',
      type: 'tenant',
      identity_kind: 'person',
      preferred_locale: 'pt-BR',
      tax_id_type: 'cpf',
      tax_id: ' 529.982.247-25 ',
      email: '   ',
      phone: '  +55 11 99999-9999  ',
      property_ids: [4],
    })

    expect(payload).toEqual({
      name: 'Maria Silva',
      type: 'tenant',
      identity_kind: 'person',
      preferred_locale: 'pt-BR',
      tax_id_type: 'cpf',
      tax_id: '529.982.247-25',
      email: null,
      phone: '+55 11 99999-9999',
      property_ids: [4],
    })
  })
})
