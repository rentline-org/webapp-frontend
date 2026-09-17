import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { DocumentDetails } from '@/features/documents/document-details'

const documentDetailsSearchSchema = z.object({
  tab: z.enum(['overview', 'files', 'parties', 'activity']).optional(),
})

export const Route = createFileRoute('/_authenticated/documents/$documentId/')({
  validateSearch: documentDetailsSearchSchema,
  component: DocumentDetails,
})
