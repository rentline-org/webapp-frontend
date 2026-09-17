import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Documents } from '@/features/documents'
import {
  documentLifecycleValues,
  documentTypeValues,
  signatureStatusValues,
} from '@/features/documents/types'

const documentsSearchSchema = z.object({
  filter: z.string().optional().catch(''),
  type: z.enum(documentTypeValues).optional().catch(undefined),
  signature: z.enum(signatureStatusValues).optional().catch(undefined),
  lifecycle: z.enum(documentLifecycleValues).optional().catch(undefined),
  page: z.coerce.number().int().positive().optional().catch(1),
  perPage: z.coerce.number().int().min(10).max(50).optional().catch(20),
})

export const Route = createFileRoute('/_authenticated/documents/')({
  validateSearch: documentsSearchSchema,
  component: Documents,
})
