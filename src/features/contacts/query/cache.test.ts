import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import type { IContact } from '../types'
import { contactKey, contactsKey, getContactCache } from './cache'

const contact: IContact = {
  id: 12,
  organization_id: 3,
  name: 'Maria Silva',
  email: 'maria@example.com',
  phone: null,
  type: 'owner',
  identity_kind: 'person',
  preferred_locale: 'pt-BR',
  tax_id_type: 'cpf',
  tax_id_masked: '***.***.***-1234',
  property_ids: [7],
  properties: [
    {
      id: 7,
      slug: 'ocean-house',
      title: 'Ocean House',
      address: '1 Coast Road',
    },
  ],
  created_at: '2026-09-15T12:00:00.000Z',
  updated_at: '2026-09-15T12:00:00.000Z',
}

describe('contact cache', () => {
  it('patches list and detail caches and restores the snapshot', () => {
    const queryClient = new QueryClient()
    const cache = getContactCache(contact.id)
    queryClient.setQueryData(contactsKey, [contact])
    queryClient.setQueryData(contactKey(contact.id), contact)
    const snapshot = cache.snapshot(queryClient)

    cache.patch(queryClient, contact, (current) => ({
      ...current,
      name: 'Maria Santos',
    }))

    expect(queryClient.getQueryData<IContact[]>(contactsKey)?.[0].name).toBe(
      'Maria Santos'
    )
    expect(
      queryClient.getQueryData<IContact>(contactKey(contact.id))?.name
    ).toBe('Maria Santos')

    cache.restore(queryClient, snapshot)

    expect(queryClient.getQueryData<IContact[]>(contactsKey)?.[0]).toEqual(
      contact
    )
    expect(queryClient.getQueryData(contactKey(contact.id))).toEqual(contact)
  })

  it('removes the contact from list and detail caches and can roll back', () => {
    const queryClient = new QueryClient()
    const cache = getContactCache(contact.id)
    queryClient.setQueryData(contactsKey, [contact])
    queryClient.setQueryData(contactKey(contact.id), contact)
    const snapshot = cache.snapshot(queryClient)

    cache.remove(queryClient, contact)

    expect(queryClient.getQueryData(contactsKey)).toEqual([])
    expect(queryClient.getQueryData(contactKey(contact.id))).toBeUndefined()

    cache.restore(queryClient, snapshot)

    expect(queryClient.getQueryData(contactsKey)).toEqual([contact])
    expect(queryClient.getQueryData(contactKey(contact.id))).toEqual(contact)
  })
})
