import { createFileRoute } from '@tanstack/react-router'
import UnitDetails from '@/features/units/unit-details'

export const Route = createFileRoute(
  '/_authenticated/properties/$propertySlug/units/$unitSlug/'
)({
  component: UnitDetails,
})
