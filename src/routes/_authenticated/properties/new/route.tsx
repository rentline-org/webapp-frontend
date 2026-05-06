import { createFileRoute } from '@tanstack/react-router'
import CreateProperty from '@/features/properties/create-property'

export const Route = createFileRoute('/_authenticated/properties/new')({
  component: CreateProperty,
})
