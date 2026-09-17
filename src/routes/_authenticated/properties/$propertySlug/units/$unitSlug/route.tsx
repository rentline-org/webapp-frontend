import { createFileRoute, Outlet } from '@tanstack/react-router'
import { z } from 'zod'
import { normalizeSlug } from '@/lib/utils'

export const Route = createFileRoute(
  '/_authenticated/properties/$propertySlug/units/$unitSlug'
)({
  loader: async ({ params }) => {
    return { crumb: normalizeSlug(params.unitSlug) }
  },
  component: () => <Outlet />,
  validateSearch: z.object({
    id: z.coerce.number().int().positive(),
    tab: z
      .enum(['overview', 'leases', 'documents', 'contacts', 'accounting'])
      .optional()
      .catch('overview'),
  }),
})
