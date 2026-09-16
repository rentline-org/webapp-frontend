import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Leases } from '@/features/leases'
import {
  leaseTemporalStatusValues,
  leaseWorkflowStatusValues,
} from '@/features/leases/types'

const leaseSearchSchema = z.object({
  filter: z.string().optional().catch(''),
  status: z.enum(leaseWorkflowStatusValues).optional().catch(undefined),
  timing: z.enum(leaseTemporalStatusValues).optional().catch(undefined),
  page: z.coerce.number().int().positive().optional().catch(1),
  perPage: z.coerce.number().int().min(10).max(50).optional().catch(20),
})

export const Route = createFileRoute('/_authenticated/leases/')({
  validateSearch: leaseSearchSchema,
  component: Leases,
})
