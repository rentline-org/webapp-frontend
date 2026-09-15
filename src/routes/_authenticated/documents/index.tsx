import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Documents } from '@/features/documents'
import {
  documentTypeValues,
  signatureStatusValues,
} from '@/features/documents/types'

const documentsSearchSchema = z.object({
  filter: z.string().optional().catch(''),
  type: z.enum(documentTypeValues).optional().catch(undefined),
  signature: z.enum(signatureStatusValues).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/documents/')({
  validateSearch: documentsSearchSchema,
  component: Documents,
})
