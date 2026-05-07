import { createFileRoute, Outlet } from '@tanstack/react-router'
import { normalizeSlug } from '@/lib/utils'

type IUnitSlugSearchSchema = {
  id: number
}

export const Route = createFileRoute(
  '/_authenticated/properties/$propertySlug/units/$unitSlug'
)({
  loader: async ({ params }) => {
    return { crumb: normalizeSlug(params.unitSlug) }
  },
  component: () => <Outlet />,
  validateSearch: (search: IUnitSlugSearchSchema): IUnitSlugSearchSchema => ({
    id: search.id,
  }),
})
