import { createOptimisticCache, itemCache, listCache } from '@/api/cache'
import type { IContact } from '../types'

export const CONTACTS_ENDPOINT = '/contacts' as const

export const contactsKey = [CONTACTS_ENDPOINT] as const
export const contactKey = (contactId: number) =>
  [CONTACTS_ENDPOINT, 'detail', contactId] as const

export const getContactCache = (contactId: number) => {
  const cache = createOptimisticCache<IContact, 'id'>({
    caches: {
      list: listCache(contactsKey),
      detail: itemCache(contactKey(contactId)),
    },
    matchBy: 'id',
  })

  return {
    ...cache,
    remove(queryClient: Parameters<typeof cache.remove>[0], contact: IContact) {
      cache.remove(queryClient, contact)

      // Returning undefined from setQueryData leaves existing data untouched,
      // so remove the detail query explicitly. The snapshot can still restore
      // it if the mutation fails.
      queryClient.removeQueries({
        queryKey: contactKey(contact.id),
        exact: true,
      })
    },
  }
}
