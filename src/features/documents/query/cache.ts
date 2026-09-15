import type { QueryClient } from '@tanstack/react-query'
import type { IDocument, IDocumentFilters } from '../types'

export const DOCUMENTS_ENDPOINT = '/documents' as const
export const documentsKey = [DOCUMENTS_ENDPOINT] as const
export const documentListKey = (filters: IDocumentFilters = {}) =>
  [DOCUMENTS_ENDPOINT, 'list', filters] as const
export const documentKey = (documentId: number) =>
  [DOCUMENTS_ENDPOINT, 'detail', documentId] as const

export function patchDocumentCaches(
  queryClient: QueryClient,
  document: IDocument
) {
  queryClient.setQueriesData<IDocument[]>(
    { queryKey: documentsKey },
    (current) =>
      Array.isArray(current)
        ? current.map((item) =>
            item.id === document.id ? document : item
          )
        : current
  )
  queryClient.setQueryData(documentKey(document.id), document)
}

export function removeDocumentCaches(
  queryClient: QueryClient,
  documentId: number
) {
  queryClient.setQueriesData<IDocument[]>(
    { queryKey: documentsKey },
    (current) =>
      Array.isArray(current)
        ? current.filter((item) => item.id !== documentId)
        : current
  )
  queryClient.removeQueries({ queryKey: documentKey(documentId), exact: true })
}
