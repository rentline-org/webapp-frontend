import { createFileRoute } from '@tanstack/react-router'
import PropertyDetails from '@/features/properties/property-details'

export const Route = createFileRoute('/_authenticated/properties/$propertyId')({
  component: PropertyDetails,
})
