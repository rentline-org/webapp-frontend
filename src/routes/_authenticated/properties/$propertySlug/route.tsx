import { createFileRoute, Outlet } from '@tanstack/react-router'
import { normalizeSlug } from '@/lib/utils'

export const Route = createFileRoute(
  '/_authenticated/properties/$propertySlug'
)({
  loader: async ({ params }) => {
    // const property = await fetchPropertyBySlug(params.propertySlug)
    return { crumb: normalizeSlug(params.propertySlug) }
  },
  component: () => <Outlet />,
})
