import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ContactDetails } from '@/features/contacts/contact-details'

const contactDetailsSearchSchema = z.object({
  tab: z
    .enum(['overview', 'assignments', 'leases', 'documents'])
    .optional()
    .catch('overview'),
})

export const Route = createFileRoute(
  '/_authenticated/contacts/$contactId/'
)({
  validateSearch: contactDetailsSearchSchema,
  component: ContactDetails,
})
