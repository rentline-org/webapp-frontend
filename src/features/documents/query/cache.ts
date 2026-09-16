import type { QueryClient } from '@tanstack/react-query'
import type { IPaginatedData } from '@/api/pagination'
import type { IDocument, IDocumentFilters } from '../types'

export const DOCUMENTS_ENDPOINT = '/documents' as const
export const DOCUMENT_KINDS_ENDPOINT = '/document-kinds' as const
export const documentsKey = [DOCUMENTS_ENDPOINT] as const
export const documentKindsKey = [DOCUMENT_KINDS_ENDPOINT] as const
export const documentListKey = (filters: IDocumentFilters = {}) =>
  [DOCUMENTS_ENDPOINT, 'list', filters] as const
export const documentKey = (documentId: number) =>
  [DOCUMENTS_ENDPOINT, 'detail', documentId] as const

export function patchDocumentCaches(
  queryClient: QueryClient,
  document: IDocument
) {
  queryClient.setQueriesData<IPaginatedData<IDocument>>(
    { queryKey: documentsKey },
    (current) =>
      current
        ? {
            ...current,
            items: current.items.map((item) =>
              item.id === document.id ? document : item
            ),
          }
        : current
  )
  queryClient.setQueryData(documentKey(document.id), document)
}

export function removeDocumentCaches(
  queryClient: QueryClient,
  documentId: number
) {
  queryClient.setQueriesData<IPaginatedData<IDocument>>(
    { queryKey: documentsKey },
    (current) =>
      current
        ? {
            ...current,
            items: current.items.filter((item) => item.id !== documentId),
            meta: {
              ...current.meta,
              total: Math.max(0, current.meta.total - 1),
            },
          }
        : current
  )
  queryClient.removeQueries({ queryKey: documentKey(documentId), exact: true })
}
