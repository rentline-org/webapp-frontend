import { createFileRoute } from '@tanstack/react-router'
import OrganizationDetails from '@/features/settings/organization'

export const Route = createFileRoute('/_authenticated/settings/organization')({
  component: OrganizationDetails,
})
