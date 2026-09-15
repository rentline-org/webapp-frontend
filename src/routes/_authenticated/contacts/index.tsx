import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Contacts } from '@/features/contacts'
import { contactTypeValues } from '@/features/contacts/types'

const contactsSearchSchema = z.object({
  filter: z.string().optional().catch(''),
  type: z.enum(contactTypeValues).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/contacts/')({
  validateSearch: contactsSearchSchema,
  component: Contacts,
})
