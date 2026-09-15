import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  handleDelete,
  handleGet,
  handlePatch,
  handlePost,
  RentlineApi,
  type IResponse,
} from '@/api'
import { handleServerError } from '@/lib/handle-server-error'
import type {
  IDocument,
  IDocumentFile,
  IDocumentFilters,
  IDocumentUpdatePayload,
  TDocumentUpdateVariables,
} from '../types'
import {
  DOCUMENTS_ENDPOINT,
  documentKey,
  documentListKey,
  documentsKey,
  patchDocumentCaches,
  removeDocumentCaches,
} from './cache'

const getDocuments = async (
  filters: IDocumentFilters
): Promise<IDocument[]> => {
  const response = await handleGet<IResponse<IDocument[]>, IDocumentFilters>(
    DOCUMENTS_ENDPOINT,
    filters
  )

  return response.data
}

const getDocument = async (documentId: number): Promise<IDocument> => {
  const response = await handleGet<IResponse<IDocument>>(
    `${DOCUMENTS_ENDPOINT}/${documentId}`
  )

  return response.data
}

const createDocument = async (payload: FormData): Promise<IDocument> => {
  const response = await handlePost<IResponse<IDocument>, FormData>(
    DOCUMENTS_ENDPOINT,
    payload
  )

  return response.data
}

const updateDocument = async (
  documentId: number,
  payload: IDocumentUpdatePayload
): Promise<IDocument> => {
  const response = await handlePatch<
    IResponse<IDocument>,
    IDocumentUpdatePayload
  >(`${DOCUMENTS_ENDPOINT}/${documentId}`, payload)

  return response.data
}

const deleteDocument = async (documentId: number): Promise<void> => {
  await handleDelete<unknown>(`${DOCUMENTS_ENDPOINT}/${documentId}`)
}

const uploadSignedDocument = async ({
  document,
  file,
}: {
  document: IDocument
  file: File
}): Promise<IDocument> => {
  const formData = new FormData()
  formData.append('signed_file', file)
  const response = await handlePost<IResponse<IDocument>, FormData>(
    `${DOCUMENTS_ENDPOINT}/${document.id}/signature`,
    formData
  )

  return response.data
}

const removeSignedDocument = async (
  document: IDocument
): Promise<IDocument> => {
  const response = await handleDelete<IResponse<IDocument>>(
    `${DOCUMENTS_ENDPOINT}/${document.id}/signature`
  )

  return response.data
}

export function useGetDocuments(filters: IDocumentFilters = {}) {
  return useQuery({
    queryKey: documentListKey(filters),
    queryFn: () => getDocuments(filters),
  })
}

export function useGetDocument(documentId: number, enabled = true) {
  return useQuery({
    queryKey: documentKey(documentId),
    queryFn: () => getDocument(documentId),
    enabled: enabled && documentId > 0,
  })
}

export function useCreateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'create'],
    mutationFn: createDocument,
    onSuccess: async (document) => {
      queryClient.setQueryData(documentKey(document.id), document)
      await invalidateDocumentsQuery(queryClient)
    },
    onError: handleServerError,
  })
}

export function useUpdateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'update'],
    mutationFn: ({ document, payload }: TDocumentUpdateVariables) =>
      updateDocument(document.id, payload),
    onSuccess: async (document) => {
      patchDocumentCaches(queryClient, document)
      await invalidateDocumentsQuery(queryClient)
    },
    onError: handleServerError,
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'delete'],
    mutationFn: (document: IDocument) => deleteDocument(document.id),
    onMutate: async (document) => {
      await queryClient.cancelQueries({ queryKey: documentsKey })

      const previous = queryClient.getQueriesData<unknown>({
        queryKey: documentsKey,
      })
      removeDocumentCaches(queryClient, document.id)

      return { previous }
    },
    onError: (error, _document, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
      handleServerError(error)
    },
    onSettled: async () => {
      await invalidateDocumentsQuery(queryClient)
    },
  })
}

export function useUploadDocumentSignature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'signature', 'upload'],
    mutationFn: uploadSignedDocument,
    onSuccess: async (document) => {
      patchDocumentCaches(queryClient, document)
      await invalidateDocumentsQuery(queryClient)
    },
    onError: handleServerError,
  })
}

export function useRemoveDocumentSignature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'signature', 'remove'],
    mutationFn: removeSignedDocument,
    onSuccess: async (document) => {
      patchDocumentCaches(queryClient, document)
      await invalidateDocumentsQuery(queryClient)
    },
    onError: handleServerError,
  })
}

export async function downloadDocumentFile(file: IDocumentFile) {
  const response = await RentlineApi.get<Blob>(file.download_url, {
    responseType: 'blob',
  })
  const objectUrl = URL.createObjectURL(response.data)
  const anchor = window.document.createElement('a')
  anchor.href = objectUrl
  anchor.download = file.file_name
  window.document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000)
}

export async function invalidateDocumentsQuery(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: documentsKey })
}

export async function resetDocumentsQuery(queryClient: QueryClient) {
  await queryClient.cancelQueries({ queryKey: documentsKey })
  queryClient.removeQueries({ queryKey: documentsKey })
}
