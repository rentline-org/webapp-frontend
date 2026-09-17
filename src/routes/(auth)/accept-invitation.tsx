import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { AcceptInvitationRoute } from '@/features/organization-access/accept-invitation-route'

const searchSchema = z.object({
  token: z.string().catch(''),
})

export const Route = createFileRoute('/(auth)/accept-invitation')({
  validateSearch: searchSchema,
  component: AcceptInvitationRoute,
})
