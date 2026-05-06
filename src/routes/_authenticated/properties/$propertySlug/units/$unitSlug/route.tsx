import { createFileRoute, Outlet } from '@tanstack/react-router'
import { normalizeSlug } from '@/lib/utils'

export const Route = createFileRoute(
  '/_authenticated/properties/$propertySlug/units/$unitSlug'
)({
  loader: async ({ params }) => {
    return { crumb: normalizeSlug(params.unitSlug) }
  },
  component: () => <Outlet />,
})
