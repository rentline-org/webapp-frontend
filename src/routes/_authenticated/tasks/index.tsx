import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Tasks } from '@/features/tasks'
import type { ActionItemType } from '@/features/operations/types'

const actionItemTypes = [
  'lease_expiry',
  'document_expiry',
  'pending_signature',
  'missing_move_in_inspection',
  'expired_insurance',
  'expired_compliance',
] as const satisfies readonly ActionItemType[]

const taskSearchSchema = z.object({
  status: z.enum(['open', 'completed', 'dismissed']).optional().catch('open'),
  type: z.enum(actionItemTypes).optional().catch(undefined),
  page: z.coerce.number().int().positive().optional().catch(1),
  perPage: z.coerce.number().int().min(10).max(50).optional().catch(20),
})

export const Route = createFileRoute('/_authenticated/tasks/')({
  validateSearch: taskSearchSchema,
  component: Tasks,
})
