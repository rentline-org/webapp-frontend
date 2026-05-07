import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import PropertyDetails from '@/features/properties/property-details'

export const Route = createFileRoute(
  '/_authenticated/properties/$propertySlug/'
)({
  validateSearch: z.object({
    tab: z.enum(['overview', 'units', 'leases', 'contacts', 'accounting']).optional().catch('overview'),
  }),
  component: PropertyDetails,
})
