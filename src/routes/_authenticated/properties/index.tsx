import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Properties } from '@/features/properties'

const appsSearchSchema = z.object({
  type: z
    .enum(['all', 'single_unit', 'multi_unit', 'land'])
    .optional()
    .catch(undefined),
  filter: z.string().optional().catch(''),
  sort: z
    .enum(['newly_added', 'name_asc', 'name_desc'])
    .optional()
    .catch(undefined),
})

export const Route = createFileRoute('/_authenticated/properties/')({
  validateSearch: appsSearchSchema,
  component: Properties,
  staticData: {
    breadcrumbKey: 'properties',
  },
})
