import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  handleDelete,
  handleGet,
  handlePatch,
  handlePost,
  type IResponse,
} from '@/api'
import { handleServerError } from '@/lib/handle-server-error'
import { propertiesKey } from '@/features/properties/query/cache'
import type { IProperty } from '@/features/properties/types'
import type {
  IContact,
  IContactPayload,
  TContactUpdateVariables,
} from '../types'
import {
  CONTACTS_ENDPOINT,
  contactKey,
  contactsKey,
  getContactCache,
} from './cache'

async function getContacts(): Promise<IContact[]> {
  const response = await handleGet<IResponse<IContact[]>>(CONTACTS_ENDPOINT)

  return response.data
}

async function getContact(contactId: number): Promise<IContact> {
  const response = await handleGet<IResponse<IContact>>(
    `${CONTACTS_ENDPOINT}/${contactId}`
  )

  return response.data
}

async function createContact(payload: IContactPayload): Promise<IContact> {
  const response = await handlePost<IResponse<IContact>, IContactPayload>(
    CONTACTS_ENDPOINT,
    payload
  )

  return response.data
}

async function updateContact(
  contactId: number,
  payload: Partial<IContactPayload>
): Promise<IContact> {
  const response = await handlePatch<
    IResponse<IContact>,
    Partial<IContactPayload>
  >(`${CONTACTS_ENDPOINT}/${contactId}`, payload)

  return response.data
}

async function deleteContact(contactId: number): Promise<void> {
  await handleDelete<unknown>(`${CONTACTS_ENDPOINT}/${contactId}`)
}

const buildOptimisticContact = (
  contact: IContact,
  payload: Partial<IContactPayload>,
  properties: IProperty[] | undefined
): IContact => {
  const propertyIds = payload.property_ids

  return {
    ...contact,
    ...payload,
    properties: propertyIds
      ? (properties ?? [])
          .filter((property) => propertyIds.includes(property.id))
          .map((property) => ({
            id: property.id,
            slug: property.slug,
            title: property.title,
            address: property.address,
          }))
      : contact.properties,
    property_ids: propertyIds ?? contact.property_ids,
    updated_at: new Date().toISOString(),
  }
}

export function useGetContacts() {
  return useQuery({
    queryKey: contactsKey,
    queryFn: getContacts,
  })
}

export function useGetContact(contactId: number, enabled = true) {
  return useQuery({
    queryKey: contactKey(contactId),
    queryFn: () => getContact(contactId),
    enabled: enabled && contactId > 0,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...contactsKey, 'create'],
    mutationFn: createContact,
    onSuccess: (contact) => {
      queryClient.setQueryData<IContact[]>(contactsKey, (current = []) => [
        contact,
        ...current.filter((item) => item.id !== contact.id),
      ])
    },
    onError: handleServerError,
    onSettled: async () => {
      await invalidateContactsQuery(queryClient)
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...contactsKey, 'update'],
    mutationFn: ({ contact, payload }: TContactUpdateVariables) =>
      updateContact(contact.id, payload),
    onMutate: async ({ contact, payload }) => {
      await queryClient.cancelQueries({ queryKey: contactsKey })

      const properties = queryClient.getQueryData<IProperty[]>(propertiesKey)
      const contactCache = getContactCache(contact.id)
      const previousContacts = contactCache.snapshot(queryClient)
      const optimisticContact = buildOptimisticContact(
        contact,
        payload,
        properties
      )
      contactCache.patch(queryClient, contact, () => optimisticContact)

      return { previousContacts }
    },
    onError: (error, variables, context) => {
      if (context?.previousContacts) {
        getContactCache(variables.contact.id).restore(
          queryClient,
          context.previousContacts
        )
      }

      handleServerError(error)
    },
    onSuccess: (contact) => {
      getContactCache(contact.id).patch(queryClient, contact, () => contact)
    },
    onSettled: async () => {
      await invalidateContactsQuery(queryClient)
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...contactsKey, 'delete'],
    mutationFn: (contact: IContact) => deleteContact(contact.id),
    onMutate: async (contact) => {
      await queryClient.cancelQueries({ queryKey: contactsKey })

      const contactCache = getContactCache(contact.id)
      const previousContacts = contactCache.snapshot(queryClient)
      contactCache.remove(queryClient, contact)

      return { previousContacts }
    },
    onError: (error, contact, context) => {
      if (context?.previousContacts) {
        getContactCache(contact.id).restore(
          queryClient,
          context.previousContacts
        )
      }

      handleServerError(error)
    },
    onSettled: async () => {
      await invalidateContactsQuery(queryClient)
    },
  })
}

export async function invalidateContactsQuery(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: contactsKey })
}

export async function resetContactsQuery(queryClient: QueryClient) {
  await queryClient.resetQueries({ queryKey: contactsKey })
}
